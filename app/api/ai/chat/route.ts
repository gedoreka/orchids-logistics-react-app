import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { analyzeMessage, generateAIResponse } from "@/lib/ai";
import { searchKnowledgeBase, incrementArticleUsage } from "@/lib/knowledge-base";

export async function POST(request: NextRequest) {
  try {
    const { message, company_id, sender_role } = await request.json();

    if (!message || !company_id) {
      return NextResponse.json({ error: "بيانات غير مكتملة" }, { status: 400 });
    }

    // 1. Get or create active conversation
    let conversation = await query<any>(
      "SELECT * FROM conversations WHERE company_id = ? AND status != 'closed' ORDER BY created_at DESC LIMIT 1",
      [company_id]
    );

    let conversationId;
    if (conversation.length === 0) {
      const result = await execute(
        "INSERT INTO conversations (company_id, status) VALUES (?, 'active')",
        [company_id]
      );
      conversationId = result.insertId;
    } else {
      conversationId = conversation[0].id;
    }

    // 2. Save user message
    await execute(
      "INSERT INTO chat_messages (company_id, conversation_id, sender_role, message) VALUES (?, ?, ?, ?)",
      [company_id, conversationId, sender_role || "client", message]
    );

    // 3. AI Router Logic
    if (sender_role === "admin") {
      // If admin sends a message, just save it and update conversation status if needed
      return NextResponse.json({ success: true, handled_by: 'human' });
    }

    // Analyze message
    const analysis = await analyzeMessage(message);

    // 4. Decision: Human or AI?
    const conversationStatus = conversation[0]?.status || 'active';
    
    if (analysis.request_human) {
      await execute(
        "UPDATE conversations SET status = 'pending_human', needs_human = 1, escalated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [conversationId]
      );
      return NextResponse.json({ 
        success: true, 
        handled_by: 'human',
        action: 'escalated',
        message: "تم تحويل طلبك لممثل بشري، يرجى الانتظار."
      });
    }

    // 5. Generate AI Response
    // Search Knowledge Base
    const kbResults = await searchKnowledgeBase(message, analysis.language);
    
    let aiResult;
    try {
      aiResult = await generateAIResponse(message, {
        knowledge_base: kbResults,
        analysis: analysis,
        conversation_history: []
      });
    } catch (aiError) {
      console.error("AI Generation failed, using KB fallback:", aiError);
      // Fallback: If AI fails, use the best KB result if available
      if (kbResults.length > 0) {
        aiResult = {
          text: `🤖 مساعد الدعم الذكي: وجدت هذه المعلومات المتعلقة بطلبك:\n\n${kbResults[0].answer}`,
          confidence: 0.8
        };
      } else {
        throw aiError; // Re-throw if no KB results to fallback to
      }
    }

    // If conversation was pending human but AI is very confident, we still allow the AI to respond
    // to keep the user engaged, unless they specifically asked for a human in this message.

    // 6. Save AI Message
    await execute(
      "INSERT INTO chat_messages (company_id, conversation_id, sender_role, message, is_ai, ai_confidence) VALUES (?, ?, 'admin', ?, 1, ?)",
      [company_id, conversationId, aiResult.text, aiResult.confidence]
    );

    // 7. Update Conversation Stats
    if (aiResult.confidence < 0.6) {
      await execute(
        "UPDATE conversations SET status = 'pending_human', needs_human = 1, escalated_at = CURRENT_TIMESTAMP, ai_handled = 1 WHERE id = ?",
        [conversationId]
      );
    } else {
      await execute(
        "UPDATE conversations SET ai_handled = 1, ai_confidence = ? WHERE id = ?",
        [aiResult.confidence, conversationId]
      );
    }

    return NextResponse.json({
      success: true,
      handled_by: 'ai',
      response: aiResult.text,
      confidence: aiResult.confidence
    });

  } catch (error) {
    console.error("Hybrid Chat Error:", error);
    return NextResponse.json({ error: "حدث خطأ في النظام" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");

    if (!companyId) {
      return NextResponse.json({ error: "رقم الشركة مطلوب" }, { status: 400 });
    }

    const messages = await query(
      "SELECT * FROM chat_messages WHERE company_id = ? ORDER BY created_at ASC",
      [companyId]
    );

    const conversation = await query(
      "SELECT * FROM conversations WHERE company_id = ? AND status != 'closed' ORDER BY created_at DESC LIMIT 1",
      [companyId]
    );

    return NextResponse.json({ 
      messages, 
      conversation: conversation[0] || null 
    });
  } catch (error) {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

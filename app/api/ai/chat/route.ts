import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { analyzeMessage, generateAIResponse } from "@/lib/ai";
import { searchKnowledgeBase, incrementArticleUsage } from "@/lib/knowledge-base";

export async function POST(request: NextRequest) {
  try {
    const { message, company_id, sender_role, ticket_id, message_type, file_path } = await request.json();

    if (!company_id) {
      return NextResponse.json({ error: "بيانات غير مكتملة" }, { status: 400 });
    }

    // 1. Validate Ticket
    let currentTicketId = ticket_id;
    if (!currentTicketId) {
      // Find latest active ticket
      const activeTickets = await query<any>(
        "SELECT id FROM support_tickets WHERE company_id = ? AND expires_at > NOW() AND status = 'open' ORDER BY created_at DESC LIMIT 1",
        [company_id]
      );
      if (activeTickets.length > 0) {
        currentTicketId = activeTickets[0].id;
      } else if (sender_role !== 'admin') {
        return NextResponse.json({ error: "لا توجد تذكرة نشطة. يرجى فتح تذكرة جديدة.", needs_new_ticket: true }, { status: 403 });
      }
    }

    // 2. Get or create conversation (legacy support)
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

    // 3. Save message
    const msgResult = await execute(
      "INSERT INTO chat_messages (company_id, conversation_id, sender_role, message, message_type, file_path, ticket_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [company_id, conversationId, sender_role || "client", message || "", message_type || "text", file_path || null, currentTicketId]
    );

    // 4. Handle Admin Message
    if (sender_role === "admin") {
      // Mark all client messages as read when admin responds
      await execute(
        "UPDATE chat_messages SET is_read = 1 WHERE company_id = ? AND sender_role = 'client' AND is_read = 0",
        [company_id]
      );
      return NextResponse.json({ success: true, handled_by: 'human', message_id: msgResult.insertId });
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
          company_id: company_id,
          knowledge_base: kbResults,
          analysis: analysis,
          conversation_history: []
        });

        // Check for low confidence or "I don't know" style responses
        if (aiResult.confidence < 0.4) {
          aiResult.text = "أعتذر منك، لم أتمكن من العثور على إجابة دقيقة لطلبك. 🧐 تم تحويل طلبك لفريق الدعم البشري لمساعدتك بشكل أفضل.";
        }
      } catch (aiError) {
        console.error("AI Generation failed, using KB fallback:", aiError);
        // Fallback: If AI fails, use the best KB result if available
        if (kbResults.length > 0 && kbResults[0].confidence > 0.7) {
          aiResult = {
            text: kbResults[0].answer,
            confidence: 0.8
          };
        } else {
          aiResult = {
            text: "انتظرنا قليلاً سيتم الرد عليك بأسرع وقت عبر فريق الدعم الخاص بنا.",
            confidence: 0.4
          };
        }
      }

    // If conversation was pending human but AI is very confident, we still allow the AI to respond
    // to keep the user engaged, unless they specifically asked for a human in this message.

    // 6. Save AI Message
    await execute(
      "INSERT INTO chat_messages (company_id, conversation_id, sender_role, message, is_ai, ai_confidence, buttons) VALUES (?, ?, 'admin', ?, 1, ?, ?)",
      [company_id, conversationId, aiResult.text, aiResult.confidence, JSON.stringify(aiResult.buttons || [])]
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
      confidence: aiResult.confidence,
      buttons: aiResult.buttons || []
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

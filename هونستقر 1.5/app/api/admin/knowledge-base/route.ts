import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const articles = await query("SELECT * FROM knowledge_base ORDER BY created_at DESC");
    return NextResponse.json({ articles });
  } catch (error) {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { category, question, answer, keywords, language } = await request.json();
    
    if (!question || !answer) {
      return NextResponse.json({ error: "السؤال والجواب مطلوبان" }, { status: 400 });
    }

    const result = await execute(
      "INSERT INTO knowledge_base (category, question, answer, keywords, language) VALUES (?, ?, ?, ?, ?)",
      [category || "general", question, answer, JSON.stringify(keywords || []), language || "ar"]
    );

    return NextResponse.json({ success: true, id: result.insertId });
  } catch (error) {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID مطلوب" }, { status: 400 });

    await execute("DELETE FROM knowledge_base WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

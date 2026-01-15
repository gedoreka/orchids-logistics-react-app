import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";

async function ensureChatTable() {
  try {
      await execute(`
        CREATE TABLE IF NOT EXISTS chat_messages (
          id INT AUTO_INCREMENT PRIMARY KEY,
          company_id INT NOT NULL,
          sender_role ENUM('admin', 'client') NOT NULL,
          message TEXT NOT NULL,
          file_path VARCHAR(500) NULL,
          message_type ENUM('text', 'image', 'audio', 'video', 'file') DEFAULT 'text',
          is_read TINYINT(1) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
  } catch (e) {
    console.log("Table might already exist");
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureChatTable();
    
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");
    const action = searchParams.get("action");

    if (action === "unread_count") {
      const result = await query<{ count: number }>(
        "SELECT COUNT(*) as count FROM chat_messages WHERE sender_role = 'client' AND is_read = 0"
      );
      return NextResponse.json({ unread_count: result[0]?.count || 0 });
    }

    if (companyId) {
      const messages = await query(
        `SELECT * FROM chat_messages WHERE company_id = ? ORDER BY created_at ASC`,
        [companyId]
      );

      await execute(
        "UPDATE chat_messages SET is_read = 1 WHERE company_id = ? AND sender_role = 'client'",
        [companyId]
      );

      return NextResponse.json({ messages });
    }

    const companies = await query(`
      SELECT DISTINCT 
        c.id,
        c.name,
        c.phone,
        c.access_token,
        c.token_expiry,
        c.is_active,
        c.created_at as company_created_at,
        (SELECT COUNT(*) FROM chat_messages m WHERE m.company_id = c.id AND m.sender_role = 'client' AND m.is_read = 0) AS unread_count,
        (SELECT MAX(created_at) FROM chat_messages WHERE company_id = c.id) AS last_message_date,
        (SELECT message FROM chat_messages WHERE company_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message
      FROM companies c
      WHERE EXISTS (
        SELECT 1 FROM chat_messages cm WHERE cm.company_id = c.id
      )
      ORDER BY last_message_date DESC, c.name ASC
    `);

    const totalUnread = await query<{ count: number }>(
      "SELECT COUNT(*) as count FROM chat_messages WHERE sender_role = 'client' AND is_read = 0"
    );

    return NextResponse.json({
      companies,
      total_unread: totalUnread[0]?.count || 0
    });

  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureChatTable();
    
    const body = await request.json();
    const { company_id, message, sender_role, attachment, message_type } = body;

    if (!company_id || !message) {
      return NextResponse.json({ error: "بيانات غير مكتملة" }, { status: 400 });
    }

    await execute(
      "INSERT INTO chat_messages (company_id, sender_role, message, file_path, message_type) VALUES (?, ?, ?, ?, ?)",
      [company_id, sender_role || "admin", message, attachment || null, message_type || "text"]
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_id } = body;

    if (!company_id) {
      return NextResponse.json({ error: "بيانات غير مكتملة" }, { status: 400 });
    }

    await execute(
      "UPDATE chat_messages SET is_read = 1 WHERE company_id = ? AND sender_role = 'client'",
      [company_id]
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error marking as read:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

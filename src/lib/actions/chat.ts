"use server";

import { query, execute } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getMessages(companyId: number) {
  try {
    const messages = await query(
      `SELECT * FROM chat_messages WHERE company_id = ? ORDER BY created_at ASC`,
      [companyId]
    );
    return { success: true, data: messages };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function sendMessage(data: {
  company_id: number;
  sender_role: string;
  message: string;
  file_path?: string;
}) {
  try {
    const result = await execute(
      `INSERT INTO chat_messages (company_id, sender_role, message, file_path, is_read, created_at)
       VALUES (?, ?, ?, ?, 0, NOW())`,
      [data.company_id, data.sender_role, data.message, data.file_path || null]
    );
    
    revalidatePath("/chat");
    revalidatePath("/admin/chat");
    return { success: true, insertId: result.insertId };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function markMessagesAsRead(companyId: number, role: string) {
  try {
    await execute(
      `UPDATE chat_messages SET is_read = 1 WHERE company_id = ? AND sender_role != ?`,
      [companyId, role]
    );
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

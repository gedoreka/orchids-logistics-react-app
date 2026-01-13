"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function sendMessage(data: {
  company_id: number;
  sender_role: string;
  message: string;
  file_path?: string;
}) {
  try {
    await query(
      "INSERT INTO chat_messages (company_id, sender_role, message, file_path) VALUES (?, ?, ?, ?)",
      [data.company_id, data.sender_role, data.message, data.file_path || null]
    );
    revalidatePath("/chat");
    revalidatePath("/admin/chat");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function markMessagesAsRead(companyId: number, role: string) {
  try {
    await query(
      "UPDATE chat_messages SET is_read = TRUE WHERE company_id = ? AND sender_role != ?",
      [companyId, role]
    );
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

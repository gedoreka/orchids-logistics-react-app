"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function sendMessage(data: {
  company_id: number;
  sender_role: string;
  message: string;
  file_path?: string;
}) {
  try {
    const { error } = await supabase
      .from("chat_messages")
      .insert({
        company_id: data.company_id,
        sender_role: data.sender_role,
        message: data.message,
        file_path: data.file_path || null,
        is_read: false
      });

    if (error) throw error;
    
    revalidatePath("/chat");
    revalidatePath("/admin/chat");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function markMessagesAsRead(companyId: number, role: string) {
  try {
    const { error } = await supabase
      .from("chat_messages")
      .update({ is_read: true })
      .eq("company_id", companyId)
      .neq("sender_role", role);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

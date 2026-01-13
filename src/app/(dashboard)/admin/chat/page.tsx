import React from "react";
import { query } from "@/lib/db";
import { AdminChatClient } from "./admin-chat-client";

export default async function AdminChatPage() {
  const companies = await query<any>(`
    SELECT DISTINCT 
        c.id, 
        c.name, 
        (SELECT COUNT(*) FROM chat_messages m WHERE m.company_id = c.id AND m.sender_role = 'client' AND m.is_read = FALSE) AS unread_count,
        (SELECT MAX(created_at) FROM chat_messages WHERE company_id = c.id) AS last_message_date,
        (SELECT message FROM chat_messages WHERE company_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message
    FROM companies c
    WHERE EXISTS (SELECT 1 FROM chat_messages cm WHERE cm.company_id = c.id)
    ORDER BY last_message_date DESC
  `);

  return (
    <AdminChatClient initialCompanies={companies} />
  );
}

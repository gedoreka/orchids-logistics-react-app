import React from "react";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { ChatClient } from "./chat-client";

export default async function ChatPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  const session = JSON.parse(sessionCookie?.value || "{}");
  const companyId = session.company_id;

  const initialMessages = await query(
    "SELECT * FROM chat_messages WHERE company_id = ? ORDER BY created_at ASC",
    [companyId]
  );

  return (
    <ChatClient 
      initialMessages={initialMessages} 
      companyId={companyId}
      senderRole="client"
    />
  );
}

import React from "react";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { ChatClient } from "./chat-client";

export default async function ChatPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  const session = JSON.parse(sessionCookie?.value || "{}");
  const companyId = session.company_id;

  let initialMessages: any[] = [];
  try {
    initialMessages = await query(
      `SELECT * FROM chat_messages WHERE company_id = ? ORDER BY created_at ASC`,
      [companyId]
    );
  } catch (error) {
    console.error("Error loading messages:", error);
  }

    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] p-4 md:p-8">
        <div className="w-full md:w-[75%] max-w-6xl">
          <ChatClient 
            initialMessages={initialMessages} 
            companyId={companyId}
            senderRole="client"
          />
        </div>
      </div>
    );
}

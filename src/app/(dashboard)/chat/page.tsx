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

    let companyToken = "";
    let companyName = "";
    try {
      const companyData = await query<{ access_token: string; name: string }>(
        `SELECT access_token, name FROM companies WHERE id = ? LIMIT 1`,
        [companyId]
      );
      if (companyData.length > 0) {
        companyToken = companyData[0].access_token;
        companyName = companyData[0].name;
      }
    } catch (e) {
      console.error("Error fetching company token:", e);
    }

    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] p-4 md:p-6">
        <div className="w-full md:w-[88%] max-w-7xl">
          <ChatClient 
            initialMessages={initialMessages} 
            companyId={companyId}
            senderRole="client"
            companyToken={companyToken}
            companyName={companyName}
          />
        </div>
      </div>
    );
}

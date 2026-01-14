import React from "react";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { ChatClient } from "./chat-client";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function ChatPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  const session = JSON.parse(sessionCookie?.value || "{}");
  const companyId = session.company_id;

  const { data: initialMessages } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: true });

  return (
    <ChatClient 
      initialMessages={initialMessages || []} 
      companyId={companyId}
      senderRole="client"
    />
  );
}

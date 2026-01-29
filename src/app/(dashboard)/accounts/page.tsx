import React from "react";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { Account } from "@/lib/types";
import { AccountsClient } from "./accounts-client";

export default async function AccountsPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  const session = JSON.parse(sessionCookie?.value || "{}");
  
  const companyId = session.company_id;

  const accounts = await query<Account>(
    "SELECT * FROM accounts WHERE company_id = ? ORDER BY id DESC",
    [companyId]
  );

  return (
    <AccountsClient 
      initialAccounts={accounts} 
      companyId={companyId}
    />
  );
}

import React from "react";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { NewCustomerClient } from "./new-customer-client";

interface Account {
  id: number;
  account_code: string;
  account_name: string;
}

interface CostCenter {
  id: number;
  center_code: string;
  center_name: string;
}

export default async function NewCustomerPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  const session = JSON.parse(sessionCookie?.value || "{}");
  
  const companyId = session.company_id;

  if (!companyId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">جاري التحميل...</p>
      </div>
    );
  }

  const accounts = await query<Account>(
    "SELECT id, account_code, account_name FROM accounts WHERE company_id = ? ORDER BY account_code",
    [companyId]
  );

  const costCenters = await query<CostCenter>(
    "SELECT id, center_code, center_name FROM cost_centers WHERE company_id = ? ORDER BY center_code",
    [companyId]
  );

  return (
    <NewCustomerClient 
      accounts={accounts}
      costCenters={costCenters}
      companyId={companyId}
    />
  );
}

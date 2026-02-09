import React from "react";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { EditCustomerClient } from "./edit-customer-client";
import { notFound } from "next/navigation";

interface Customer {
  id: number;
  customer_name: string;
  company_name: string;
  commercial_number: string;
  vat_number: string;
  unified_number?: string;
  email?: string;
  phone?: string;
  country?: string;
  city?: string;
  district?: string;
  street_name?: string;
  postal_code?: string;
  short_address?: string;
  account_id?: number;
  cost_center_id?: number;
  is_active: number;
}

interface Account {
  id: number;
  account_code: string;
  account_name: string;
  account_type: string;
  parent_id: number | null;
}

interface CostCenter {
  id: number;
  center_code: string;
  center_name: string;
}

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  const session = JSON.parse(sessionCookie?.value || "{}");
  
  const companyId = session.company_id;

  if (!companyId) {
    notFound();
  }

  const customers = await query<Customer>(
    "SELECT * FROM customers WHERE id = ? AND company_id = ?",
    [id, companyId]
  );

  if (!customers || customers.length === 0) {
    notFound();
  }

  const accounts = await query<Account>(
    `SELECT id, account_code, account_name, account_type, parent_id 
     FROM accounts 
     WHERE company_id = ? 
     ORDER BY account_code ASC`,
    [companyId]
  );

  const costCenters = await query<CostCenter>(
    "SELECT id, center_code, center_name, center_type, parent_id FROM cost_centers WHERE company_id = ? ORDER BY center_code",
    [companyId]
  );

  return (
    <EditCustomerClient 
      customer={customers[0]}
      accounts={accounts}
      costCenters={costCenters}
      companyId={companyId}
    />
  );
}

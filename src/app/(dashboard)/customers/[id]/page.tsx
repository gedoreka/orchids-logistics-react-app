import React from "react";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { CustomerViewClient } from "./customer-view-client";
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
  account_name?: string;
  cost_center_name?: string;
  is_active: number;
  created_at: string;
  updated_at?: string;
}

export default async function CustomerViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  const session = JSON.parse(sessionCookie?.value || "{}");
  
  const companyId = session.company_id;

  if (!companyId) {
    notFound();
  }

  const customers = await query<Customer>(
    `SELECT c.*, 
            a.account_name,
            cc.center_name as cost_center_name
     FROM customers c
     LEFT JOIN accounts a ON c.account_id = a.id
     LEFT JOIN cost_centers cc ON c.cost_center_id = cc.id
     WHERE c.id = ? AND c.company_id = ?`,
    [id, companyId]
  );

  if (!customers || customers.length === 0) {
    notFound();
  }

  return <CustomerViewClient customer={customers[0]} companyId={companyId} />;
}

import React from "react";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { CustomersClient } from "./customers-client";

interface Customer {
  id: number;
  customer_name: string;
  company_name: string;
  commercial_number: string;
  vat_number: string;
  email?: string;
  phone?: string;
  is_active: number;
  created_at: string;
}

export default async function CustomersPage() {
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

  const customers = await query<Customer>(
    `SELECT c.*, 
            a.account_name,
            cc.center_name as cost_center_name
     FROM customers c
     LEFT JOIN accounts a ON c.account_id = a.id
     LEFT JOIN cost_centers cc ON c.cost_center_id = cc.id
     WHERE c.company_id = ? 
     ORDER BY c.id DESC`,
    [companyId]
  );

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.is_active === 1).length;
  const inactiveCustomers = customers.filter(c => c.is_active === 0).length;

  return (
    <CustomersClient 
      customers={customers}
      stats={{
        total: totalCustomers,
        active: activeCustomers,
        inactive: inactiveCustomers
      }}
      companyId={companyId}
    />
  );
}

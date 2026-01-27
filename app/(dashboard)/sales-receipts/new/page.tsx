import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { NewSalesReceiptClient } from "./new-sales-receipt-client";

interface Customer {
  id: number;
  customer_name: string;
}

interface Invoice {
  id: number;
  invoice_number: string;
}

async function getCustomers(companyId: number) {
  try {
    const customers = await query<Customer>(
      `SELECT id, customer_name FROM customers WHERE company_id = ? AND is_active = 1 ORDER BY id DESC`,
      [companyId]
    );
    return customers;
  } catch (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
}

async function getInvoices(companyId: number) {
  try {
    const invoices = await query<Invoice>(
      `SELECT id, invoice_number FROM sales_invoices WHERE company_id = ? ORDER BY id DESC`,
      [companyId]
    );
    return invoices;
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return [];
  }
}

export default async function NewSalesReceiptPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  const session = JSON.parse(sessionCookie?.value || "{}");
  
  const companyId = session.company_id;
  const userName = session.name || 'مدير النظام';

  if (!companyId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">جاري التحميل...</p>
      </div>
    );
  }

  const [customers, invoices] = await Promise.all([
    getCustomers(companyId),
    getInvoices(companyId)
  ]);

  return (
    <NewSalesReceiptClient 
      customers={customers} 
      invoices={invoices}
      companyId={companyId}
      userName={userName}
    />
  );
}

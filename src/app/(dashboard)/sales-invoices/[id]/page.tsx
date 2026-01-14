import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { query } from "@/lib/db";
import { InvoiceViewClient } from "./invoice-view-client";

async function getCompanyId(userId: number) {
  const users = await query<any>("SELECT company_id FROM users WHERE id = ?", [userId]);
  return users[0]?.company_id;
}

async function getInvoiceData(id: string, companyId: number) {
  const invoices = await query<any>(
    "SELECT * FROM sales_invoices WHERE id = ? AND company_id = ?",
    [id, companyId]
  );

  if (invoices.length === 0) return null;

  const invoice = invoices[0];

  const items = await query<any>(
    "SELECT * FROM invoice_items WHERE invoice_id = ?",
    [id]
  );

  const adjustments = await query<any>(
    "SELECT * FROM invoice_adjustments WHERE invoice_id = ?",
    [id]
  );

  const companies = await query<any>(
    "SELECT * FROM companies WHERE id = ?",
    [companyId]
  );

  const bankAccounts = await query<any>(
    "SELECT * FROM company_bank_accounts WHERE company_id = ? ORDER BY id DESC",
    [companyId]
  );

  let customer = null;
  if (invoice.client_id) {
    const customers = await query<any>(
      "SELECT * FROM customers WHERE id = ?",
      [invoice.client_id]
    );
    customer = customers[0];
  }

  return {
    invoice,
    items,
    adjustments,
    company: companies[0],
    bankAccounts,
    customer
  };
}

export default async function InvoiceViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  
  if (!sessionCookie) {
    redirect("/login");
  }
  
  const session = JSON.parse(sessionCookie.value);
  let companyId = session.company_id;
  
  if (!companyId && session.user_id) {
    companyId = await getCompanyId(session.user_id);
  }

  if (!companyId) {
    redirect("/login");
  }

  const data = await getInvoiceData(id, companyId);

  if (!data) {
    notFound();
  }

  return <InvoiceViewClient {...data} />;
}

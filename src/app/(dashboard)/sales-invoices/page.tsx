import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { InvoicesListClient } from "./invoices-list-client";

async function getCompanyId(userId: number) {
  const users = await query<any>("SELECT company_id FROM users WHERE id = ?", [userId]);
  return users[0]?.company_id;
}

async function getInvoices(companyId: number) {
  const invoices = await query<any>(`
    SELECT 
      si.*,
      COALESCE((SELECT SUM(total_before_vat) FROM invoice_items WHERE invoice_id = si.id), 0) as subtotal,
      COALESCE((SELECT SUM(vat_amount) FROM invoice_items WHERE invoice_id = si.id), 0) as tax_amount,
      COALESCE((SELECT status FROM invoice_items WHERE invoice_id = si.id LIMIT 1), si.status) as invoice_status
    FROM sales_invoices si
    WHERE si.company_id = ?
    ORDER BY si.id DESC
  `, [companyId]);
  
  return invoices.map((inv: any) => ({
    ...inv,
    issue_date: inv.issue_date ? (inv.issue_date instanceof Date ? inv.issue_date.toISOString().split('T')[0] : inv.issue_date) : null,
    due_date: inv.due_date ? (inv.due_date instanceof Date ? inv.due_date.toISOString().split('T')[0] : inv.due_date) : null,
    created_at: inv.created_at ? (inv.created_at instanceof Date ? inv.created_at.toISOString() : inv.created_at) : null,
    updated_at: inv.updated_at ? (inv.updated_at instanceof Date ? inv.updated_at.toISOString() : inv.updated_at) : null,
  }));
}

export default async function SalesInvoicesPage() {
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

  const invoices = await getInvoices(companyId);

  return <InvoicesListClient invoices={invoices} />;
}

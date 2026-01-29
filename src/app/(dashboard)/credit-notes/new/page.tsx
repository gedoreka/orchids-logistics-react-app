import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { NewCreditNoteClient } from "./new-credit-note-client";

async function getCompanyId(userId: number) {
  const users = await query<any>("SELECT company_id FROM users WHERE id = ?", [userId]);
  return users[0]?.company_id;
}

async function getInvoices(companyId: number) {
  const invoices = await query<any>(`
    SELECT 
      si.id,
      si.invoice_number,
      si.total_amount,
      si.client_name,
      si.client_vat,
      si.status,
      COALESCE((SELECT SUM(total_amount) FROM credit_notes WHERE invoice_id = si.id AND status = 'active'), 0) as total_issued
    FROM sales_invoices si
    WHERE si.company_id = ?
    ORDER BY si.id DESC
  `, [companyId]);
  
  return invoices;
}

export default async function NewCreditNotePage() {
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

  return <NewCreditNoteClient invoices={invoices} />;
}

import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { query } from "@/lib/db";
import { CreditNoteViewClient } from "./credit-note-view-client";
import { generateZatcaQR } from "@/lib/zatca-qr";

async function getCompanyId(userId: number) {
  const users = await query<any>("SELECT company_id FROM users WHERE id = ?", [userId]);
  return users[0]?.company_id;
}

async function getCreditNoteDetails(id: string, companyId: number) {
  const creditNotes = await query<any>(`
    SELECT 
      cn.*,
      si.issue_date as invoice_date,
      si.total_amount as invoice_total_amount,
      c.email as client_email,
      c.phone as client_phone,
      comp.name as company_name,
      comp.vat_number as company_vat,
      comp.street || ' ' || comp.district || ' ' || comp.region as company_address,
      comp.phone as company_phone,
      comp.logo_path as company_logo
    FROM credit_notes cn
    JOIN sales_invoices si ON cn.invoice_id = si.id
    JOIN customers c ON cn.client_id = c.id
    JOIN companies comp ON cn.company_id = comp.id
    WHERE cn.id = ? AND cn.company_id = ?
  `, [id, companyId]);

  return creditNotes[0];
}

export default async function CreditNoteViewPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  
  if (!sessionCookie) notFound();
  
  const session = JSON.parse(sessionCookie.value);
  let companyId = session.company_id;
  if (!companyId && session.user_id) companyId = await getCompanyId(session.user_id);
  if (!companyId) notFound();

  const creditNote = await getCreditNoteDetails(id, companyId);
  if (!creditNote) notFound();

  // Generate ZATCA QR Code
  const qrData = generateZatcaQR(
    creditNote.company_name,
    creditNote.company_vat,
    creditNote.created_at.toISOString(),
    creditNote.total_amount,
    creditNote.vat_amount
  );

  return <CreditNoteViewClient creditNote={creditNote} qrData={qrData} />;
}

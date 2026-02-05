import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { CreditNotesListClient } from "./credit-notes-list-client";

export const dynamic = "force-dynamic";

async function getCompanyId(userId: number) {
  const users = await query<any>("SELECT company_id FROM users WHERE id = ?", [userId]);
  return users[0]?.company_id;
}

function safeDate(val: any): string | null {
  if (!val) return null;
  if (typeof val === 'string') return val;
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null;
    return val.toISOString().split('T')[0];
  }
  return String(val);
}

async function getCreditNotes(companyId: number) {
  const creditNotes = await query<any>(`
    SELECT 
      cn.*,
      si.invoice_number,
      si.status as invoice_status
    FROM credit_notes cn
    LEFT JOIN sales_invoices si ON cn.invoice_id = si.id
    WHERE cn.company_id = ?
    ORDER BY cn.id DESC
  `, [companyId]);
  
  return creditNotes.map((note: any) => ({
    ...note,
    created_at: safeDate(note.created_at),
    cancelled_at: safeDate(note.cancelled_at),
  }));
}

export default async function CreditNotesPage() {
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

  const creditNotes = await getCreditNotes(companyId);

  return <CreditNotesListClient creditNotes={creditNotes} />;
}

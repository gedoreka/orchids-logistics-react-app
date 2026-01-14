import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { QuotationsClient } from "./quotations-client";

interface Quotation {
  id: number;
  quotation_number: string;
  client_id: number;
  client_name: string;
  client_vat: string;
  issue_date: string;
  due_date: string;
  expiry_date: string;
  total_amount: number;
  status: string;
  created_at: string;
}

async function getQuotations(companyId: number) {
  try {
    const quotations = await query<Quotation>(
      `SELECT q.*, 
              COALESCE(q.client_name, c.customer_name, c.company_name) as client_name,
              COALESCE(q.client_vat, c.vat_number) as client_vat
       FROM quotations q
       LEFT JOIN customers c ON q.client_id = c.id
       WHERE q.company_id = ? 
       ORDER BY q.id DESC`,
      [companyId]
    );
    return quotations;
  } catch (error) {
    console.error("Error fetching quotations:", error);
    return [];
  }
}

async function getStats(companyId: number) {
  try {
    const stats = await query<any>(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
        SUM(CASE WHEN expiry_date < CURDATE() AND status != 'confirmed' THEN 1 ELSE 0 END) as expired
       FROM quotations WHERE company_id = ?`,
      [companyId]
    );
    return stats[0] || { total: 0, confirmed: 0, draft: 0, expired: 0 };
  } catch (error) {
    return { total: 0, confirmed: 0, draft: 0, expired: 0 };
  }
}

export default async function QuotationsPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (!sessionCookie?.value) {
    redirect("/login");
  }

  let session;
  try {
    session = JSON.parse(sessionCookie.value);
  } catch {
    redirect("/login");
  }

  const companyId = session.company_id || 1;
  const [quotations, stats] = await Promise.all([
    getQuotations(companyId),
    getStats(companyId)
  ]);

  return <QuotationsClient quotations={quotations} stats={stats} companyId={companyId} />;
}

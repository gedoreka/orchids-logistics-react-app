import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { SalesReceiptsClient } from "./sales-receipts-client";

interface SalesReceipt {
  id: number;
  receipt_number: string;
  client_id: number;
  client_name: string;
  invoice_id: number | null;
  invoice_number: string | null;
  receipt_date: string;
  amount: number;
  notes: string;
  created_by: string;
  created_at: string;
}

async function getSalesReceipts(companyId: number) {
  try {
    const receipts = await query<SalesReceipt>(
      `SELECT sr.id, sr.receipt_number, sr.client_id, sr.client_name, sr.invoice_number,
              sr.receipt_date, sr.amount, sr.notes, sr.created_by, sr.created_at,
              COALESCE(sr.client_name, c.customer_name) as client_name
       FROM sales_receipts sr
       LEFT JOIN customers c ON sr.client_id = c.id
       WHERE sr.company_id = ? 
       ORDER BY sr.id DESC`,
      [companyId]
    );
    return receipts;
  } catch (error) {
    console.error("Error fetching sales receipts:", error);
    return [];
  }
}

async function getStats(companyId: number) {
  try {
    const stats = await query<any>(
      `SELECT 
        COUNT(*) as total,
        COALESCE(SUM(amount), 0) as total_amount,
        COUNT(CASE WHEN invoice_number IS NOT NULL AND invoice_number != '' THEN 1 END) as linked,
        COUNT(CASE WHEN invoice_number IS NULL OR invoice_number = '' THEN 1 END) as unlinked
       FROM sales_receipts WHERE company_id = ?`,
      [companyId]
    );
    return stats[0] || { total: 0, total_amount: 0, linked: 0, unlinked: 0 };
  } catch (error) {
    return { total: 0, total_amount: 0, linked: 0, unlinked: 0 };
  }
}

export default async function SalesReceiptsPage() {
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

  const [receipts, stats] = await Promise.all([
    getSalesReceipts(companyId),
    getStats(companyId)
  ]);

  return <SalesReceiptsClient receipts={receipts} stats={stats} companyId={companyId} />;
}

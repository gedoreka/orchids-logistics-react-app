import { cookies } from "next/headers";
import { cachedQuery } from "@/lib/db";
import { AnbBatchesClient } from "./anb-batches-client";

async function getBatches(companyId: number) {
  try {
    const batches = await cachedQuery<any>(
      `SELECT b.*, COUNT(bi.id) as item_count
       FROM anb_payroll_batches b
       LEFT JOIN anb_payroll_batch_items bi ON b.id = bi.batch_id
       WHERE b.company_id = ?
       GROUP BY b.id
       ORDER BY b.id DESC`,
      [companyId]
    );
    return batches;
  } catch (error) {
    console.error("Error fetching ANB batches:", error);
    return [];
  }
}

async function hasCredentials(companyId: number) {
  try {
    const rows = await cachedQuery<any>(
      `SELECT id FROM anb_credentials WHERE company_id = ? AND is_active = 1`,
      [companyId]
    );
    return rows.length > 0;
  } catch {
    return false;
  }
}

export default async function AnbBatchesPage() {
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

  const [batches, hasCreds] = await Promise.all([
    getBatches(companyId),
    hasCredentials(companyId),
  ]);

  return <AnbBatchesClient batches={batches} companyId={companyId} hasCredentials={hasCreds} />;
}

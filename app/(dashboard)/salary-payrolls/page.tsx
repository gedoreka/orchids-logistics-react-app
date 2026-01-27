import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { PayrollsListClient } from "./payrolls-list-client";

async function getPayrolls(companyId: number) {
  try {
    const payrolls = await query<any>(
      `SELECT p.id, p.payroll_month, p.package_id, p.saved_by, p.created_at, p.is_draft, p.total_amount,
              COUNT(i.id) AS employee_count,
              pkg.group_name as package_name, pkg.work_type
       FROM salary_payrolls p
       LEFT JOIN salary_payroll_items i ON p.id = i.payroll_id
       LEFT JOIN employee_packages pkg ON p.package_id = pkg.id
       WHERE p.company_id = ?
       GROUP BY p.id
       ORDER BY p.id DESC`,
      [companyId]
    );
    return payrolls;
  } catch (error) {
    console.error("Error fetching payrolls:", error);
    return [];
  }
}

async function getStats(companyId: number) {
  try {
    const stats = await query<any>(
      `SELECT 
        COUNT(*) as total,
        COALESCE(SUM(total_amount), 0) as total_amount,
        COUNT(CASE WHEN is_draft = 1 THEN 1 END) as draft_count,
        COUNT(CASE WHEN is_draft = 0 THEN 1 END) as confirmed_count
       FROM salary_payrolls WHERE company_id = ?`,
      [companyId]
    );
    return stats[0] || { total: 0, total_amount: 0, draft_count: 0, confirmed_count: 0 };
  } catch (error) {
    return { total: 0, total_amount: 0, draft_count: 0, confirmed_count: 0 };
  }
}

export default async function PayrollsPage() {
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

  const [payrolls, stats] = await Promise.all([
    getPayrolls(companyId),
    getStats(companyId)
  ]);

  return <PayrollsListClient payrolls={payrolls} stats={stats} companyId={companyId} />;
}

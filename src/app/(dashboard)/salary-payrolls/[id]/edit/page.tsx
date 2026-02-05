import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { query } from "@/lib/db";
import { PayrollEditClient } from "./payroll-edit-client";

async function getPayroll(id: string, companyId: number) {
  try {
    const payrolls = await query<any>(
      `SELECT p.*, pkg.group_name as package_name, pkg.work_type, pkg.monthly_target, pkg.bonus_after_target
       FROM salary_payrolls p
       LEFT JOIN employee_packages pkg ON p.package_id = pkg.id
       WHERE p.id = ? AND p.company_id = ?`,
      [id, companyId]
    );

    if (payrolls.length === 0) return null;

    const items = await query<any>(
      `SELECT * FROM salary_payroll_items WHERE payroll_id = ?`,
      [id]
    );

    return { ...payrolls[0], items };
  } catch (error) {
    console.error("Error fetching payroll:", error);
    return null;
  }
}

export default async function PayrollEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  const payroll = await getPayroll(id, companyId);

  if (!payroll) {
    notFound();
  }

  return <PayrollEditClient payroll={payroll} companyId={companyId} />;
}

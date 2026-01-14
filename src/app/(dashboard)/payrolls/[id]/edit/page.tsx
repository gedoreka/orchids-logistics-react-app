import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { query } from "@/lib/db";
import { PayrollEditClient } from "./payroll-edit-client";

async function getCompanyId(userId: number) {
  const users = await query<any>("SELECT company_id FROM users WHERE id = ?", [userId]);
  return users[0]?.company_id;
}

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

  const payroll = await getPayroll(id, companyId);

  if (!payroll) {
    notFound();
  }

  return <PayrollEditClient payroll={payroll} companyId={companyId} />;
}

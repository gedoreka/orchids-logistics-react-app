import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { query } from "@/lib/db";
import { PayrollViewClient } from "./payroll-view-client";

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

    let totalNet = 0;
    items.forEach((item: any) => {
      if (item.net_salary >= 0) {
        totalNet += parseFloat(item.net_salary || 0);
      }
    });

    return { ...payrolls[0], items, total_net: totalNet };
  } catch (error) {
    console.error("Error fetching payroll:", error);
    return null;
  }
}

async function getCompany(companyId: number) {
  try {
    const companies = await query<any>(
      `SELECT name, vat_number, short_address FROM companies WHERE id = ?`,
      [companyId]
    );
    return companies[0] || { name: 'اسم الشركة', vat_number: 'غير محدد', short_address: 'غير محدد' };
  } catch (error) {
    return { name: 'اسم الشركة', vat_number: 'غير محدد', short_address: 'غير محدد' };
  }
}

export default async function PayrollViewPage({ params }: { params: Promise<{ id: string }> }) {
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

  const [payroll, company] = await Promise.all([
    getPayroll(id, companyId),
    getCompany(companyId)
  ]);

  if (!payroll) {
    notFound();
  }

  return <PayrollViewClient payroll={payroll} company={company} companyId={companyId} />;
}

import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { NewPayrollClient } from "./new-payroll-client";

async function getPackages(companyId: number) {
  try {
    const packages = await query<any>(
      `SELECT * FROM employee_packages WHERE company_id = ? ORDER BY id DESC`,
      [companyId]
    );
    return packages;
  } catch (error) {
    console.error("Error fetching packages:", error);
    return [];
  }
}

async function getDebts(companyId: number) {
  try {
    const debts = await query<any>(
      `SELECT * FROM salary_debts WHERE company_id = ? AND resolved = 0`,
      [companyId]
    );
    return debts;
  } catch (error) {
    console.error("Error fetching debts:", error);
    return [];
  }
}

export default async function NewPayrollPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  const session = JSON.parse(sessionCookie?.value || "{}");
  
  const companyId = session.company_id;
  const userName = session.name || 'مدير النظام';

  if (!companyId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">جاري التحميل...</p>
      </div>
    );
  }

  const [packages, debts] = await Promise.all([
    getPackages(companyId),
    getDebts(companyId)
  ]);

  return (
    <NewPayrollClient 
      packages={packages} 
      debts={debts}
      companyId={companyId}
      userName={userName}
    />
  );
}

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { ExpensesClient } from "./expenses-client";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");

  if (!sessionCookie) {
    redirect("/login");
  }

  const session = JSON.parse(sessionCookie.value);
  const companyId = session.company_id;

  if (!companyId) {
    redirect("/dashboard");
  }

  const { month } = await searchParams;
  const currentMonth = month || new Date().toISOString().slice(0, 7);

  // Fetch Company Info
  const companies = await query<any>(
    "SELECT name, logo_path FROM companies WHERE id = ?",
    [companyId]
  );
  const companyInfo = companies[0] || { name: "اسم الشركة", logo_path: null };

  // Fetch Stats
  const expensesStats = await query<any>(
    "SELECT COALESCE(SUM(amount), 0) as total FROM monthly_expenses WHERE company_id = ? AND month_reference = ?",
    [companyId, currentMonth]
  );

  const deductionsStats = await query<any>(
    "SELECT COALESCE(SUM(amount), 0) as total FROM monthly_deductions WHERE company_id = ? AND month_reference = ?",
    [companyId, currentMonth]
  );

  const payrollsStats = await query<any>(
    "SELECT COALESCE(SUM(total_amount), 0) as total FROM salary_payrolls WHERE company_id = ? AND payroll_month = ? AND is_draft = 0",
    [companyId, currentMonth]
  );

  const stats = {
    expenses: Number(expensesStats[0]?.total || 0),
    deductions: Number(deductionsStats[0]?.total || 0),
    payrolls: Number(payrollsStats[0]?.total || 0),
    get total() {
      return this.expenses + this.deductions + this.payrolls;
    }
  };

  // Fetch Recent Activity
  const recentActivity = await query<any>(
    "SELECT expense_type, amount, expense_date, employee_name FROM monthly_expenses WHERE company_id = ? ORDER BY expense_date DESC, id DESC LIMIT 5",
    [companyId]
  );

  return (
    <ExpensesClient 
      companyId={companyId}
      companyInfo={companyInfo}
      stats={stats}
      recentActivity={recentActivity}
      currentMonth={currentMonth}
    />
  );
}

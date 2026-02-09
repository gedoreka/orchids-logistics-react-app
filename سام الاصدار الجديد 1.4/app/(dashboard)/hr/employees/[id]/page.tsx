import React from "react";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { EmployeeDetailsClient } from "./employee-details-client";
import { notFound } from "next/navigation";

export default async function EmployeeDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const employeeId = parseInt(id);

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  const session = JSON.parse(sessionCookie?.value || "{}");
  
  const companyId = session.company_id;

  // 1. Fetch Employee Data
  const employeeRes = await query(
    `SELECT e.*, ep.group_name 
     FROM employees e 
     LEFT JOIN employee_packages ep ON e.package_id = ep.id 
     WHERE e.id = ? AND e.company_id = ?`,
    [employeeId, companyId]
  );

  const employee = employeeRes[0];
  if (!employee) {
    notFound();
  }

  // 2. Fetch all employees in same package for navigation
  const allEmployees = await query(
    `SELECT id, name, user_code, iqama_number, is_active
     FROM employees 
     WHERE package_id = ? AND company_id = ?
     ORDER BY user_code ASC`,
    [employee.package_id, companyId]
  );

  // 3. Fetch Violations (Merging from employee_violations and monthly_expenses for comprehensive display)
  const violations = await query(
    `SELECT 
        id, 
        violation_type, 
        violation_date, 
        violation_amount, 
        deducted_amount, 
        remaining_amount, 
        status, 
        violation_description,
        created_at
     FROM employee_violations 
     WHERE employee_id = ?
     
     UNION ALL
     
     SELECT 
        id, 
        'traffic' as violation_type, 
        expense_date as violation_date, 
        amount as violation_amount, 
        amount as deducted_amount, 
        0 as remaining_amount, 
        'deducted' as status, 
        description as violation_description,
        created_at
     FROM monthly_expenses 
     WHERE employee_iqama = ? AND (expense_type = 'مخالفات مرورية' OR expense_type = 'traffic')
     AND NOT EXISTS (
        SELECT 1 FROM employee_violations ev 
        WHERE ev.employee_id = ? AND ev.violation_date = monthly_expenses.expense_date AND ev.violation_amount = monthly_expenses.amount
     )
     
     ORDER BY violation_date DESC`,
    [employeeId, employee.iqama_number, employeeId]
  );

  // 4. Fetch Letters
  const letters = await query(
    "SELECT * FROM employee_letters WHERE employee_id = ? ORDER BY created_at DESC",
    [employeeId]
  );

  // 5. Fetch Stats (Orders/Salary)
  const statsRes = await query(
    `SELECT 
        COUNT(DISTINCT sp.id) as total_months,
        COALESCE(SUM(spi.successful_orders), 0) as total_orders,
        COALESCE(SUM(spi.net_salary), 0) as total_salary,
        COALESCE(AVG(spi.successful_orders), 0) as avg_orders,
        COALESCE(AVG(spi.net_salary), 0) as avg_salary
    FROM salary_payrolls sp
    LEFT JOIN salary_payroll_items spi ON sp.id = spi.payroll_id
    WHERE spi.iqama_number = ? AND sp.company_id = ? AND sp.is_draft = 0`,
    [employee.iqama_number, companyId]
  );
  const stats = statsRes[0];

  // 6. Fetch Monthly Data
  const monthlyData = await query(
    `SELECT 
        sp.payroll_month,
        spi.successful_orders,
        spi.net_salary,
        spi.target,
        spi.monthly_bonus as bonus,
        (spi.target_deduction + spi.operator_deduction + spi.internal_deduction + spi.wallet_deduction) as total_deduction
    FROM salary_payrolls sp
    JOIN salary_payroll_items spi ON sp.id = spi.payroll_id
    WHERE spi.iqama_number = ? AND sp.company_id = ? AND sp.is_draft = 0
    ORDER BY sp.payroll_month DESC`,
    [employee.iqama_number, companyId]
  );

  // 7. Fetch Bank Accounts
  const bankAccounts = await query(
    "SELECT * FROM employee_bank_accounts WHERE employee_id = ? ORDER BY is_primary DESC, created_at DESC",
    [employeeId]
  );

  // 8. Fetch Custom Document Types (system-level)
  const customDocTypes = await query(
    "SELECT * FROM custom_document_types ORDER BY created_at ASC"
  );

  // 9. Fetch Employee Custom Documents
  const customDocuments = await query(
    "SELECT * FROM employee_custom_documents WHERE employee_id = ? ORDER BY created_at ASC",
    [employeeId]
  );

  // Helper function to format dates to strings
    const formatDate = (obj: any) => {
      if (!obj) return obj;
      const newObj = { ...obj };
      for (const key in newObj) {
        if (newObj[key] instanceof Date) {
          const d = newObj[key] as Date;
          if (!isNaN(d.getTime())) {
            newObj[key] = d.toISOString().split('T')[0];
          } else {
            newObj[key] = null;
          }
        }
      }
      return newObj;
    };

  return (
    <EmployeeDetailsClient 
      employee={formatDate(employee)}
      allEmployees={allEmployees}
      violations={violations.map(v => formatDate(v))}
      letters={letters.map(l => formatDate(l))}
      stats={stats}
      monthlyData={monthlyData}
      bankAccounts={bankAccounts.map(b => formatDate(b))}
      customDocTypes={customDocTypes.map((d: any) => formatDate(d))}
      customDocuments={customDocuments.map((d: any) => formatDate(d))}
    />
  );
}

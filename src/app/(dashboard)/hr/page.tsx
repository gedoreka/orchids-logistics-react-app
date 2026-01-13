import React from "react";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { HRDashboardClient } from "./hr-dashboard-client";

export default async function HRPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  const session = JSON.parse(sessionCookie?.value || "{}");
  
  const companyId = session.company_id;

  // 1. Fetch Company Info
  const company = await query(
    "SELECT name FROM companies WHERE id = ?",
    [companyId]
  );
  const companyName = company[0]?.name || "شركتي";

  // 2. Fetch Stats
  const totalEmployeesRes = await query(
    "SELECT COUNT(*) as count FROM employees WHERE company_id = ?",
    [companyId]
  );
  const totalEmployees = Number(totalEmployeesRes[0]?.count || 0);

  const totalPackagesRes = await query(
    "SELECT COUNT(*) as count FROM employee_packages WHERE company_id = ?",
    [companyId]
  );
  const totalPackages = Number(totalPackagesRes[0]?.count || 0);

  const onLeaveRes = await query(
    "SELECT COUNT(*) as count FROM employees WHERE company_id = ? AND is_active = 0",
    [companyId]
  );
  const onLeave = Number(onLeaveRes[0]?.count || 0);

  const expiredIqamaRes = await query(
    "SELECT COUNT(*) as count FROM employees WHERE company_id = ? AND iqama_expiry IS NOT NULL AND iqama_expiry <= CURRENT_DATE",
    [companyId]
  );
  const expiredIqama = Number(expiredIqamaRes[0]?.count || 0);

  // 3. Fetch Active Packages (limit 6)
  const activePackages = await query(
    "SELECT * FROM employee_packages WHERE company_id = ? ORDER BY id DESC LIMIT 6",
    [companyId]
  );

  // 4. Fetch Recent Employees (limit 5)
  const recentEmployees = await query(
    `SELECT e.*, ep.group_name 
     FROM employees e 
     LEFT JOIN employee_packages ep ON e.package_id = ep.id 
     WHERE e.company_id = ? 
     ORDER BY e.created_at DESC 
     LIMIT 5`,
    [companyId]
  );

  const activeEmployees = totalEmployees - onLeave;
  const completionRate = totalEmployees > 0 ? Math.round((activeEmployees / totalEmployees) * 100) : 0;

  return (
    <HRDashboardClient 
      companyName={companyName}
      stats={{
        totalEmployees,
        totalPackages,
        onLeave,
        expiredIqama,
        completionRate
      }}
      activePackages={activePackages}
      recentEmployees={recentEmployees}
    />
  );
}

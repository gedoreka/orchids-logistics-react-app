import React from "react";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { DashboardClient } from "./dashboard-client";
import { Company, User } from "@/lib/types";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  const session = JSON.parse(sessionCookie?.value || "{}");
  
  const userId = session.user_id;
  const companyId = session.company_id;
  const isAdmin = session.role === "admin";

  let stats = {};
  let company = null;
  let user = null;

  // Fetch User
  const users = await query<User>("SELECT name, role FROM users WHERE id = ?", [userId]);
  user = users[0];

  if (isAdmin) {
    // Admin Stats
    const usersCount = await query("SELECT COUNT(*) as count FROM users WHERE is_activated = 1");
    const pendingRequests = await query("SELECT COUNT(*) as count FROM companies WHERE status = 'pending'");
    const stoppedCompanies = await query("SELECT COUNT(*) as count FROM companies WHERE is_active = 0");
    const invoicesCount = await query("SELECT COUNT(*) as count FROM sales_invoices");

    stats = {
      users_count: Number(usersCount[0].count),
      pending_requests: Number(pendingRequests[0].count),
      stopped_companies: Number(stoppedCompanies[0].count),
      invoices_count: Number(invoicesCount[0].count),
    };
  } else {
    // Company Stats
    const totalEmployees = await query("SELECT COUNT(*) as count FROM employees WHERE company_id = ?", [companyId]);
    const totalPackages = await query("SELECT COUNT(*) as count FROM employee_packages WHERE company_id = ?", [companyId]);
    const activeEmployees = await query("SELECT COUNT(*) as count FROM employees WHERE company_id = ? AND is_active = true", [companyId]);
    const expiredIqama = await query("SELECT COUNT(*) as count FROM employees WHERE company_id = ? AND iqama_expiry <= CURRENT_DATE", [companyId]);

    stats = {
      total_employees: Number(totalEmployees[0].count),
      total_packages: Number(totalPackages[0].count),
      active_employees: Number(activeEmployees[0].count),
      expired_iqama: Number(expiredIqama[0].count),
    };

    // Fetch Company Details
    const companies = await query<Company>("SELECT name, vat_number, commercial_number, access_token FROM companies WHERE id = ?", [companyId]);
    company = companies[0];
  }

  return (
    <DashboardClient 
      stats={stats} 
      user={user} 
      company={company} 
      initialYear={new Date().getFullYear()} 
    />
  );
}

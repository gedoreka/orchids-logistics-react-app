import React from "react";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { PackageViewClient } from "./package-view-client";
import { notFound } from "next/navigation";

export default async function PackageViewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ search?: string; filter?: string }>;
}) {
  const { id } = await params;
  const packageId = parseInt(id);
  const resolvedSearchParams = await searchParams;
  const search = resolvedSearchParams.search || "";
  const filter = resolvedSearchParams.filter || "all";

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  const session = JSON.parse(sessionCookie?.value || "{}");
  
  const companyId = session.company_id;

  // 1. Fetch Package Data
  const packageRes = await query(
    "SELECT * FROM employee_packages WHERE id = ? AND company_id = ?",
    [packageId, companyId]
  );

  const pkg = packageRes[0];
  if (!pkg) {
    notFound();
  }

  // 2. Fetch all packages for navigation
  const allPackages = await query(
    "SELECT id, group_name FROM employee_packages WHERE company_id = ? ORDER BY id DESC",
    [companyId]
  );

  // 3. Document Stats
  const statsRes = await query(
    `SELECT 
        COUNT(*) as total_employees,
        SUM(CASE WHEN iqama_file IS NOT NULL AND iqama_file != '' THEN 1 ELSE 0 END) as iqama_complete,
        SUM(CASE WHEN license_file IS NOT NULL AND license_file != '' THEN 1 ELSE 0 END) as license_complete,
        SUM(CASE WHEN vehicle_file IS NOT NULL AND vehicle_file != '' THEN 1 ELSE 0 END) as vehicle_complete,
        SUM(CASE WHEN personal_photo IS NOT NULL AND personal_photo != '' THEN 1 ELSE 0 END) as photo_complete
    FROM employees 
    WHERE package_id = ? AND company_id = ?`,
    [packageId, companyId]
  );
  const stats = statsRes[0];

  // 4. Fetch Employees with search and filter
  let condition = "package_id = ? AND company_id = ?";
  let paramsArr: any[] = [packageId, companyId];

  if (search) {
    condition += " AND (iqama_number LIKE ? OR user_code LIKE ? OR name LIKE ?)";
    paramsArr.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (filter === "expired") {
    condition += " AND iqama_expiry IS NOT NULL AND iqama_expiry <= CURRENT_DATE";
  } else if (filter === "soon") {
    condition += " AND iqama_expiry IS NOT NULL AND iqama_expiry > CURRENT_DATE AND iqama_expiry <= CURRENT_DATE + INTERVAL '30 days'";
  } else if (filter === "active") {
    condition += " AND (iqama_expiry IS NULL OR iqama_expiry > CURRENT_DATE + INTERVAL '30 days')";
  } else if (filter === "on_leave") {
    condition += " AND is_active = 0";
  }

  const employees = await query(
    `SELECT * FROM employees WHERE ${condition} ORDER BY id DESC LIMIT 200`,
    paramsArr
  );

  return (
    <PackageViewClient 
      packageData={pkg}
      allPackages={allPackages}
      stats={stats}
      initialEmployees={employees}
      searchQuery={search}
      activeFilter={filter}
    />
  );
}

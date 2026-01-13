import React from "react";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { IqamaReportClient } from "./iqama-report-client";

export default async function IqamaReportPage({ searchParams }: { 
  searchParams: { filter?: string, search?: string }
}) {
  const filter = (await searchParams).filter || "expired";
  const search = (await searchParams).search || "";

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  const session = JSON.parse(sessionCookie?.value || "{}");
  
  const companyId = session.company_id;

  // 1. Fetch Company Info
  const company = await query(
    "SELECT name, logo FROM companies WHERE id = ?",
    [companyId]
  );

  // 2. Fetch Iqama Data
  let sql = `
    SELECT 
        e.id,
        e.name,
        e.iqama_number,
        e.user_code,
        e.iqama_expiry,
        ep.group_name,
        (e.iqama_expiry - CURRENT_DATE) as days_remaining
    FROM employees e
    LEFT JOIN employee_packages ep ON e.package_id = ep.id
    WHERE e.company_id = ? 
    AND e.iqama_expiry IS NOT NULL
  `;
  let params: any[] = [companyId];

  if (search) {
    sql += " AND (e.name LIKE ? OR e.iqama_number LIKE ? OR e.user_code LIKE ?)";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const allData = await query(sql, params);

  // 3. Process data based on filter
  const iqamaData = allData.filter((item: any) => {
    const days = item.days_remaining;
    if (filter === 'expired' && days >= 0) return false;
    if (filter === 'soon' && (days > 30 || days < 0)) return false;
    if (filter === 'active' && days <= 30) return false;
    return true;
  }).sort((a: any, b: any) => a.days_remaining - b.days_remaining);

  // 4. Stats
  const stats = {
    total: allData.length,
    expired: allData.filter((i: any) => i.days_remaining < 0).length,
    soon: allData.filter((i: any) => i.days_remaining >= 0 && i.days_remaining <= 30).length,
    active: allData.filter((i: any) => i.days_remaining > 30).length
  };

  return (
    <IqamaReportClient 
      company={company[0]}
      iqamaData={iqamaData}
      stats={stats}
      activeFilter={filter}
      searchQuery={search}
    />
  );
}

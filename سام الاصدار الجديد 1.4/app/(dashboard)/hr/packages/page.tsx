import React, { Suspense } from "react";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { PackagesClient } from "./packages-client";

export default async function PackagesPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  const session = JSON.parse(sessionCookie?.value || "{}");
  
  const companyId = session.company_id;

  const packages = await query(
    "SELECT * FROM employee_packages WHERE company_id = ? ORDER BY id DESC",
    [companyId]
  );

  // Load employee counts for each package
  const packageIds = packages.map((p: any) => p.id);
  let employeeCounts: any[] = [];
  if (packageIds.length > 0) {
    employeeCounts = await query(
      `SELECT package_id, COUNT(*) as count FROM employees WHERE package_id IN (${packageIds.map(() => '?').join(',')}) GROUP BY package_id`,
      packageIds
    );
  }
  const countMap = new Map(employeeCounts.map((r: any) => [r.package_id, Number(r.count)]));
  const packagesWithCounts = packages.map((p: any) => ({
    ...p,
    employees_count: countMap.get(p.id) || 0,
  }));

  return (
    <Suspense fallback={<div className="p-8 text-center font-black">جاري التحميل...</div>}>
      <PackagesClient 
          initialPackages={packagesWithCounts} 
          companyId={companyId}
        />
    </Suspense>
  );
}

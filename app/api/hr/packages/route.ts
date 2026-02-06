import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get("company_id");
  if (!companyId) {
    return NextResponse.json([], { status: 400 });
  }

  const packages = await query(
    "SELECT * FROM employee_packages WHERE company_id = ? ORDER BY id DESC",
    [companyId]
  );

  // Load employee counts
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

  return NextResponse.json(packagesWithCounts);
}

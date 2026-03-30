import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");
    const packageId = searchParams.get("package_id");

    if (!companyId) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 });
    }

    if (packageId) {
      const packages = await query<any>(
        `SELECT * FROM employee_packages WHERE id = ? AND company_id = ?`,
        [packageId, companyId]
      );

      if (packages.length === 0) {
        return NextResponse.json({ error: "الباقة غير موجودة" }, { status: 404 });
      }

      const pkg = packages[0];

      const employees = await query<any>(
        `SELECT * FROM employees WHERE package_id = ? AND is_active = 1`,
        [packageId]
      );

      let tiers: any[] = [];
      let slabs: any[] = [];

      if (pkg.work_type === 'tiers') {
        tiers = await query<any>(
          `SELECT * FROM package_tiers WHERE package_id = ? ORDER BY min_orders ASC`,
          [packageId]
        );

        slabs = await query<any>(
          `SELECT * FROM package_slabs WHERE package_id = ? ORDER BY from_orders ASC`,
          [packageId]
        );
      }

      return NextResponse.json({
        package: pkg,
        employees,
        tiers,
        slabs
      });
    }

    const packages = await query<any>(
      `SELECT * FROM employee_packages WHERE company_id = ? ORDER BY id DESC`,
      [companyId]
    );

    return NextResponse.json(packages);
  } catch (error) {
    console.error("Error fetching packages:", error);
    return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 });
  }
}

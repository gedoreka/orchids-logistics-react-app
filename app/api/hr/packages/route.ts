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

  return NextResponse.json(packages);
}

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");

    if (!companyId) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 });
    }

    const costCenters = await query(
      `SELECT id, center_code, center_name, company_id, parent_id, center_type, center_level, parent_center, description 
       FROM cost_centers 
       WHERE company_id = ? 
       ORDER BY center_code ASC`,
      [companyId]
    );

    return NextResponse.json({ success: true, costCenters });
  } catch (error) {
    console.error("Error fetching cost centers:", error);
    return NextResponse.json({ error: "Failed to fetch cost centers" }, { status: 500 });
  }
}

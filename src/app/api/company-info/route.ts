import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const companyId = searchParams.get("company_id");

  if (!companyId) {
    return NextResponse.json({ error: "company_id required" }, { status: 400 });
  }

  try {
    const companies = await query<any>(
      "SELECT id, name, logo_path, commercial_number, vat_number FROM companies WHERE id = ?",
      [companyId]
    );

    if (companies.length === 0) {
      return NextResponse.json({ company: null });
    }

    return NextResponse.json({ company: companies[0] });
  } catch (error) {
    console.error("Error fetching company info:", error);
    return NextResponse.json(
      { error: "Failed to fetch company info" },
      { status: 500 }
    );
  }
}

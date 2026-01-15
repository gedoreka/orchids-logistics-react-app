import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("auth_session");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const companyId = session.company_id;

    if (!companyId) {
      return NextResponse.json({ error: "No company_id in session" }, { status: 400 });
    }

    const companies = await query<any>(
      "SELECT id, name, logo_path, commercial_number, vat_number, phone, currency, country, region FROM companies WHERE id = ?",
      [companyId]
    );

    if (companies.length === 0) {
      return NextResponse.json({ company: null });
    }

    return NextResponse.json({ company: companies[0], company_id: companyId });
  } catch (error) {
    console.error("Error fetching company info:", error);
    return NextResponse.json(
      { error: "Failed to fetch company info" },
      { status: 500 }
    );
  }
}

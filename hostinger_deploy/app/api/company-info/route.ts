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
      "SELECT id, name, logo_path, commercial_number, vat_number, phone, currency, country, region, letterhead_path, letterhead_top_margin, letterhead_bottom_margin FROM companies WHERE id = ?",
      [companyId]
    );

    if (companies.length === 0) {
      return NextResponse.json({ company: null });
    }

    const company = companies[0];

    // Fetch user email to use as company email
    const users = await query<any>(
      "SELECT email FROM users WHERE id = ?",
      [session.user_id]
    );
    
    if (users && users.length > 0) {
      company.email = users[0].email;
    }

    // Fetch company permissions from company_permissions table
    const permissionsRows = await query<{ feature_key: string }>(
      "SELECT feature_key FROM company_permissions WHERE company_id = ? AND is_enabled = 1",
      [companyId]
    );

    // Convert to object format { permission_key: 1 }
    const permissions: Record<string, number> = {};
    permissionsRows.forEach((row) => {
      permissions[row.feature_key] = 1;
    });

    return NextResponse.json({ company, company_id: companyId, permissions });
  } catch (error) {
    console.error("Error fetching company info:", error);
    return NextResponse.json(
      { error: "Failed to fetch company info" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const data = await request.json();
    const { letterhead_path, letterhead_top_margin, letterhead_bottom_margin } = data;

    const updates: string[] = [];
    const params: any[] = [];

    if (letterhead_path !== undefined) {
      updates.push("letterhead_path = ?");
      params.push(letterhead_path);
    }
    if (letterhead_top_margin !== undefined) {
      updates.push("letterhead_top_margin = ?");
      params.push(letterhead_top_margin);
    }
    if (letterhead_bottom_margin !== undefined) {
      updates.push("letterhead_bottom_margin = ?");
      params.push(letterhead_bottom_margin);
    }

    if (updates.length > 0) {
      params.push(companyId);
      await query(
        `UPDATE companies SET ${updates.join(", ")} WHERE id = ?`,
        params
      );
    }

    return NextResponse.json({ success: true, message: "Company info updated successfully" });
  } catch (error: any) {
    console.error("Error updating company info:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

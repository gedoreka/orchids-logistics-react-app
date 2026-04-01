import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { cookies } from "next/headers";

async function requireAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get("auth_session");
  if (!session) return false;
  try { return JSON.parse(session.value).role === "admin"; } catch { return false; }
}

export async function GET(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all";
    const search = searchParams.get("search") || "";

    let sql = "SELECT * FROM companies WHERE 1=1";
    const params: any[] = [];

    if (search) {
      sql += " AND (name LIKE ? OR commercial_number LIKE ? OR vat_number LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (filter === "approved") {
      sql += " AND status = 'approved'";
    } else if (filter === "rejected") {
      sql += " AND status = 'rejected'";
    } else if (filter === "pending") {
      sql += " AND status NOT IN ('approved', 'rejected')";
    }

    sql += " ORDER BY created_at DESC";

    const companies = await query(sql, params);

    return NextResponse.json(companies);
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 });
  }
}

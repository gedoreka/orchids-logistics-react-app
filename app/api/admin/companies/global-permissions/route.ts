import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

async function requireAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get("auth_session");
  if (!session) return false;
  try { return JSON.parse(session.value).role === "admin"; } catch { return false; }
}

// GET: returns the list of all company IDs + a sample of enabled features from the first company
export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  try {
    // Get all active companies
    const companies = await query<{ id: number; name: string }>(
      "SELECT id, name FROM companies WHERE status = 'approved' AND is_active = 1 ORDER BY id ASC",
      []
    );

    // Get features enabled for the first company as a baseline (or empty if none)
    let defaultFeatures: string[] = [];
    if (companies && companies.length > 0) {
      const firstPerms = await query<{ feature_key: string }>(
        "SELECT feature_key FROM company_permissions WHERE company_id = ? AND is_enabled = 1",
        [(companies as any[])[0].id]
      );
      defaultFeatures = (firstPerms as any[]).map((p: any) => p.feature_key);
    }

    return NextResponse.json({
      companies,
      defaultFeatures,
      totalCompanies: (companies as any[]).length,
    });
  } catch (error: any) {
    console.error("Error fetching global permissions data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: apply the selected features to ALL active companies
export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  try {
    const { features } = await request.json();

    if (!Array.isArray(features)) {
      return NextResponse.json({ error: "Invalid features array" }, { status: 400 });
    }

    // Get all active companies
    const companies = await query<{ id: number }>(
      "SELECT id FROM companies WHERE status = 'approved' AND is_active = 1",
      []
    );

    let updatedCount = 0;
    for (const company of companies as any[]) {
      await execute("DELETE FROM company_permissions WHERE company_id = ?", [company.id]);
      for (const featureKey of features) {
        await execute(
          "INSERT INTO company_permissions (company_id, feature_key, is_enabled) VALUES (?, ?, 1)",
          [company.id, featureKey]
        );
      }
      updatedCount++;
    }

    return NextResponse.json({ success: true, updatedCount });
  } catch (error: any) {
    console.error("Error saving global permissions:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

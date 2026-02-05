import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const companyId = parseInt(id);
    const { features } = await request.json();

    if (!Array.isArray(features)) {
      return NextResponse.json({ error: "Invalid features array" }, { status: 400 });
    }

    await execute("DELETE FROM company_permissions WHERE company_id = ?", [companyId]);

    for (const featureKey of features) {
      await execute(
        "INSERT INTO company_permissions (company_id, feature_key, is_enabled) VALUES (?, ?, 1)",
        [companyId, featureKey]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error saving permissions:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    
    const permissions = await query(
      "SELECT feature_key FROM company_permissions WHERE company_id = ? AND is_enabled = 1",
      [id]
    );

    const enabledFeatures = (permissions as any[]).map(p => p.feature_key);

    return NextResponse.json({ features: enabledFeatures });
  } catch (error: any) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

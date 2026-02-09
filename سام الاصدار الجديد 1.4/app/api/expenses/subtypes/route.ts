import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");
    const userId = searchParams.get("user_id");

    if (!companyId) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 });
    }

    const subtypes = await query(
      `SELECT * FROM expense_subtypes 
       WHERE (company_id = ? OR (is_custom = FALSE AND company_id = 1))
       AND (is_custom = FALSE OR added_by = ? OR company_id = 1)
       ORDER BY main_type, sort_order, subtype_name`,
      [companyId, userId]
    );

    return NextResponse.json(subtypes);
  } catch (error) {
    console.error("Error fetching subtypes:", error);
    return NextResponse.json({ error: "Failed to fetch subtypes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_id, user_id, main_type, subtype_name, sort_order = 0 } = body;

    if (!company_id || !main_type || !subtype_name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await execute(
      `INSERT INTO expense_subtypes 
       (company_id, main_type, subtype_name, is_custom, added_by, sort_order) 
       VALUES (?, ?, ?, TRUE, ?, ?)`,
      [company_id, main_type, subtype_name, user_id, sort_order]
    );

    return NextResponse.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error("Error creating subtype:", error);
    return NextResponse.json({ error: "Failed to create subtype" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const companyId = searchParams.get("company_id");

    if (!id || !companyId) {
      return NextResponse.json({ error: "ID and Company ID required" }, { status: 400 });
    }

    // Ensure we only delete custom subtypes or verify ownership if needed
    await execute(
      "DELETE FROM expense_subtypes WHERE id = ? AND company_id = ? AND is_custom = TRUE",
      [id, companyId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting subtype:", error);
    return NextResponse.json({ error: "Failed to delete subtype" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");
    const userId = searchParams.get("user_id");

    if (!companyId) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 });
    }

      const subtypes = await query(
        `SELECT id, main_type, subtype_name, is_custom, added_by
         FROM deduction_subtypes 
         WHERE company_id = ?
         ORDER BY main_type, sort_order, subtype_name`,
        [companyId]
      );

    return NextResponse.json({ success: true, subtypes });
  } catch (error) {
    console.error("Error fetching deduction subtypes:", error);
    return NextResponse.json({ error: "Failed to fetch subtypes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_id, user_id, main_type, subtype_name } = body;

    if (!company_id || !main_type || !subtype_name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await query(
      "INSERT INTO deduction_subtypes (company_id, main_type, subtype_name, is_custom, added_by) VALUES (?, ?, ?, TRUE, ?)",
      [company_id, main_type, subtype_name, user_id]
    );

    return NextResponse.json({ success: true, message: "Subtype added successfully" });
  } catch (error) {
    console.error("Error adding deduction subtype:", error);
    return NextResponse.json({ error: "Failed to add subtype" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("user_id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    // Only allow deleting custom subtypes added by the user
    await query(
      "DELETE FROM deduction_subtypes WHERE id = ? AND is_custom = TRUE AND added_by = ?",
      [id, userId]
    );

    return NextResponse.json({ success: true, message: "Subtype deleted successfully" });
  } catch (error) {
    console.error("Error deleting deduction subtype:", error);
    return NextResponse.json({ error: "Failed to delete subtype" }, { status: 500 });
  }
}

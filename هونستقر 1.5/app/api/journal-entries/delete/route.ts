import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const entry_number = searchParams.get("entry_number");
    const company_id = searchParams.get("company_id");

    if (!entry_number || !company_id) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Check source_type - prevent deleting auto entries
    const existing = await query<any>(
      `SELECT source_type FROM journal_entries WHERE entry_number = ? AND company_id = ? LIMIT 1`,
      [entry_number, company_id]
    );

    if (existing.length > 0 && existing[0].source_type && existing[0].source_type !== "manual") {
      return NextResponse.json(
        { error: "Cannot delete automatic entries" },
        { status: 403 }
      );
    }

    await execute(
      `DELETE FROM journal_entries WHERE entry_number = ? AND company_id = ?`,
      [entry_number, company_id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting journal entry:", error);
    return NextResponse.json(
      { error: "Failed to delete journal entry" },
      { status: 500 }
    );
  }
}

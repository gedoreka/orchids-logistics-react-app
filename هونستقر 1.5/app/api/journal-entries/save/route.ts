import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entry_number, entry_date, lines, company_id, created_by, is_edit, status } = body;

    if (!entry_number || !entry_date || !lines || !company_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate balance
    let totalDebit = 0;
    let totalCredit = 0;
    for (const line of lines) {
      totalDebit += parseFloat(line.debit) || 0;
      totalCredit += parseFloat(line.credit) || 0;
    }

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return NextResponse.json({ error: "Debit and Credit must be equal" }, { status: 400 });
    }

    // If edit, check source_type - prevent editing auto entries
    if (is_edit) {
      const existing = await query<any>(
        `SELECT source_type FROM journal_entries WHERE entry_number = ? AND company_id = ? LIMIT 1`,
        [entry_number, company_id]
      );

      if (existing.length > 0 && existing[0].source_type && existing[0].source_type !== "manual") {
        return NextResponse.json({ error: "Cannot edit automatic entries" }, { status: 403 });
      }

      await execute(
        `DELETE FROM journal_entries WHERE entry_number = ? AND company_id = ?`,
        [entry_number, company_id]
      );
    }

    const entryStatus = status || "draft";
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    // Insert new lines
    const validLines = lines.filter((line: any) =>
      (parseFloat(line.debit) > 0 || parseFloat(line.credit) > 0) && line.account_id
    );

    if (validLines.length === 0) {
      return NextResponse.json({ error: "No valid lines to save" }, { status: 400 });
    }

    for (const line of validLines) {
      await execute(
        `INSERT INTO journal_entries (entry_number, entry_date, account_id, cost_center_id, description, debit, credit, company_id, created_by, source_type, status, updated_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'manual', ?, ?, NOW())`,
        [
          entry_number,
          entry_date,
          parseInt(line.account_id),
          line.cost_center_id ? parseInt(line.cost_center_id) : null,
          line.description || "",
          parseFloat(line.debit) || 0,
          parseFloat(line.credit) || 0,
          parseInt(company_id),
          created_by || "System",
          entryStatus,
          now,
        ]
      );
    }

    return NextResponse.json({ success: true, entry_number });
  } catch (error) {
    console.error("Error saving journal entry:", error);
    return NextResponse.json(
      { error: "Failed to save journal entry" },
      { status: 500 }
    );
  }
}

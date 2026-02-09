import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const companyId = searchParams.get("company_id");

  if (!companyId) {
    return NextResponse.json({ error: "company_id required" }, { status: 400 });
  }

  try {
    // Fetch accounts from MySQL (full hierarchy)
    const accounts = await query<any>(
      `SELECT id, account_code, account_name, type, parent_id, account_type, account_level, parent_account
       FROM accounts WHERE company_id = ? ORDER BY account_code`,
      [companyId]
    );

    // Fetch cost centers from MySQL (full hierarchy)
    const costCenters = await query<any>(
      `SELECT id, center_code, center_name, center_type, parent_id, center_level, parent_center
       FROM cost_centers WHERE company_id = ? ORDER BY center_code`,
      [companyId]
    );

    // Get next entry number
    const latestEntryRows = await query<any>(
      `SELECT entry_number FROM journal_entries WHERE company_id = ? ORDER BY id DESC LIMIT 1`,
      [companyId]
    );

    let nextNumber = 1;
    if (latestEntryRows.length > 0 && latestEntryRows[0].entry_number) {
      const match = latestEntryRows[0].entry_number.match(/\d+/);
      if (match) {
        nextNumber = parseInt(match[0]) + 1;
      }
    }
    const entryNumber = "JE" + String(nextNumber).padStart(5, "0");

    // Fetch entries
    const rawEntries = await query<any>(
      `SELECT je.*, 
        a.account_name, a.account_code,
        cc.center_name, cc.center_code
      FROM journal_entries je
      LEFT JOIN accounts a ON je.account_id = a.id
      LEFT JOIN cost_centers cc ON je.cost_center_id = cc.id
      WHERE je.company_id = ?
      ORDER BY je.entry_date DESC, je.entry_number DESC`,
      [companyId]
    );

    const entries = rawEntries.map((e: any) => ({
      ...e,
      accounts: e.account_name ? { account_name: e.account_name, account_code: e.account_code } : null,
      cost_centers: e.center_name ? { center_name: e.center_name, center_code: e.center_code } : null,
    }));

    return NextResponse.json({
      accounts: accounts || [],
      costCenters: costCenters || [],
      entryNumber,
      entries: entries || [],
    });
  } catch (error) {
    console.error("Error fetching journal entries metadata:", error);
    return NextResponse.json(
      { error: "Failed to fetch metadata" },
      { status: 500 }
    );
  }
}

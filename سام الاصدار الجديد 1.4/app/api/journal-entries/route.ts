import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const companyId = searchParams.get("company_id");
  const fromDate = searchParams.get("from_date");
  const toDate = searchParams.get("to_date");
  const sourceType = searchParams.get("source_type");
  const status = searchParams.get("status");

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

    // Get next entry number from MySQL
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

    // Build entries query with filters
    let entriesSql = `
      SELECT je.*, 
        a.account_name, a.account_code,
        cc.center_name, cc.center_code
      FROM journal_entries je
      LEFT JOIN accounts a ON je.account_id = a.id
      LEFT JOIN cost_centers cc ON je.cost_center_id = cc.id
      WHERE je.company_id = ?
    `;
    const params: any[] = [companyId];

    if (fromDate) {
      entriesSql += ` AND je.entry_date >= ?`;
      params.push(fromDate);
    }
    if (toDate) {
      entriesSql += ` AND je.entry_date <= ?`;
      params.push(toDate);
    }
    if (sourceType && sourceType !== "all") {
      if (sourceType === "manual") {
        entriesSql += ` AND (je.source_type IS NULL OR je.source_type = 'manual')`;
      } else {
        entriesSql += ` AND je.source_type = ?`;
        params.push(sourceType);
      }
    }
    if (status && status !== "all") {
      entriesSql += ` AND je.status = ?`;
      params.push(status);
    }

    entriesSql += ` ORDER BY je.entry_date DESC, je.entry_number DESC`;

    const rawEntries = await query<any>(entriesSql, params);

    // Transform entries to match expected shape
    const allEntries = rawEntries.map((e: any) => {
      let entryDate = e.entry_date;
      try {
        if (entryDate instanceof Date && !isNaN(entryDate.getTime())) {
          entryDate = entryDate.toISOString().split("T")[0];
        } else if (entryDate) {
          entryDate = String(entryDate).split("T")[0];
        } else {
          entryDate = "";
        }
      } catch {
        entryDate = String(entryDate || "");
      }
      return {
        ...e,
        entry_date: entryDate,
        accounts: e.account_name ? { account_name: e.account_name, account_code: e.account_code } : null,
        cost_centers: e.center_name ? { center_name: e.center_name, center_code: e.center_code } : null,
      };
    });

    // Calculate stats
    let totalDebit = 0;
    let totalCredit = 0;
    const entryNumbers = new Set<string>();
    let draftsCount = 0;
    let approvedCount = 0;

    allEntries.forEach((e: any) => {
      totalDebit += parseFloat(e.debit) || 0;
      totalCredit += parseFloat(e.credit) || 0;
      entryNumbers.add(e.entry_number);
    });

    // Count by status (per unique entry_number)
    const statusMap: Record<string, string> = {};
    allEntries.forEach((e: any) => {
      if (!statusMap[e.entry_number]) {
        statusMap[e.entry_number] = e.status || "draft";
      }
    });
    Object.values(statusMap).forEach((s) => {
      if (s === "approved") approvedCount++;
      else draftsCount++;
    });

    // Monthly trend for charts
    const monthlyMap: Record<string, { debit: number; credit: number }> = {};
      allEntries.forEach((e: any) => {
      let dateStr = "";
      try {
        const d = e.entry_date;
        if (d && typeof d === "string" && d.length >= 7) {
          dateStr = d.substring(0, 7);
        }
      } catch {
        dateStr = "";
      }
      if (dateStr) {
        if (!monthlyMap[dateStr]) monthlyMap[dateStr] = { debit: 0, credit: 0 };
        monthlyMap[dateStr].debit += parseFloat(e.debit) || 0;
        monthlyMap[dateStr].credit += parseFloat(e.credit) || 0;
      }
    });

    const monthlyTrend = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, vals]) => ({ month, ...vals }));

    // Top accounts
    const accountTotals: Record<string, { name: string; total: number }> = {};
    allEntries.forEach((e: any) => {
      const accName = e.accounts?.account_name || "Unknown";
      const accId = String(e.account_id);
      if (!accountTotals[accId]) accountTotals[accId] = { name: accName, total: 0 };
      accountTotals[accId].total += (parseFloat(e.debit) || 0) + (parseFloat(e.credit) || 0);
    });

    const topAccounts = Object.values(accountTotals)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    return NextResponse.json({
      accounts: accounts || [],
      costCenters: costCenters || [],
      entryNumber,
      entries: allEntries,
      stats: {
        totalDebit,
        totalCredit,
        entriesCount: entryNumbers.size,
        draftsCount,
        approvedCount,
      },
      monthlyTrend,
      topAccounts,
    });
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch journal entries" },
      { status: 500 }
    );
  }
}

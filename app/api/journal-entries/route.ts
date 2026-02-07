import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
    // Fetch accounts
    const { data: accounts, error: accountsError } = await supabase
      .from("accounts")
      .select("id, account_code, account_name, account_level, parent_account")
      .eq("company_id", companyId)
      .order("account_code", { ascending: true });

    if (accountsError) throw accountsError;

    // Fetch cost centers
    const { data: costCenters, error: costCentersError } = await supabase
      .from("cost_centers")
      .select("id, center_code, center_name")
      .eq("company_id", companyId)
      .order("center_code", { ascending: true });

    if (costCentersError) throw costCentersError;

    // Get next entry number
    const { data: latestEntry } = await supabase
      .from("journal_entries")
      .select("entry_number")
      .eq("company_id", companyId)
      .order("entry_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    let nextNumber = 1;
    if (latestEntry?.entry_number) {
      const match = latestEntry.entry_number.match(/\d+/);
      if (match) {
        nextNumber = parseInt(match[0]) + 1;
      }
    }
    const entryNumber = "JE" + String(nextNumber).padStart(5, "0");

    // Fetch entries with filters
    let entriesQuery = supabase
      .from("journal_entries")
      .select("*, accounts(account_name, account_code), cost_centers(center_name, center_code)")
      .eq("company_id", companyId);

    if (fromDate) {
      entriesQuery = entriesQuery.gte("entry_date", fromDate);
    }
    if (toDate) {
      entriesQuery = entriesQuery.lte("entry_date", toDate);
    }
    if (sourceType && sourceType !== "all") {
      if (sourceType === "manual") {
        entriesQuery = entriesQuery.or("source_type.is.null,source_type.eq.manual");
      } else {
        entriesQuery = entriesQuery.eq("source_type", sourceType);
      }
    }
    if (status && status !== "all") {
      entriesQuery = entriesQuery.eq("status", status);
    }

    const { data: entries, error: entriesError } = await entriesQuery
      .order("entry_date", { ascending: false })
      .order("entry_number", { ascending: false });

    if (entriesError) throw entriesError;

    // Calculate stats
    const allEntries = entries || [];
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
      const month = e.entry_date?.substring(0, 7); // YYYY-MM
      if (month) {
        if (!monthlyMap[month]) monthlyMap[month] = { debit: 0, credit: 0 };
        monthlyMap[month].debit += parseFloat(e.debit) || 0;
        monthlyMap[month].credit += parseFloat(e.credit) || 0;
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

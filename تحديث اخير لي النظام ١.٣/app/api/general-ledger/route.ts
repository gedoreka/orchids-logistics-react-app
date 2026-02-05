import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase-client";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("auth_session");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const companyId = session.company_id;

    if (!companyId) {
      return NextResponse.json({ error: "Company ID not found" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get("from_date");
    const toDate = searchParams.get("to_date");
    const accountId = searchParams.get("account_id");
    const costCenterId = searchParams.get("cost_center_id");
    const search = searchParams.get("search");
    const entryType = searchParams.get("entry_type");

    // 1. Fetch metadata
    const [{ data: accounts }, { data: costCenters }] = await Promise.all([
      supabase.from("accounts").select("id, account_code, account_name, type").eq("company_id", companyId).order("account_code"),
      supabase.from("cost_centers").select("id, center_code, center_name").eq("company_id", companyId).order("center_code")
    ]);

    // 2. Build query for journal entries
    let query = supabase
      .from("journal_entries")
      .select(`
        *,
        accounts:account_id(id, account_code, account_name, type),
        cost_centers:cost_center_id(id, center_code, center_name)
      `)
      .eq("company_id", companyId);

    if (fromDate) query = query.gte("entry_date", fromDate);
    if (toDate) query = query.lte("entry_date", toDate);
    if (accountId) query = query.eq("account_id", accountId);
    if (costCenterId) query = query.eq("cost_center_id", costCenterId);
    
    const { data: entries, error } = await query.order("entry_date", { ascending: false }).order("created_at", { ascending: false });

    if (error) throw error;

    // 3. Process entries for response
    let filteredEntries = (entries || []).map(entry => ({
      id: entry.id,
      date: entry.entry_date,
      document_number: entry.entry_number,
      description: entry.description,
      account_code: entry.accounts?.account_code || "",
      account_name: entry.accounts?.account_name || "",
      account_type: entry.accounts?.type || "",
      cost_center_code: entry.cost_centers?.center_code || "",
      cost_center_name: entry.cost_centers?.center_name || "",
      debit: Number(entry.debit) || 0,
      credit: Number(entry.credit) || 0,
      source: "journal_entry",
      source_type: "قيد يومية",
      account_id: entry.account_id,
      cost_center_id: entry.cost_center_id,
      created_at: entry.created_at
    }));

    // 4. Apply text search if provided
    if (search) {
      const s = search.toLowerCase();
      filteredEntries = filteredEntries.filter(e => 
        e.description?.toLowerCase().includes(s) || 
        e.document_number?.toLowerCase().includes(s) ||
        e.account_name?.toLowerCase().includes(s) ||
        e.account_code?.toLowerCase().includes(s)
      );
    }

    // 5. Apply entry type filter
    if (entryType && entryType !== "all") {
      if (entryType === "debit") filteredEntries = filteredEntries.filter(e => e.debit > 0);
      if (entryType === "credit") filteredEntries = filteredEntries.filter(e => e.credit > 0);
    }

    // 6. Calculate Stats
    const totalDebit = filteredEntries.reduce((sum, e) => sum + e.debit, 0);
    const totalCredit = filteredEntries.reduce((sum, e) => sum + e.credit, 0);
    const finalBalance = totalDebit - totalCredit;

    // 7. Calculate Charts
    const entriesByMonth: Record<string, number> = {};
    const accountTotals: Record<string, { name: string, total: number }> = {};
    const costCenterTotals: Record<string, { name: string, total: number }> = {};

    filteredEntries.forEach(e => {
      const month = e.date.substring(0, 7);
      entriesByMonth[month] = (entriesByMonth[month] || 0) + e.debit;

      if (e.account_code) {
        if (!accountTotals[e.account_code]) accountTotals[e.account_code] = { name: e.account_name, total: 0 };
        accountTotals[e.account_code].total += e.debit + e.credit;
      }

      if (e.cost_center_code) {
        if (!costCenterTotals[e.cost_center_code]) costCenterTotals[e.cost_center_code] = { name: e.cost_center_name, total: 0 };
        costCenterTotals[e.cost_center_code].total += e.debit + e.credit;
      }
    });

    return NextResponse.json({
      entries: filteredEntries,
      stats: {
        totalDebit,
        totalCredit,
        finalBalance,
        entriesCount: filteredEntries.length,
        activeAccounts: Object.keys(accountTotals).length
      },
      chartData: {
        monthlyTrend: Object.entries(entriesByMonth).map(([month, amount]) => ({ month, amount })),
        topAccounts: Object.entries(accountTotals).map(([code, d]) => ({ name: d.name, total: d.total })).sort((a, b) => b.total - a.total).slice(0, 10),
        costCenterDistribution: Object.entries(costCenterTotals).map(([code, d]) => ({ name: d.name, total: d.total }))
      },
      metadata: {
        accounts: accounts || [],
        costCenters: costCenters || []
      }
    });
  } catch (error) {
    console.error("General Ledger API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

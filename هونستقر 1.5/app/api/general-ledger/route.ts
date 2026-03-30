import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase-client";
import { query as mysqlQuery } from "@/lib/db";

interface UnifiedEntry {
  id: string;
  date: string;
  document_number: string;
  description: string;
  account_code: string;
  account_name: string;
  account_type: string;
  cost_center_code: string;
  cost_center_name: string;
  debit: number;
  credit: number;
  source: string;
  source_type: string;
  account_id: number | null;
  cost_center_id: number | null;
  created_at: string;
}

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
    const sourceFilter = searchParams.get("source") || "all";

    // 1. Fetch metadata from Supabase
    const [{ data: accounts }, { data: costCenters }] = await Promise.all([
      supabase.from("accounts").select("id, account_code, account_name, type").eq("company_id", companyId).order("account_code"),
      supabase.from("cost_centers").select("id, center_code, center_name").eq("company_id", companyId).order("center_code")
    ]);

    // Build lookup maps for account/cost center resolution
    const accountMap = new Map<number, { account_code: string; account_name: string; type: string }>();
    const accountByCodeMap = new Map<string, { id: number; account_code: string; account_name: string; type: string }>();
    (accounts || []).forEach((a: any) => {
      accountMap.set(a.id, { account_code: a.account_code, account_name: a.account_name, type: a.type });
      accountByCodeMap.set(a.account_code, { id: a.id, ...a });
    });
    const costCenterMap = new Map<number, { center_code: string; center_name: string }>();
    (costCenters || []).forEach((c: any) => {
      costCenterMap.set(c.id, { center_code: c.center_code, center_name: c.center_name });
    });

    const allEntries: UnifiedEntry[] = [];

    // ===== SOURCE 1: Supabase Journal Entries =====
    if (sourceFilter === "all" || sourceFilter === "journal") {
      let q = supabase
        .from("journal_entries")
        .select(`
          *,
          accounts:account_id(id, account_code, account_name, type),
          cost_centers:cost_center_id(id, center_code, center_name)
        `)
        .eq("company_id", companyId);

      if (fromDate) q = q.gte("entry_date", fromDate);
      if (toDate) q = q.lte("entry_date", toDate);
      if (accountId) q = q.eq("account_id", accountId);
      if (costCenterId) q = q.eq("cost_center_id", costCenterId);

      const { data: entries, error } = await q.order("entry_date", { ascending: false }).order("created_at", { ascending: false });
      if (error) console.error("Journal entries fetch error:", error);

      (entries || []).forEach(entry => {
        // Determine source label based on source_type
        let sourceLabel = "قيد يومية";
        let sourceKey = "journal";
        if (entry.source_type === "payroll") { sourceLabel = "مسير رواتب"; sourceKey = "payroll"; }
        else if (entry.source_type === "sales_invoice") { sourceLabel = "فاتورة مبيعات"; sourceKey = "invoice"; }
        else if (entry.source_type === "expense") { sourceLabel = "مصروفات"; sourceKey = "expense"; }

        allEntries.push({
          id: `je-${entry.id}`,
          date: entry.entry_date,
          document_number: entry.entry_number || "",
          description: entry.description || "",
          account_code: entry.accounts?.account_code || "",
          account_name: entry.accounts?.account_name || "",
          account_type: entry.accounts?.type || "",
          cost_center_code: entry.cost_centers?.center_code || "",
          cost_center_name: entry.cost_centers?.center_name || "",
          debit: Number(entry.debit) || 0,
          credit: Number(entry.credit) || 0,
          source: sourceKey,
          source_type: sourceLabel,
          account_id: entry.account_id,
          cost_center_id: entry.cost_center_id,
          created_at: entry.created_at
        });
      });
    }

    // ===== SOURCE 2: MySQL Expenses =====
    if (sourceFilter === "all" || sourceFilter === "expense") {
      try {
        let expSql = `SELECT e.*, a.account_name, a.account_code as acc_code, c.center_code, c.center_name
          FROM monthly_expenses e
          LEFT JOIN accounts a ON e.account_id = a.id
          LEFT JOIN cost_centers c ON e.cost_center_id = c.id
          WHERE e.company_id = ?`;
        const expParams: any[] = [companyId];

        if (fromDate) { expSql += " AND e.expense_date >= ?"; expParams.push(fromDate); }
        if (toDate) { expSql += " AND e.expense_date <= ?"; expParams.push(toDate); }
        expSql += " ORDER BY e.expense_date DESC";

        const expenses = await mysqlQuery<any>(expSql, expParams);
        (expenses || []).forEach((e: any) => {
          const amount = parseFloat(e.amount || "0");
          const accCode = e.acc_code || e.account_code || "";
          const accName = e.account_name || "";
          const ccCode = e.center_code || e.cost_center_code || "";
          const ccName = e.center_name || "";

          allEntries.push({
            id: `exp-${e.id}`,
            date: e.expense_date ? new Date(e.expense_date).toISOString().split("T")[0] : "",
            document_number: `EXP-${e.id}`,
            description: e.description || e.expense_type || "مصروفات",
            account_code: accCode,
            account_name: accName,
            account_type: "expense",
            cost_center_code: ccCode,
            cost_center_name: ccName,
            debit: amount,
            credit: 0,
            source: "expense",
            source_type: "مصروفات",
            account_id: e.account_id || null,
            cost_center_id: e.cost_center_id || null,
            created_at: e.created_at || e.expense_date || ""
          });
        });
      } catch (err) {
        console.error("MySQL expenses fetch error:", err);
      }
    }

    // ===== SOURCE 3: MySQL Deductions =====
    if (sourceFilter === "all" || sourceFilter === "deduction") {
      try {
        let dedSql = `SELECT d.*, a.account_code, a.account_name, c.center_code, c.center_name
          FROM monthly_deductions d
          LEFT JOIN accounts a ON d.account_id = a.id
          LEFT JOIN cost_centers c ON d.cost_center_id = c.id
          WHERE d.company_id = ?`;
        const dedParams: any[] = [companyId];

        if (fromDate) { dedSql += " AND d.expense_date >= ?"; dedParams.push(fromDate); }
        if (toDate) { dedSql += " AND d.expense_date <= ?"; dedParams.push(toDate); }
        dedSql += " ORDER BY d.expense_date DESC";

        const deductions = await mysqlQuery<any>(dedSql, dedParams);
        (deductions || []).forEach((d: any) => {
          const amount = parseFloat(d.amount || "0");
          allEntries.push({
            id: `ded-${d.id}`,
            date: d.expense_date ? new Date(d.expense_date).toISOString().split("T")[0] : "",
            document_number: d.voucher_number || `DED-${d.id}`,
            description: d.description || d.deduction_type || "استقطاع",
            account_code: d.account_code || "",
            account_name: d.account_name || "",
            account_type: "deduction",
            cost_center_code: d.center_code || "",
            cost_center_name: d.center_name || "",
            debit: 0,
            credit: amount,
            source: "deduction",
            source_type: "استقطاع",
            account_id: d.account_id || null,
            cost_center_id: d.cost_center_id || null,
            created_at: d.created_at || d.expense_date || ""
          });
        });
      } catch (err) {
        console.error("MySQL deductions fetch error:", err);
      }
    }

    // ===== SOURCE 4: MySQL Payrolls =====
    if (sourceFilter === "all" || sourceFilter === "payroll") {
      try {
        let paySql = `SELECT p.*, a.account_code, a.account_name, c.center_code, c.center_name,
            pkg.group_name as package_name
          FROM salary_payrolls p
          LEFT JOIN accounts a ON p.account_id = a.id
          LEFT JOIN cost_centers c ON p.cost_center_id = c.id
          LEFT JOIN employee_packages pkg ON p.package_id = pkg.id
          WHERE p.company_id = ? AND (p.is_draft = 0 OR p.is_draft IS NULL)`;
        const payParams: any[] = [companyId];

        if (fromDate) { paySql += " AND CONCAT(p.payroll_month, '-01') >= ?"; payParams.push(fromDate); }
        if (toDate) { paySql += " AND CONCAT(p.payroll_month, '-01') <= ?"; payParams.push(toDate); }
        paySql += " ORDER BY p.payroll_month DESC";

        const payrolls = await mysqlQuery<any>(paySql, payParams);
        (payrolls || []).forEach((p: any) => {
          const amount = parseFloat(p.total_amount || "0");
          if (amount <= 0) return;

          allEntries.push({
            id: `pay-${p.id}`,
            date: `${p.payroll_month}-01`,
            document_number: `PAY-${p.id}`,
            description: `مسير رواتب ${p.payroll_month}${p.package_name ? ` - ${p.package_name}` : ""}`,
            account_code: p.account_code || "",
            account_name: p.account_name || "",
            account_type: "payroll",
            cost_center_code: p.center_code || "",
            cost_center_name: p.center_name || "",
            debit: amount,
            credit: 0,
            source: "payroll",
            source_type: "مسير رواتب",
            account_id: p.account_id || null,
            cost_center_id: p.cost_center_id || null,
            created_at: p.created_at || ""
          });
        });
      } catch (err) {
        console.error("MySQL payrolls fetch error:", err);
      }
    }

    // ===== SOURCE 5: MySQL Sales Invoices =====
    if (sourceFilter === "all" || sourceFilter === "invoice") {
      try {
        let invSql = `SELECT si.*, a.account_code, a.account_name, c.center_code, c.center_name
          FROM sales_invoices si
          LEFT JOIN accounts a ON si.account_id = a.id
          LEFT JOIN cost_centers c ON si.cost_center_id = c.id
          WHERE si.company_id = ?`;
        const invParams: any[] = [companyId];

        if (fromDate) { invSql += " AND si.issue_date >= ?"; invParams.push(fromDate); }
        if (toDate) { invSql += " AND si.issue_date <= ?"; invParams.push(toDate); }
        invSql += " ORDER BY si.issue_date DESC";

        const invoices = await mysqlQuery<any>(invSql, invParams);
        (invoices || []).forEach((inv: any) => {
          const totalAmount = parseFloat(inv.total_amount || "0");
          if (totalAmount <= 0) return;

          allEntries.push({
            id: `inv-${inv.id}`,
            date: inv.issue_date ? new Date(inv.issue_date).toISOString().split("T")[0] : "",
            document_number: inv.invoice_number || `INV-${inv.id}`,
            description: `فاتورة مبيعات ${inv.invoice_number || inv.id} - ${inv.client_name || ""}`,
            account_code: inv.account_code || "",
            account_name: inv.account_name || "",
            account_type: "revenue",
            cost_center_code: inv.center_code || "",
            cost_center_name: inv.center_name || "",
            debit: 0,
            credit: totalAmount,
            source: "invoice",
            source_type: "فاتورة مبيعات",
            account_id: inv.account_id || null,
            cost_center_id: inv.cost_center_id || null,
            created_at: inv.created_at || inv.issue_date || ""
          });
        });
      } catch (err) {
        console.error("MySQL invoices fetch error:", err);
      }
    }

    // ===== Apply filters on unified list =====
    let filteredEntries = allEntries;

    // Account filter (for MySQL entries that may not have been filtered server-side)
    if (accountId) {
      filteredEntries = filteredEntries.filter(e =>
        e.account_id === Number(accountId) || e.account_code === accountId
      );
    }

    // Cost center filter
    if (costCenterId) {
      filteredEntries = filteredEntries.filter(e =>
        e.cost_center_id === Number(costCenterId) || e.cost_center_code === costCenterId
      );
    }

    // Text search
    if (search) {
      const s = search.toLowerCase();
      filteredEntries = filteredEntries.filter(e =>
        e.description?.toLowerCase().includes(s) ||
        e.document_number?.toLowerCase().includes(s) ||
        e.account_name?.toLowerCase().includes(s) ||
        e.account_code?.toLowerCase().includes(s) ||
        e.cost_center_name?.toLowerCase().includes(s)
      );
    }

    // Entry type filter
    if (entryType && entryType !== "all") {
      if (entryType === "debit") filteredEntries = filteredEntries.filter(e => e.debit > 0);
      if (entryType === "credit") filteredEntries = filteredEntries.filter(e => e.credit > 0);
    }

    // Sort by date desc
    filteredEntries.sort((a, b) => {
      if (a.date > b.date) return -1;
      if (a.date < b.date) return 1;
      return 0;
    });

    // Calculate Stats
    const totalDebit = filteredEntries.reduce((sum, e) => sum + e.debit, 0);
    const totalCredit = filteredEntries.reduce((sum, e) => sum + e.credit, 0);
    const finalBalance = totalDebit - totalCredit;

    // Calculate Charts
    const entriesByMonth: Record<string, number> = {};
    const accountTotals: Record<string, { name: string; total: number }> = {};
    const costCenterTotals: Record<string, { name: string; total: number }> = {};
    const sourceTypeCounts: Record<string, number> = {};

    filteredEntries.forEach(e => {
      const month = e.date?.substring(0, 7) || "unknown";
      entriesByMonth[month] = (entriesByMonth[month] || 0) + e.debit;

      if (e.account_code) {
        if (!accountTotals[e.account_code]) accountTotals[e.account_code] = { name: e.account_name, total: 0 };
        accountTotals[e.account_code].total += e.debit + e.credit;
      }

      if (e.cost_center_code) {
        if (!costCenterTotals[e.cost_center_code]) costCenterTotals[e.cost_center_code] = { name: e.cost_center_name, total: 0 };
        costCenterTotals[e.cost_center_code].total += e.debit + e.credit;
      }

      sourceTypeCounts[e.source] = (sourceTypeCounts[e.source] || 0) + 1;
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
        monthlyTrend: Object.entries(entriesByMonth).map(([month, amount]) => ({ month, amount })).sort((a, b) => a.month.localeCompare(b.month)),
        topAccounts: Object.entries(accountTotals).map(([code, d]) => ({ name: d.name, total: d.total })).sort((a, b) => b.total - a.total).slice(0, 10),
        costCenterDistribution: Object.entries(costCenterTotals).map(([code, d]) => ({ name: d.name, total: d.total }))
      },
      sourceTypeCounts,
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

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase-client";
import { query as mysqlQuery } from "@/lib/db";

interface AccountBalance {
  account_id: number | null;
  account_code: string;
  account_name: string;
  account_type: string;
  total_debit: number;
  total_credit: number;
  closing_debit: number;
  closing_credit: number;
  entries_count: number;
  source_types: string[];
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
    const search = searchParams.get("search");
    const accountType = searchParams.get("account_type");
    const sourceFilter = searchParams.get("source") || "all";

    // 1. Fetch accounts and cost centers from Supabase
    const [{ data: accounts }, { data: costCenters }] = await Promise.all([
      supabase.from("accounts").select("id, account_code, account_name, type, opening_balance, balance_type").eq("company_id", companyId).order("account_code"),
      supabase.from("cost_centers").select("id, center_code, center_name").eq("company_id", companyId).order("center_code"),
    ]);

    const accountMap = new Map<number, { account_code: string; account_name: string; type: string; opening_balance: number; balance_type: string }>();
    (accounts || []).forEach((a: any) => {
      accountMap.set(a.id, {
        account_code: a.account_code,
        account_name: a.account_name,
        type: a.type,
        opening_balance: Number(a.opening_balance) || 0,
        balance_type: a.balance_type || "",
      });
    });

    // Aggregation map: account_code => totals
    const balanceMap = new Map<string, AccountBalance>();

    const getOrCreate = (code: string, name: string, type: string, accId: number | null): AccountBalance => {
      if (!balanceMap.has(code)) {
        balanceMap.set(code, {
          account_id: accId,
          account_code: code,
          account_name: name,
          account_type: type,
          total_debit: 0,
          total_credit: 0,
          closing_debit: 0,
          closing_credit: 0,
          entries_count: 0,
          source_types: [],
        });
      }
      return balanceMap.get(code)!;
    };

    // Track source type counts
    const sourceTypeCounts: Record<string, number> = {};

    // ===== SOURCE 1: Supabase Journal Entries =====
    if (sourceFilter === "all" || sourceFilter === "journal") {
      let q = supabase
        .from("journal_entries")
        .select("account_id, debit, credit, source_type")
        .eq("company_id", companyId);

      if (fromDate) q = q.gte("entry_date", fromDate);
      if (toDate) q = q.lte("entry_date", toDate);

      const { data: entries, error } = await q;
      if (error) console.error("Journal entries fetch error:", error);

      (entries || []).forEach((entry: any) => {
        const acc = accountMap.get(entry.account_id);
        if (!acc) return;

        const bal = getOrCreate(acc.account_code, acc.account_name, acc.type, entry.account_id);
        bal.total_debit += Number(entry.debit) || 0;
        bal.total_credit += Number(entry.credit) || 0;
        bal.entries_count++;

        const src = entry.source_type || "journal";
        if (!bal.source_types.includes(src)) bal.source_types.push(src);
        sourceTypeCounts[src] = (sourceTypeCounts[src] || 0) + 1;
      });
    }

    // ===== SOURCE 2: MySQL Expenses =====
    if (sourceFilter === "all" || sourceFilter === "expense") {
      try {
        let expSql = `SELECT e.account_id, e.amount, a.account_name, a.account_code
          FROM monthly_expenses e
          LEFT JOIN accounts a ON e.account_id = a.id
          WHERE e.company_id = ?`;
        const expParams: any[] = [companyId];

        if (fromDate) { expSql += " AND e.expense_date >= ?"; expParams.push(fromDate); }
        if (toDate) { expSql += " AND e.expense_date <= ?"; expParams.push(toDate); }

        const expenses = await mysqlQuery<any>(expSql, expParams);
        (expenses || []).forEach((e: any) => {
          const amount = parseFloat(e.amount || "0");
          if (amount <= 0) return;
          const code = e.account_code || `EXP-${e.account_id || "NA"}`;
          const name = e.account_name || "مصروفات";
          const bal = getOrCreate(code, name, "expense", e.account_id);
          bal.total_debit += amount;
          bal.entries_count++;
          if (!bal.source_types.includes("expense")) bal.source_types.push("expense");
          sourceTypeCounts["expense"] = (sourceTypeCounts["expense"] || 0) + 1;
        });
      } catch (err) {
        console.error("MySQL expenses fetch error:", err);
      }
    }

    // ===== SOURCE 3: MySQL Deductions =====
    if (sourceFilter === "all" || sourceFilter === "deduction") {
      try {
        let dedSql = `SELECT d.account_id, d.amount, a.account_code, a.account_name
          FROM monthly_deductions d
          LEFT JOIN accounts a ON d.account_id = a.id
          WHERE d.company_id = ?`;
        const dedParams: any[] = [companyId];

        if (fromDate) { dedSql += " AND d.expense_date >= ?"; dedParams.push(fromDate); }
        if (toDate) { dedSql += " AND d.expense_date <= ?"; dedParams.push(toDate); }

        const deductions = await mysqlQuery<any>(dedSql, dedParams);
        (deductions || []).forEach((d: any) => {
          const amount = parseFloat(d.amount || "0");
          if (amount <= 0) return;
          const code = d.account_code || `DED-${d.account_id || "NA"}`;
          const name = d.account_name || "استقطاع";
          const bal = getOrCreate(code, name, "deduction", d.account_id);
          bal.total_credit += amount;
          bal.entries_count++;
          if (!bal.source_types.includes("deduction")) bal.source_types.push("deduction");
          sourceTypeCounts["deduction"] = (sourceTypeCounts["deduction"] || 0) + 1;
        });
      } catch (err) {
        console.error("MySQL deductions fetch error:", err);
      }
    }

    // ===== SOURCE 4: MySQL Payrolls =====
    if (sourceFilter === "all" || sourceFilter === "payroll") {
      try {
        let paySql = `SELECT p.account_id, p.total_amount, a.account_code, a.account_name
          FROM salary_payrolls p
          LEFT JOIN accounts a ON p.account_id = a.id
          WHERE p.company_id = ? AND (p.is_draft = 0 OR p.is_draft IS NULL)`;
        const payParams: any[] = [companyId];

        if (fromDate) { paySql += " AND CONCAT(p.payroll_month, '-01') >= ?"; payParams.push(fromDate); }
        if (toDate) { paySql += " AND CONCAT(p.payroll_month, '-01') <= ?"; payParams.push(toDate); }

        const payrolls = await mysqlQuery<any>(paySql, payParams);
        (payrolls || []).forEach((p: any) => {
          const amount = parseFloat(p.total_amount || "0");
          if (amount <= 0) return;
          const code = p.account_code || `PAY-${p.account_id || "NA"}`;
          const name = p.account_name || "رواتب";
          const bal = getOrCreate(code, name, "payroll", p.account_id);
          bal.total_debit += amount;
          bal.entries_count++;
          if (!bal.source_types.includes("payroll")) bal.source_types.push("payroll");
          sourceTypeCounts["payroll"] = (sourceTypeCounts["payroll"] || 0) + 1;
        });
      } catch (err) {
        console.error("MySQL payrolls fetch error:", err);
      }
    }

    // ===== SOURCE 5: MySQL Sales Invoices =====
    if (sourceFilter === "all" || sourceFilter === "invoice") {
      try {
        let invSql = `SELECT si.account_id, si.total_amount, a.account_code, a.account_name
          FROM sales_invoices si
          LEFT JOIN accounts a ON si.account_id = a.id
          WHERE si.company_id = ?`;
        const invParams: any[] = [companyId];

        if (fromDate) { invSql += " AND si.issue_date >= ?"; invParams.push(fromDate); }
        if (toDate) { invSql += " AND si.issue_date <= ?"; invParams.push(toDate); }

        const invoices = await mysqlQuery<any>(invSql, invParams);
        (invoices || []).forEach((inv: any) => {
          const totalAmount = parseFloat(inv.total_amount || "0");
          if (totalAmount <= 0) return;
          const code = inv.account_code || `INV-${inv.account_id || "NA"}`;
          const name = inv.account_name || "مبيعات";
          const bal = getOrCreate(code, name, "revenue", inv.account_id);
          bal.total_credit += totalAmount;
          bal.entries_count++;
          if (!bal.source_types.includes("invoice")) bal.source_types.push("invoice");
          sourceTypeCounts["invoice"] = (sourceTypeCounts["invoice"] || 0) + 1;
        });
      } catch (err) {
        console.error("MySQL invoices fetch error:", err);
      }
    }

    // ===== Calculate closing balances =====
    let balances = Array.from(balanceMap.values());

    // Include opening balances and calculate closing
    balances.forEach(bal => {
      const accInfo = bal.account_id ? accountMap.get(bal.account_id) : null;
      const opening = accInfo?.opening_balance || 0;
      const balanceType = accInfo?.balance_type || "";
      const accType = accInfo?.type || bal.account_type;

      const netChange = bal.total_debit - bal.total_credit;

      // Debit-nature accounts: assets, expenses
      if (balanceType === "مدين" || accType === "اصل" || accType === "مصروف" || accType === "expense" || accType === "payroll") {
        const final = opening + netChange;
        if (final >= 0) {
          bal.closing_debit = final;
          bal.closing_credit = 0;
        } else {
          bal.closing_debit = 0;
          bal.closing_credit = Math.abs(final);
        }
      } else {
        // Credit-nature accounts: liabilities, equity, revenue
        const final = opening - netChange;
        if (final >= 0) {
          bal.closing_credit = final;
          bal.closing_debit = 0;
        } else {
          bal.closing_debit = Math.abs(final);
          bal.closing_credit = 0;
        }
      }
    });

    // Filter out zero-activity accounts
    balances = balances.filter(b => b.total_debit > 0 || b.total_credit > 0 || b.closing_debit > 0 || b.closing_credit > 0);

    // Apply search filter
    if (search) {
      const s = search.toLowerCase();
      balances = balances.filter(b =>
        b.account_code.toLowerCase().includes(s) ||
        b.account_name.toLowerCase().includes(s) ||
        b.account_type.toLowerCase().includes(s)
      );
    }

    // Apply account type filter
    if (accountType && accountType !== "all") {
      balances = balances.filter(b => b.account_type === accountType);
    }

    // Sort by account code
    balances.sort((a, b) => a.account_code.localeCompare(b.account_code));

    // Stats
    const totalDebit = balances.reduce((sum, b) => sum + b.total_debit, 0);
    const totalCredit = balances.reduce((sum, b) => sum + b.total_credit, 0);
    const totalClosingDebit = balances.reduce((sum, b) => sum + b.closing_debit, 0);
    const totalClosingCredit = balances.reduce((sum, b) => sum + b.closing_credit, 0);
    const difference = totalClosingDebit - totalClosingCredit;

    // Chart data: group by account type
    const typeGroups: Record<string, { debit: number; credit: number; count: number }> = {};
    balances.forEach(b => {
      const type = b.account_type || "other";
      if (!typeGroups[type]) typeGroups[type] = { debit: 0, credit: 0, count: 0 };
      typeGroups[type].debit += b.total_debit;
      typeGroups[type].credit += b.total_credit;
      typeGroups[type].count++;
    });

    const typeDistribution = Object.entries(typeGroups).map(([type, data]) => ({
      type,
      debit: data.debit,
      credit: data.credit,
      count: data.count,
    }));

    // Top accounts by total movement
    const topAccounts = [...balances]
      .sort((a, b) => (b.total_debit + b.total_credit) - (a.total_debit + a.total_credit))
      .slice(0, 10)
      .map(b => ({ name: b.account_name, total: b.total_debit + b.total_credit }));

    return NextResponse.json({
      balances,
      stats: {
        totalDebit,
        totalCredit,
        totalClosingDebit,
        totalClosingCredit,
        difference,
        isBalanced: Math.abs(difference) < 0.01,
        accountsCount: balances.length,
        totalEntries: balances.reduce((sum, b) => sum + b.entries_count, 0),
      },
      chartData: {
        typeDistribution,
        topAccounts,
      },
      sourceTypeCounts,
      metadata: {
        accounts: accounts || [],
        costCenters: costCenters || [],
      },
    });
  } catch (error) {
    console.error("Trial Balance API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

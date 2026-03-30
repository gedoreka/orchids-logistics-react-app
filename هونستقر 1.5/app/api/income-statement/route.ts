import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase-client";
import { query as mysqlQuery } from "@/lib/db";

interface IncomeItem {
  account_id: number | null;
  account_code: string;
  account_name: string;
  account_type: string;
  net_amount: number;
  debit_total: number;
  credit_total: number;
  entries_count: number;
  source_types: string[];
  by_center: Record<string, { name: string; amount: number }>;
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
    const fromDate = searchParams.get("from_date") || new Date().getFullYear() + "-01-01";
    const toDate = searchParams.get("to_date") || new Date().toISOString().split("T")[0];
    const search = searchParams.get("search");
    const sourceFilter = searchParams.get("source") || "all";

    // 1. Fetch accounts and cost centers
    const [{ data: accounts }, { data: costCenters }] = await Promise.all([
      supabase.from("accounts").select("id, account_code, account_name, type").eq("company_id", companyId).order("account_code"),
      supabase.from("cost_centers").select("id, center_code, center_name").eq("company_id", companyId).order("center_code"),
    ]);

    const accountMap = new Map<number, { account_code: string; account_name: string; type: string }>();
    (accounts || []).forEach((a: any) => {
      accountMap.set(a.id, { account_code: a.account_code, account_name: a.account_name, type: a.type });
    });

    const costCenterMap = new Map<number, { center_code: string; center_name: string }>();
    (costCenters || []).forEach((c: any) => {
      costCenterMap.set(c.id, { center_code: c.center_code, center_name: c.center_name });
    });

    // Revenue types: ايراد, revenue, income
    // Expense types: مصروف, expense, payroll, deduction
    const REVENUE_TYPES = ["ايراد", "revenue", "income", "إيراد"];
    const EXPENSE_TYPES = ["مصروف", "expense", "payroll", "deduction", "مصاريف"];

    const isRevenue = (type: string) => REVENUE_TYPES.includes(type?.toLowerCase?.() || type);
    const isExpense = (type: string) => EXPENSE_TYPES.includes(type?.toLowerCase?.() || type);

    const revenueMap = new Map<string, IncomeItem>();
    const expenseMap = new Map<string, IncomeItem>();

    // Monthly trend data
    const monthlyData: Record<string, { revenue: number; expenses: number }> = {};

    const sourceTypeCounts: Record<string, number> = {};

    const getOrCreate = (map: Map<string, IncomeItem>, code: string, name: string, type: string, accId: number | null): IncomeItem => {
      if (!map.has(code)) {
        map.set(code, {
          account_id: accId,
          account_code: code,
          account_name: name,
          account_type: type,
          net_amount: 0,
          debit_total: 0,
          credit_total: 0,
          entries_count: 0,
          source_types: [],
          by_center: {},
        });
      }
      return map.get(code)!;
    };

    const addMonthlyData = (date: string, amount: number, isRev: boolean) => {
      const month = date?.substring(0, 7) || "unknown";
      if (!monthlyData[month]) monthlyData[month] = { revenue: 0, expenses: 0 };
      if (isRev) monthlyData[month].revenue += amount;
      else monthlyData[month].expenses += amount;
    };

    // ===== SOURCE 1: Supabase Journal Entries =====
    if (sourceFilter === "all" || sourceFilter === "journal") {
      let q = supabase
        .from("journal_entries")
        .select("id, account_id, cost_center_id, debit, credit, entry_date, source_type")
        .eq("company_id", companyId)
        .gte("entry_date", fromDate)
        .lte("entry_date", toDate);

      const { data: entries, error } = await q;
      if (error) console.error("Journal entries fetch error:", error);

      (entries || []).forEach((entry: any) => {
        const acc = accountMap.get(entry.account_id);
        if (!acc) return;

        const isRev = isRevenue(acc.type);
        const isExp = isExpense(acc.type);
        if (!isRev && !isExp) return;

        const debit = Number(entry.debit) || 0;
        const credit = Number(entry.credit) || 0;
        const src = entry.source_type || "journal";

        if (isRev) {
          const item = getOrCreate(revenueMap, acc.account_code, acc.account_name, acc.type, entry.account_id);
          const amount = credit - debit;
          item.net_amount += amount;
          item.debit_total += debit;
          item.credit_total += credit;
          item.entries_count++;
          if (!item.source_types.includes(src)) item.source_types.push(src);
          addMonthlyData(entry.entry_date, Math.max(0, amount), true);

          if (entry.cost_center_id) {
            const cc = costCenterMap.get(entry.cost_center_id);
            const ccKey = String(entry.cost_center_id);
            if (!item.by_center[ccKey]) item.by_center[ccKey] = { name: cc?.center_name || "Unknown", amount: 0 };
            item.by_center[ccKey].amount += amount;
          }
        } else {
          const item = getOrCreate(expenseMap, acc.account_code, acc.account_name, acc.type, entry.account_id);
          const amount = debit - credit;
          item.net_amount += amount;
          item.debit_total += debit;
          item.credit_total += credit;
          item.entries_count++;
          if (!item.source_types.includes(src)) item.source_types.push(src);
          addMonthlyData(entry.entry_date, Math.max(0, amount), false);

          if (entry.cost_center_id) {
            const cc = costCenterMap.get(entry.cost_center_id);
            const ccKey = String(entry.cost_center_id);
            if (!item.by_center[ccKey]) item.by_center[ccKey] = { name: cc?.center_name || "Unknown", amount: 0 };
            item.by_center[ccKey].amount += amount;
          }
        }

        sourceTypeCounts[src] = (sourceTypeCounts[src] || 0) + 1;
      });
    }

    // ===== SOURCE 2: MySQL Expenses =====
    if (sourceFilter === "all" || sourceFilter === "expense") {
      try {
        let expSql = `SELECT e.id, e.account_id, e.cost_center_id, e.amount, e.expense_date, e.description, e.expense_type,
          a.account_name, a.account_code, c.center_name
          FROM monthly_expenses e
          LEFT JOIN accounts a ON e.account_id = a.id
          LEFT JOIN cost_centers c ON e.cost_center_id = c.id
          WHERE e.company_id = ? AND e.expense_date >= ? AND e.expense_date <= ?`;
        const expParams: any[] = [companyId, fromDate, toDate];

        const expenses = await mysqlQuery<any>(expSql, expParams);
        (expenses || []).forEach((e: any) => {
          const amount = parseFloat(e.amount || "0");
          if (amount <= 0) return;
          const code = e.account_code || `EXP-${e.account_id || "NA"}`;
          const name = e.account_name || e.expense_type || "مصروفات";
          const item = getOrCreate(expenseMap, code, name, "expense", e.account_id);
          item.net_amount += amount;
          item.debit_total += amount;
          item.entries_count++;
          if (!item.source_types.includes("expense")) item.source_types.push("expense");
          sourceTypeCounts["expense"] = (sourceTypeCounts["expense"] || 0) + 1;

          const date = e.expense_date ? new Date(e.expense_date).toISOString().split("T")[0] : "";
          addMonthlyData(date, amount, false);

          if (e.cost_center_id) {
            const ccKey = String(e.cost_center_id);
            if (!item.by_center[ccKey]) item.by_center[ccKey] = { name: e.center_name || "Unknown", amount: 0 };
            item.by_center[ccKey].amount += amount;
          }
        });
      } catch (err) {
        console.error("MySQL expenses fetch error:", err);
      }
    }

    // ===== SOURCE 3: MySQL Deductions =====
    if (sourceFilter === "all" || sourceFilter === "deduction") {
      try {
        let dedSql = `SELECT d.id, d.account_id, d.cost_center_id, d.amount, d.expense_date, d.description, d.deduction_type,
          a.account_code, a.account_name, c.center_name
          FROM monthly_deductions d
          LEFT JOIN accounts a ON d.account_id = a.id
          LEFT JOIN cost_centers c ON d.cost_center_id = c.id
          WHERE d.company_id = ? AND d.expense_date >= ? AND d.expense_date <= ?`;
        const dedParams: any[] = [companyId, fromDate, toDate];

        const deductions = await mysqlQuery<any>(dedSql, dedParams);
        (deductions || []).forEach((d: any) => {
          const amount = parseFloat(d.amount || "0");
          if (amount <= 0) return;
          // Deductions reduce expenses (they are credits to expense accounts)
          const code = d.account_code || `DED-${d.account_id || "NA"}`;
          const name = d.account_name || d.deduction_type || "استقطاع";
          // Deductions are treated as expense reductions
          const item = getOrCreate(expenseMap, code, name, "deduction", d.account_id);
          item.net_amount += amount;
          item.debit_total += amount;
          item.entries_count++;
          if (!item.source_types.includes("deduction")) item.source_types.push("deduction");
          sourceTypeCounts["deduction"] = (sourceTypeCounts["deduction"] || 0) + 1;

          const date = d.expense_date ? new Date(d.expense_date).toISOString().split("T")[0] : "";
          addMonthlyData(date, amount, false);

          if (d.cost_center_id) {
            const ccKey = String(d.cost_center_id);
            if (!item.by_center[ccKey]) item.by_center[ccKey] = { name: d.center_name || "Unknown", amount: 0 };
            item.by_center[ccKey].amount += amount;
          }
        });
      } catch (err) {
        console.error("MySQL deductions fetch error:", err);
      }
    }

    // ===== SOURCE 4: MySQL Payrolls =====
    if (sourceFilter === "all" || sourceFilter === "payroll") {
      try {
        let paySql = `SELECT p.id, p.account_id, p.cost_center_id, p.total_amount, p.payroll_month,
          a.account_code, a.account_name, c.center_name,
          pkg.group_name as package_name
          FROM salary_payrolls p
          LEFT JOIN accounts a ON p.account_id = a.id
          LEFT JOIN cost_centers c ON p.cost_center_id = c.id
          LEFT JOIN employee_packages pkg ON p.package_id = pkg.id
          WHERE p.company_id = ? AND (p.is_draft = 0 OR p.is_draft IS NULL)
          AND CONCAT(p.payroll_month, '-01') >= ? AND CONCAT(p.payroll_month, '-01') <= ?`;
        const payParams: any[] = [companyId, fromDate, toDate];

        const payrolls = await mysqlQuery<any>(paySql, payParams);
        (payrolls || []).forEach((p: any) => {
          const amount = parseFloat(p.total_amount || "0");
          if (amount <= 0) return;
          const code = p.account_code || `PAY-${p.account_id || "NA"}`;
          const name = p.account_name || "رواتب وأجور";
          const item = getOrCreate(expenseMap, code, name, "payroll", p.account_id);
          item.net_amount += amount;
          item.debit_total += amount;
          item.entries_count++;
          if (!item.source_types.includes("payroll")) item.source_types.push("payroll");
          sourceTypeCounts["payroll"] = (sourceTypeCounts["payroll"] || 0) + 1;

          addMonthlyData(`${p.payroll_month}-01`, amount, false);

          if (p.cost_center_id) {
            const ccKey = String(p.cost_center_id);
            if (!item.by_center[ccKey]) item.by_center[ccKey] = { name: p.center_name || "Unknown", amount: 0 };
            item.by_center[ccKey].amount += amount;
          }
        });
      } catch (err) {
        console.error("MySQL payrolls fetch error:", err);
      }
    }

    // ===== SOURCE 5: MySQL Sales Invoices =====
    if (sourceFilter === "all" || sourceFilter === "invoice") {
      try {
        let invSql = `SELECT si.id, si.account_id, si.cost_center_id, si.total_amount, si.issue_date,
          si.invoice_number, si.client_name,
          a.account_code, a.account_name, c.center_name
          FROM sales_invoices si
          LEFT JOIN accounts a ON si.account_id = a.id
          LEFT JOIN cost_centers c ON si.cost_center_id = c.id
          WHERE si.company_id = ? AND si.issue_date >= ? AND si.issue_date <= ?`;
        const invParams: any[] = [companyId, fromDate, toDate];

        const invoices = await mysqlQuery<any>(invSql, invParams);
        (invoices || []).forEach((inv: any) => {
          const totalAmount = parseFloat(inv.total_amount || "0");
          if (totalAmount <= 0) return;
          const code = inv.account_code || `INV-${inv.account_id || "NA"}`;
          const name = inv.account_name || "مبيعات";
          const item = getOrCreate(revenueMap, code, name, "revenue", inv.account_id);
          item.net_amount += totalAmount;
          item.credit_total += totalAmount;
          item.entries_count++;
          if (!item.source_types.includes("invoice")) item.source_types.push("invoice");
          sourceTypeCounts["invoice"] = (sourceTypeCounts["invoice"] || 0) + 1;

          const date = inv.issue_date ? new Date(inv.issue_date).toISOString().split("T")[0] : "";
          addMonthlyData(date, totalAmount, true);

          if (inv.cost_center_id) {
            const ccKey = String(inv.cost_center_id);
            if (!item.by_center[ccKey]) item.by_center[ccKey] = { name: inv.center_name || "Unknown", amount: 0 };
            item.by_center[ccKey].amount += totalAmount;
          }
        });
      } catch (err) {
        console.error("MySQL invoices fetch error:", err);
      }
    }

    // Build lists, filter out zero amounts
    let revenueList = Array.from(revenueMap.values()).filter(r => Math.abs(r.net_amount) > 0.01);
    let expenseList = Array.from(expenseMap.values()).filter(e => Math.abs(e.net_amount) > 0.01);

    // Apply search filter
    if (search) {
      const s = search.toLowerCase();
      revenueList = revenueList.filter(r =>
        r.account_code.toLowerCase().includes(s) || r.account_name.toLowerCase().includes(s)
      );
      expenseList = expenseList.filter(e =>
        e.account_code.toLowerCase().includes(s) || e.account_name.toLowerCase().includes(s)
      );
    }

    // Sort by net_amount descending
    revenueList.sort((a, b) => b.net_amount - a.net_amount);
    expenseList.sort((a, b) => b.net_amount - a.net_amount);

    const totalRevenue = revenueList.reduce((sum, r) => sum + r.net_amount, 0);
    const totalExpenses = expenseList.reduce((sum, e) => sum + e.net_amount, 0);
    const netIncome = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;

    // Monthly trend chart
    const monthlyTrend = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        revenue: data.revenue,
        expenses: data.expenses,
        net: data.revenue - data.expenses,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Top revenue accounts
    const topRevenues = revenueList.slice(0, 10).map(r => ({ name: r.account_name, amount: r.net_amount }));
    const topExpenses = expenseList.slice(0, 10).map(e => ({ name: e.account_name, amount: e.net_amount }));

    return NextResponse.json({
      revenues: revenueList,
      expenses: expenseList,
      stats: {
        totalRevenue,
        totalExpenses,
        netIncome,
        isProfit: netIncome >= 0,
        profitMargin,
        revenueAccountsCount: revenueList.length,
        expenseAccountsCount: expenseList.length,
        totalEntries: revenueList.reduce((s, r) => s + r.entries_count, 0) + expenseList.reduce((s, e) => s + e.entries_count, 0),
      },
      chartData: {
        monthlyTrend,
        topRevenues,
        topExpenses,
      },
      sourceTypeCounts,
      period: { fromDate, toDate },
    });
  } catch (error) {
    console.error("Income Statement API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase-client";
import { query as mysqlQuery } from "@/lib/db";

interface BSItem {
  account_id: number | null;
  account_code: string;
  account_name: string;
  account_type: string;
  category: "asset" | "liability" | "equity";
  net_balance: number;
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
    const sourceFilter = searchParams.get("source") || "all";

    // 1. Fetch accounts and cost centers
    const [{ data: accounts }, { data: costCenters }] = await Promise.all([
      supabase.from("accounts").select("id, account_code, account_name, type, opening_balance, balance_type").eq("company_id", companyId).order("account_code"),
      supabase.from("cost_centers").select("id, center_code, center_name").eq("company_id", companyId).order("center_code"),
    ]);

    const accountMap = new Map<number, { account_code: string; account_name: string; type: string; opening_balance: number; balance_type: string }>();
    (accounts || []).forEach((a: any) => {
      accountMap.set(a.id, { account_code: a.account_code, account_name: a.account_name, type: a.type, opening_balance: Number(a.opening_balance) || 0, balance_type: a.balance_type || "" });
    });

    const costCenterMap = new Map<number, { center_code: string; center_name: string }>();
    (costCenters || []).forEach((c: any) => {
      costCenterMap.set(c.id, { center_code: c.center_code, center_name: c.center_name });
    });

    // Account type classifications (supports both Arabic and English)
    const ASSET_TYPES = ["اصل", "أصل", "asset", "assets"];
    const LIABILITY_TYPES = ["التزام", "الالتزام", "liability", "liabilities"];
    const EQUITY_TYPES = ["حقوق ملكية", "حقوق الملكية", "equity", "owner's equity", "capital"];
    const REVENUE_TYPES = ["ايراد", "إيراد", "revenue", "income"];
    const EXPENSE_TYPES = ["مصروف", "مصاريف", "expense", "payroll", "deduction"];

    const isAsset = (type: string) => ASSET_TYPES.includes(type?.toLowerCase?.() || type);
    const isLiability = (type: string) => LIABILITY_TYPES.includes(type?.toLowerCase?.() || type);
    const isEquity = (type: string) => EQUITY_TYPES.includes(type?.toLowerCase?.() || type);
    const isRevenue = (type: string) => REVENUE_TYPES.includes(type?.toLowerCase?.() || type);
    const isExpense = (type: string) => EXPENSE_TYPES.includes(type?.toLowerCase?.() || type);

    const assetMap = new Map<string, BSItem>();
    const liabilityMap = new Map<string, BSItem>();
    const equityMap = new Map<string, BSItem>();

    // For net income calculation (revenue - expenses)
    let totalRevenueAmount = 0;
    let totalExpenseAmount = 0;

    const sourceTypeCounts: Record<string, number> = {};

    const getOrCreate = (map: Map<string, BSItem>, code: string, name: string, type: string, cat: "asset" | "liability" | "equity", accId: number | null): BSItem => {
      if (!map.has(code)) {
        map.set(code, {
          account_id: accId,
          account_code: code,
          account_name: name,
          account_type: type,
          category: cat,
          net_balance: 0,
          debit_total: 0,
          credit_total: 0,
          entries_count: 0,
          source_types: [],
          by_center: {},
        });
      }
      return map.get(code)!;
    };

    // ===== SOURCE 1: Supabase Journal Entries =====
    if (sourceFilter === "all" || sourceFilter === "journal") {
      const { data: entries, error } = await supabase
        .from("journal_entries")
        .select("id, account_id, cost_center_id, debit, credit, entry_date, source_type")
        .eq("company_id", companyId)
        .gte("entry_date", fromDate)
        .lte("entry_date", toDate);

      if (error) console.error("Journal entries fetch error:", error);

      (entries || []).forEach((entry: any) => {
        const acc = accountMap.get(entry.account_id);
        if (!acc) return;

        const debit = Number(entry.debit) || 0;
        const credit = Number(entry.credit) || 0;
        const src = entry.source_type || "journal";

        if (isAsset(acc.type)) {
          const item = getOrCreate(assetMap, acc.account_code, acc.account_name, acc.type, "asset", entry.account_id);
          item.debit_total += debit;
          item.credit_total += credit;
          item.net_balance += (debit - credit); // Assets: debit nature
          item.entries_count++;
          if (!item.source_types.includes(src)) item.source_types.push(src);
        } else if (isLiability(acc.type)) {
          const item = getOrCreate(liabilityMap, acc.account_code, acc.account_name, acc.type, "liability", entry.account_id);
          item.debit_total += debit;
          item.credit_total += credit;
          item.net_balance += (credit - debit); // Liabilities: credit nature
          item.entries_count++;
          if (!item.source_types.includes(src)) item.source_types.push(src);
        } else if (isEquity(acc.type)) {
          const item = getOrCreate(equityMap, acc.account_code, acc.account_name, acc.type, "equity", entry.account_id);
          item.debit_total += debit;
          item.credit_total += credit;
          item.net_balance += (credit - debit); // Equity: credit nature
          item.entries_count++;
          if (!item.source_types.includes(src)) item.source_types.push(src);
        } else if (isRevenue(acc.type)) {
          totalRevenueAmount += (credit - debit);
        } else if (isExpense(acc.type)) {
          totalExpenseAmount += (debit - credit);
        }

        if (entry.cost_center_id && (isAsset(acc.type) || isLiability(acc.type) || isEquity(acc.type))) {
          const targetMap = isAsset(acc.type) ? assetMap : isLiability(acc.type) ? liabilityMap : equityMap;
          const item = targetMap.get(acc.account_code);
          if (item) {
            const cc = costCenterMap.get(entry.cost_center_id);
            const ccKey = String(entry.cost_center_id);
            if (!item.by_center[ccKey]) item.by_center[ccKey] = { name: cc?.center_name || "Unknown", amount: 0 };
            const amount = isAsset(acc.type) ? (debit - credit) : (credit - debit);
            item.by_center[ccKey].amount += amount;
          }
        }

        sourceTypeCounts[src] = (sourceTypeCounts[src] || 0) + 1;
      });
    }

    // ===== SOURCE 2: MySQL Expenses (affect expense accounts → net income → equity) =====
    if (sourceFilter === "all" || sourceFilter === "expense") {
      try {
        const expSql = `SELECT e.id, e.account_id, e.cost_center_id, e.amount, e.expense_date, e.description, e.expense_type,
          a.account_name, a.account_code, a.type as account_type, c.center_name
          FROM monthly_expenses e
          LEFT JOIN accounts a ON e.account_id = a.id
          LEFT JOIN cost_centers c ON e.cost_center_id = c.id
          WHERE e.company_id = ? AND e.expense_date >= ? AND e.expense_date <= ?`;
        const expenses = await mysqlQuery<any>(expSql, [companyId, fromDate, toDate]);
        (expenses || []).forEach((e: any) => {
          const amount = parseFloat(e.amount || "0");
          if (amount <= 0) return;

          const accType = e.account_type?.toLowerCase() || "expense";
          // If this expense is tied to an asset account (like cash/bank), it reduces that asset
          if (isAsset(accType)) {
            const code = e.account_code || `EXP-ASSET-${e.account_id || "NA"}`;
            const name = e.account_name || e.expense_type || "أصل";
            const item = getOrCreate(assetMap, code, name, accType, "asset", e.account_id);
            item.net_balance -= amount; // Expense reduces asset (credit)
            item.credit_total += amount;
            item.entries_count++;
            if (!item.source_types.includes("expense")) item.source_types.push("expense");
            if (e.cost_center_id) {
              const ccKey = String(e.cost_center_id);
              if (!item.by_center[ccKey]) item.by_center[ccKey] = { name: e.center_name || "Unknown", amount: 0 };
              item.by_center[ccKey].amount -= amount;
            }
          } else {
            // It's an expense account → affects net income
            totalExpenseAmount += amount;
          }

          sourceTypeCounts["expense"] = (sourceTypeCounts["expense"] || 0) + 1;
        });
      } catch (err) {
        console.error("MySQL expenses fetch error:", err);
      }
    }

    // ===== SOURCE 3: MySQL Deductions =====
    if (sourceFilter === "all" || sourceFilter === "deduction") {
      try {
        const dedSql = `SELECT d.id, d.account_id, d.cost_center_id, d.amount, d.expense_date, d.description, d.deduction_type,
          a.account_code, a.account_name, a.type as account_type, c.center_name
          FROM monthly_deductions d
          LEFT JOIN accounts a ON d.account_id = a.id
          LEFT JOIN cost_centers c ON d.cost_center_id = c.id
          WHERE d.company_id = ? AND d.expense_date >= ? AND d.expense_date <= ?`;
        const deductions = await mysqlQuery<any>(dedSql, [companyId, fromDate, toDate]);
        (deductions || []).forEach((d: any) => {
          const amount = parseFloat(d.amount || "0");
          if (amount <= 0) return;

          const accType = d.account_type?.toLowerCase() || "deduction";
          if (isLiability(accType)) {
            const code = d.account_code || `DED-LIAB-${d.account_id || "NA"}`;
            const name = d.account_name || d.deduction_type || "التزام";
            const item = getOrCreate(liabilityMap, code, name, accType, "liability", d.account_id);
            item.net_balance += amount; // Deduction increases liability
            item.credit_total += amount;
            item.entries_count++;
            if (!item.source_types.includes("deduction")) item.source_types.push("deduction");
            if (d.cost_center_id) {
              const ccKey = String(d.cost_center_id);
              if (!item.by_center[ccKey]) item.by_center[ccKey] = { name: d.center_name || "Unknown", amount: 0 };
              item.by_center[ccKey].amount += amount;
            }
          } else {
            totalExpenseAmount += amount;
          }

          sourceTypeCounts["deduction"] = (sourceTypeCounts["deduction"] || 0) + 1;
        });
      } catch (err) {
        console.error("MySQL deductions fetch error:", err);
      }
    }

    // ===== SOURCE 4: MySQL Payrolls =====
    if (sourceFilter === "all" || sourceFilter === "payroll") {
      try {
        const paySql = `SELECT p.id, p.account_id, p.cost_center_id, p.total_amount, p.payroll_month,
          a.account_code, a.account_name, a.type as account_type, c.center_name
          FROM salary_payrolls p
          LEFT JOIN accounts a ON p.account_id = a.id
          LEFT JOIN cost_centers c ON p.cost_center_id = c.id
          WHERE p.company_id = ? AND (p.is_draft = 0 OR p.is_draft IS NULL)
          AND CONCAT(p.payroll_month, '-01') >= ? AND CONCAT(p.payroll_month, '-01') <= ?`;
        const payrolls = await mysqlQuery<any>(paySql, [companyId, fromDate, toDate]);
        (payrolls || []).forEach((p: any) => {
          const amount = parseFloat(p.total_amount || "0");
          if (amount <= 0) return;

          const accType = p.account_type?.toLowerCase() || "payroll";
          if (isLiability(accType)) {
            const code = p.account_code || `PAY-LIAB-${p.account_id || "NA"}`;
            const name = p.account_name || "رواتب مستحقة";
            const item = getOrCreate(liabilityMap, code, name, accType, "liability", p.account_id);
            item.net_balance += amount;
            item.credit_total += amount;
            item.entries_count++;
            if (!item.source_types.includes("payroll")) item.source_types.push("payroll");
            if (p.cost_center_id) {
              const ccKey = String(p.cost_center_id);
              if (!item.by_center[ccKey]) item.by_center[ccKey] = { name: p.center_name || "Unknown", amount: 0 };
              item.by_center[ccKey].amount += amount;
            }
          } else {
            totalExpenseAmount += amount;
          }

          sourceTypeCounts["payroll"] = (sourceTypeCounts["payroll"] || 0) + 1;
        });
      } catch (err) {
        console.error("MySQL payrolls fetch error:", err);
      }
    }

    // ===== SOURCE 5: MySQL Sales Invoices =====
    if (sourceFilter === "all" || sourceFilter === "invoice") {
      try {
        const invSql = `SELECT si.id, si.account_id, si.cost_center_id, si.total_amount, si.issue_date,
          si.invoice_number, si.client_name,
          a.account_code, a.account_name, a.type as account_type, c.center_name
          FROM sales_invoices si
          LEFT JOIN accounts a ON si.account_id = a.id
          LEFT JOIN cost_centers c ON si.cost_center_id = c.id
          WHERE si.company_id = ? AND si.issue_date >= ? AND si.issue_date <= ?`;
        const invoices = await mysqlQuery<any>(invSql, [companyId, fromDate, toDate]);
        (invoices || []).forEach((inv: any) => {
          const totalAmount = parseFloat(inv.total_amount || "0");
          if (totalAmount <= 0) return;

          const accType = inv.account_type?.toLowerCase() || "revenue";
          if (isAsset(accType)) {
            // Invoice increases accounts receivable (asset)
            const code = inv.account_code || `INV-ASSET-${inv.account_id || "NA"}`;
            const name = inv.account_name || "عملاء";
            const item = getOrCreate(assetMap, code, name, accType, "asset", inv.account_id);
            item.net_balance += totalAmount;
            item.debit_total += totalAmount;
            item.entries_count++;
            if (!item.source_types.includes("invoice")) item.source_types.push("invoice");
            if (inv.cost_center_id) {
              const ccKey = String(inv.cost_center_id);
              if (!item.by_center[ccKey]) item.by_center[ccKey] = { name: inv.center_name || "Unknown", amount: 0 };
              item.by_center[ccKey].amount += totalAmount;
            }
          } else {
            totalRevenueAmount += totalAmount;
          }

          sourceTypeCounts["invoice"] = (sourceTypeCounts["invoice"] || 0) + 1;
        });
      } catch (err) {
        console.error("MySQL invoices fetch error:", err);
      }
    }

    // Add opening balances from Supabase accounts
    (accounts || []).forEach((acc: any) => {
      const opening = Number(acc.opening_balance) || 0;
      if (Math.abs(opening) < 0.01) return;

      const type = acc.type?.toLowerCase?.() || acc.type;
      if (isAsset(type)) {
        const item = getOrCreate(assetMap, acc.account_code, acc.account_name, acc.type, "asset", acc.id);
        item.net_balance += opening;
      } else if (isLiability(type)) {
        const item = getOrCreate(liabilityMap, acc.account_code, acc.account_name, acc.type, "liability", acc.id);
        item.net_balance += opening;
      } else if (isEquity(type)) {
        const item = getOrCreate(equityMap, acc.account_code, acc.account_name, acc.type, "equity", acc.id);
        item.net_balance += opening;
      }
    });

    // Build final lists, filter out zero balances
    const assetList = Array.from(assetMap.values()).filter(a => Math.abs(a.net_balance) > 0.01);
    const liabilityList = Array.from(liabilityMap.values()).filter(l => Math.abs(l.net_balance) > 0.01);
    const equityList = Array.from(equityMap.values()).filter(e => Math.abs(e.net_balance) > 0.01);

    // Sort by net_balance descending
    assetList.sort((a, b) => Math.abs(b.net_balance) - Math.abs(a.net_balance));
    liabilityList.sort((a, b) => Math.abs(b.net_balance) - Math.abs(a.net_balance));
    equityList.sort((a, b) => Math.abs(b.net_balance) - Math.abs(a.net_balance));

    const netIncome = totalRevenueAmount - totalExpenseAmount;
    const totalAssets = assetList.reduce((sum, a) => sum + a.net_balance, 0);
    const totalLiabilities = liabilityList.reduce((sum, l) => sum + l.net_balance, 0);
    const totalEquities = equityList.reduce((sum, e) => sum + e.net_balance, 0);
    const totalEquitiesWithIncome = totalEquities + netIncome;
    const difference = totalAssets - (totalLiabilities + totalEquitiesWithIncome);
    const totalEntries = assetList.reduce((s, a) => s + a.entries_count, 0) +
      liabilityList.reduce((s, l) => s + l.entries_count, 0) +
      equityList.reduce((s, e) => s + e.entries_count, 0);

    // Chart data: asset composition
    const assetComposition = assetList.slice(0, 8).map(a => ({ name: a.account_name, amount: Math.abs(a.net_balance) }));
    const liabilityComposition = liabilityList.slice(0, 8).map(l => ({ name: l.account_name, amount: Math.abs(l.net_balance) }));

    return NextResponse.json({
      assets: assetList,
      liabilities: liabilityList,
      equities: equityList,
      stats: {
        totalAssets,
        totalLiabilities,
        totalEquities,
        netIncome,
        totalRevenueAmount,
        totalExpenseAmount,
        totalEquitiesWithIncome,
        difference,
        isBalanced: Math.abs(difference) < 0.01,
        assetsCount: assetList.length,
        liabilitiesCount: liabilityList.length,
        equitiesCount: equityList.length,
        totalEntries,
      },
      chartData: {
        assetComposition,
        liabilityComposition,
        summary: [
          { name: "assets", amount: totalAssets },
          { name: "liabilities", amount: totalLiabilities },
          { name: "equity", amount: totalEquitiesWithIncome },
        ],
      },
      sourceTypeCounts,
      period: { fromDate, toDate },
    });
  } catch (error) {
    console.error("Balance Sheet API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

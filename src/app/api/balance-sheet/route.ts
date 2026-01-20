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
    const fromDate = searchParams.get("from_date") || new Date().getFullYear() + "-01-01";
    const toDate = searchParams.get("to_date") || new Date().toISOString().split("T")[0];

    const { data: accounts, error: accountsError } = await supabase
      .from("accounts")
      .select("id, account_code, account_name, type")
      .eq("company_id", companyId);

    if (accountsError) {
      console.error("Accounts error:", accountsError);
    }

    let journalQuery = supabase
      .from("journal_entries")
      .select(`
        id,
        entry_date,
        debit,
        credit,
        account_id,
        accounts:account_id (
          id,
          account_code,
          account_name,
          type
        )
      `)
      .eq("company_id", companyId)
      .gte("entry_date", fromDate)
      .lte("entry_date", toDate);

    const { data: journalEntries, error: journalError } = await journalQuery;

    if (journalError) {
      console.error("Journal entries error:", journalError);
    }

    const assetAccounts: { [key: string]: { account_name: string; account_code: string; net_balance: number } } = {};
    const liabilityAccounts: { [key: string]: { account_name: string; account_code: string; net_balance: number } } = {};
    const equityAccounts: { [key: string]: { account_name: string; account_code: string; net_balance: number } } = {};
    let revenueTotal = 0;
    let expenseTotal = 0;

    if (journalEntries) {
      journalEntries.forEach((entry: any) => {
        const account = entry.accounts;
        if (!account) return;

        const accountId = account.id;
        const accountType = account.type;
        const debit = Number(entry.debit) || 0;
        const credit = Number(entry.credit) || 0;

        if (accountType === "اصل") {
          if (!assetAccounts[accountId]) {
            assetAccounts[accountId] = {
              account_name: account.account_name,
              account_code: account.account_code || "---",
              net_balance: 0,
            };
          }
          assetAccounts[accountId].net_balance += debit - credit;
        } else if (accountType === "التزام") {
          if (!liabilityAccounts[accountId]) {
            liabilityAccounts[accountId] = {
              account_name: account.account_name,
              account_code: account.account_code || "---",
              net_balance: 0,
            };
          }
          liabilityAccounts[accountId].net_balance += credit - debit;
        } else if (accountType === "حقوق ملكية") {
          if (!equityAccounts[accountId]) {
            equityAccounts[accountId] = {
              account_name: account.account_name,
              account_code: account.account_code || "---",
              net_balance: 0,
            };
          }
          equityAccounts[accountId].net_balance += credit - debit;
        } else if (accountType === "ايراد") {
          revenueTotal += credit - debit;
        } else if (accountType === "مصروف") {
          expenseTotal += debit - credit;
        }
      });
    }

    let expensesQuery = supabase
      .from("monthly_expenses")
      .select("id, expense_date, net_amount, amount")
      .eq("company_id", companyId)
      .gte("expense_date", fromDate)
      .lte("expense_date", toDate);

    const { data: expenses, error: expensesError } = await expensesQuery;

    if (!expensesError && expenses) {
      expenses.forEach((expense: any) => {
        expenseTotal += Number(expense.net_amount) || Number(expense.amount) || 0;
      });
    }

    let payrollsQuery = supabase
      .from("salary_payrolls")
      .select("id, payroll_month, total_amount")
      .eq("company_id", companyId)
      .gte("payroll_month", fromDate)
      .lte("payroll_month", toDate);

    const { data: payrolls, error: payrollsError } = await payrollsQuery;

    if (!payrollsError && payrolls) {
      payrolls.forEach((payroll: any) => {
        expenseTotal += Number(payroll.total_amount) || 0;
      });
    }

    let incomeQuery = supabase
      .from("manual_income")
      .select("id, income_date, total, amount")
      .eq("company_id", companyId)
      .gte("income_date", fromDate)
      .lte("income_date", toDate);

    const { data: incomeData, error: incomeError } = await incomeQuery;

    if (!incomeError && incomeData) {
      incomeData.forEach((income: any) => {
        revenueTotal += Number(income.total) || Number(income.amount) || 0;
      });
    }

    const assets = Object.values(assetAccounts).filter(a => Math.abs(a.net_balance) > 0.01);
    const liabilities = Object.values(liabilityAccounts).filter(l => Math.abs(l.net_balance) > 0.01);
    const equities = Object.values(equityAccounts).filter(e => Math.abs(e.net_balance) > 0.01);

    const totalAssets = assets.reduce((sum, a) => sum + a.net_balance, 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + l.net_balance, 0);
    const totalEquities = equities.reduce((sum, e) => sum + e.net_balance, 0);
    const netIncome = revenueTotal - expenseTotal;
    const totalEquitiesWithIncome = totalEquities + netIncome;

    const difference = totalAssets - (totalLiabilities + totalEquitiesWithIncome);
    const isBalanced = Math.abs(difference) < 0.01;

    return NextResponse.json({
      assets,
      liabilities,
      equities,
      stats: {
        totalAssets,
        totalLiabilities,
        totalEquities,
        netIncome,
        totalEquitiesWithIncome,
        difference,
        isBalanced,
        assetsCount: assets.length,
        liabilitiesCount: liabilities.length,
        equitiesCount: equities.length,
      },
      period: {
        fromDate,
        toDate,
      },
    });
  } catch (error) {
    console.error("Balance Sheet API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

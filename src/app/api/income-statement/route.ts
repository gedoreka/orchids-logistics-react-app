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
      .in("type", ["ايراد", "مصروف"]);

    if (accountsError) {
      console.error("Accounts error:", accountsError);
    }

    let journalQuery = supabase
      .from("journal_entries")
      .select(`
        id,
        entry_date,
        description,
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

    const revenueAccounts: { [key: string]: { account_name: string; account_code: string; net_amount: number } } = {};
    const expenseAccounts: { [key: string]: { account_name: string; account_code: string; net_amount: number } } = {};

    if (journalEntries) {
      journalEntries.forEach((entry: any) => {
        const account = entry.accounts;
        if (!account) return;

        const accountId = account.id;
        const accountType = account.type;

        if (accountType === "ايراد") {
          if (!revenueAccounts[accountId]) {
            revenueAccounts[accountId] = {
              account_name: account.account_name,
              account_code: account.account_code || "---",
              net_amount: 0,
            };
          }
          revenueAccounts[accountId].net_amount += (Number(entry.credit) || 0) - (Number(entry.debit) || 0);
        } else if (accountType === "مصروف") {
          if (!expenseAccounts[accountId]) {
            expenseAccounts[accountId] = {
              account_name: account.account_name,
              account_code: account.account_code || "---",
              net_amount: 0,
            };
          }
          expenseAccounts[accountId].net_amount += (Number(entry.debit) || 0) - (Number(entry.credit) || 0);
        }
      });
    }

    let expensesQuery = supabase
      .from("monthly_expenses")
      .select(`
        id,
        expense_date,
        description,
        expense_type,
        amount,
        net_amount,
        account_id,
        accounts:account_id (
          id,
          account_code,
          account_name,
          type
        )
      `)
      .eq("company_id", companyId)
      .gte("expense_date", fromDate)
      .lte("expense_date", toDate);

    const { data: expenses, error: expensesError } = await expensesQuery;

    if (!expensesError && expenses) {
      expenses.forEach((expense: any) => {
        const expenseAmount = Number(expense.net_amount) || Number(expense.amount) || 0;
        const expenseType = expense.expense_type || expense.description || "مصروفات أخرى";
        const key = `expense-${expenseType}`;

        if (!expenseAccounts[key]) {
          expenseAccounts[key] = {
            account_name: expenseType,
            account_code: expense.accounts?.account_code || "EXP",
            net_amount: 0,
          };
        }
        expenseAccounts[key].net_amount += expenseAmount;
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
      const totalPayroll = payrolls.reduce((sum: number, p: any) => sum + (Number(p.total_amount) || 0), 0);
      if (totalPayroll > 0) {
        expenseAccounts["payroll-salaries"] = {
          account_name: "مصروفات الرواتب والأجور",
          account_code: "SAL",
          net_amount: totalPayroll,
        };
      }
    }

    let incomeQuery = supabase
      .from("income")
      .select(`
        id,
        income_date,
        description,
        income_type,
        amount,
        net_amount
      `)
      .eq("company_id", companyId)
      .gte("income_date", fromDate)
      .lte("income_date", toDate);

    const { data: incomeData, error: incomeError } = await incomeQuery;

    if (!incomeError && incomeData) {
      incomeData.forEach((income: any) => {
        const incomeAmount = Number(income.net_amount) || Number(income.amount) || 0;
        const incomeType = income.income_type || income.description || "إيرادات أخرى";
        const key = `income-${incomeType}`;

        if (!revenueAccounts[key]) {
          revenueAccounts[key] = {
            account_name: incomeType,
            account_code: "INC",
            net_amount: 0,
          };
        }
        revenueAccounts[key].net_amount += incomeAmount;
      });
    }

    const revenues = Object.values(revenueAccounts).filter(r => r.net_amount !== 0);
    const expensesList = Object.values(expenseAccounts).filter(e => e.net_amount !== 0);

    const totalRevenue = revenues.reduce((sum, r) => sum + r.net_amount, 0);
    const totalExpenses = expensesList.reduce((sum, e) => sum + e.net_amount, 0);
    const netIncome = totalRevenue - totalExpenses;

    const monthlyData: { [key: string]: { month: string; revenue: number; expenses: number } } = {};

    if (journalEntries) {
      journalEntries.forEach((entry: any) => {
        const month = entry.entry_date?.substring(0, 7);
        if (!month) return;

        if (!monthlyData[month]) {
          monthlyData[month] = { month, revenue: 0, expenses: 0 };
        }

        const account = entry.accounts;
        if (!account) return;

        if (account.type === "ايراد") {
          monthlyData[month].revenue += (Number(entry.credit) || 0) - (Number(entry.debit) || 0);
        } else if (account.type === "مصروف") {
          monthlyData[month].expenses += (Number(entry.debit) || 0) - (Number(entry.credit) || 0);
        }
      });
    }

    const monthlyTrend = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

    return NextResponse.json({
      revenues,
      expenses: expensesList,
      stats: {
        totalRevenue,
        totalExpenses,
        netIncome,
        isProfit: netIncome >= 0,
        revenueAccountsCount: revenues.length,
        expenseAccountsCount: expensesList.length,
      },
      chartData: {
        monthlyTrend,
      },
      period: {
        fromDate,
        toDate,
      },
    });
  } catch (error) {
    console.error("Income Statement API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

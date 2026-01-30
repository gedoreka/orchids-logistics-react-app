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

    // Fetch all relevant data in parallel
    const [
      { data: journalEntries },
      { data: monthlyExpenses },
      { data: expenses },
      { data: salesInvoices },
      { data: manualIncome },
      { data: creditNotes },
      { data: salaryPayrolls },
      { data: monthlyDeductions }
    ] = await Promise.all([
      supabase.from("journal_entries").select("*, accounts:account_id(id, account_code, account_name, type)").eq("company_id", companyId).gte("entry_date", fromDate).lte("entry_date", toDate),
      supabase.from("monthly_expenses").select("*, accounts:account_id(id, account_code, account_name, type)").eq("company_id", companyId).gte("expense_date", fromDate).lte("expense_date", toDate),
      supabase.from("expenses").select("*, accounts:account_id(id, account_code, account_name, type)").eq("company_id", companyId).gte("expense_date", fromDate).lte("expense_date", toDate),
      supabase.from("sales_invoices").select("*").eq("company_id", companyId).gte("issue_date", fromDate).lte("issue_date", toDate),
      supabase.from("manual_income").select("*, accounts:account_id(id, account_code, account_name, type)").eq("company_id", companyId).gte("income_date", fromDate).lte("income_date", toDate),
      supabase.from("credit_notes").select("*").eq("company_id", companyId).gte("created_at", fromDate).lte("created_at", toDate + "T23:59:59Z"),
      supabase.from("salary_payrolls").select("*").eq("company_id", companyId).gte("payroll_month", fromDate.substring(0, 7)).lte("payroll_month", toDate.substring(0, 7)),
      supabase.from("monthly_deductions").select("*, accounts:account_id(id, account_code, account_name, type)").eq("company_id", companyId).gte("expense_date", fromDate).lte("expense_date", toDate)
    ]);

    const revenueAccounts: { [key: string]: { account_name: string; account_code: string; net_amount: number } } = {};
    const expenseAccounts: { [key: string]: { account_name: string; account_code: string; net_amount: number } } = {};

    // 1. Journal Entries
    if (journalEntries) {
      journalEntries.forEach((entry: any) => {
        const account = entry.accounts;
        if (!account) return;
        const accountId = account.id;
        const accountType = account.type;
        if (accountType === "ايراد") {
          if (!revenueAccounts[accountId]) {
            revenueAccounts[accountId] = { account_name: account.account_name, account_code: account.account_code || "INC", net_amount: 0 };
          }
          revenueAccounts[accountId].net_amount += (Number(entry.credit) || 0) - (Number(entry.debit) || 0);
        } else if (accountType === "مصروف") {
          if (!expenseAccounts[accountId]) {
            expenseAccounts[accountId] = { account_name: account.account_name, account_code: account.account_code || "EXP", net_amount: 0 };
          }
          expenseAccounts[accountId].net_amount += (Number(entry.debit) || 0) - (Number(entry.credit) || 0);
        }
      });
    }

    // 2. Sales Invoices (Direct Revenue)
    if (salesInvoices) {
      const key = "sales-invoices";
      if (!revenueAccounts[key]) {
        revenueAccounts[key] = { account_name: "المبيعات (فواتير)", account_code: "4101", net_amount: 0 };
      }
      salesInvoices.forEach((invoice: any) => {
        revenueAccounts[key].net_amount += Number(invoice.total_amount) || 0;
      });
    }

    // 3. Credit Notes (Sales Returns - Reduction of Revenue)
    if (creditNotes) {
      const key = "sales-returns";
      if (!revenueAccounts[key]) {
        revenueAccounts[key] = { account_name: "مردودات مبيعات", account_code: "4102", net_amount: 0 };
      }
      creditNotes.forEach((note: any) => {
        revenueAccounts[key].net_amount -= Number(note.total_amount) || 0;
      });
    }

    // 4. Manual Income
    if (manualIncome) {
      manualIncome.forEach((income: any) => {
        const type = income.income_type || "دخل إضافي";
        const key = `manual-inc-${type}`;
        if (!revenueAccounts[key]) {
          revenueAccounts[key] = { account_name: type, account_code: income.accounts?.account_code || "INC-MAN", net_amount: 0 };
        }
        revenueAccounts[key].net_amount += Number(income.total) || Number(income.amount) || 0;
      });
    }

    // 5. Monthly & Generic Expenses
    const allExpenses = [...(monthlyExpenses || []), ...(expenses || [])];
    allExpenses.forEach((expense: any) => {
      const type = expense.expense_type || expense.description || "مصروفات متنوعة";
      const key = `exp-${type}`;
      if (!expenseAccounts[key]) {
        expenseAccounts[key] = { account_name: type, account_code: expense.accounts?.account_code || "EXP", net_amount: 0 };
      }
      expenseAccounts[key].net_amount += Number(expense.net_amount) || Number(expense.amount) || 0;
    });

    // 6. Salary Payrolls
    if (salaryPayrolls) {
      const totalPayroll = salaryPayrolls.reduce((sum: number, p: any) => sum + (Number(p.total_amount) || 0), 0);
      if (totalPayroll > 0) {
        expenseAccounts["payroll-salaries"] = { account_name: "مصروفات الرواتب والأجور", account_code: "5101", net_amount: totalPayroll };
      }
    }

    // 7. Monthly Deductions (Reduces Expenses or increases Income? Usually reduces payroll expense)
    if (monthlyDeductions) {
      const totalDeductions = monthlyDeductions.reduce((sum: number, d: any) => sum + (Number(d.amount) || 0), 0);
      if (totalDeductions > 0) {
        if (expenseAccounts["payroll-salaries"]) {
          expenseAccounts["payroll-salaries"].net_amount -= totalDeductions;
        } else {
          // If no payroll, treat as other income or reduction of general expenses
          const key = "deductions-income";
          if (!revenueAccounts[key]) {
            revenueAccounts[key] = { account_name: "استقطاعات أخرى", account_code: "INC-DED", net_amount: 0 };
          }
          revenueAccounts[key].net_amount += totalDeductions;
        }
      }
    }

    const revenues = Object.values(revenueAccounts).filter(r => Math.abs(r.net_amount) > 0.01);
    const expensesList = Object.values(expenseAccounts).filter(e => Math.abs(e.net_amount) > 0.01);

    const totalRevenue = revenues.reduce((sum, r) => sum + r.net_amount, 0);
    const totalExpenses = expensesList.reduce((sum, e) => sum + e.net_amount, 0);
    const netIncome = totalRevenue - totalExpenses;

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
      period: { fromDate, toDate },
    });
  } catch (error) {
    console.error("Income Statement API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

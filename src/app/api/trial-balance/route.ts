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
    const entryType = searchParams.get("entry_type");

    let expensesQuery = supabase
      .from("monthly_expenses")
      .select(`
        id,
        expense_date,
        description,
        amount,
        net_amount,
        account_code,
        cost_center_code,
        expense_type,
        account_id,
        accounts:account_id (
          id,
          account_code,
          account_name,
          type
        )
      `)
      .eq("company_id", companyId);

    if (fromDate) {
      expensesQuery = expensesQuery.gte("expense_date", fromDate);
    }
    if (toDate) {
      expensesQuery = expensesQuery.lte("expense_date", toDate);
    }

    const { data: expenses, error: expensesError } = await expensesQuery;

    let payrollsQuery = supabase
      .from("salary_payrolls")
      .select(`
        id,
        payroll_month,
        total_amount,
        employee_id,
        employees:employee_id (
          id,
          name
        )
      `)
      .eq("company_id", companyId);

    if (fromDate) {
      payrollsQuery = payrollsQuery.gte("payroll_month", fromDate);
    }
    if (toDate) {
      payrollsQuery = payrollsQuery.lte("payroll_month", toDate);
    }

    const { data: payrolls, error: payrollsError } = await payrollsQuery;

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
      .eq("company_id", companyId);

    if (fromDate) {
      journalQuery = journalQuery.gte("entry_date", fromDate);
    }
    if (toDate) {
      journalQuery = journalQuery.lte("entry_date", toDate);
    }

    const { data: journalEntries, error: journalError } = await journalQuery;

    const balanceData: {
      [key: string]: {
        type: string;
        account_code: string;
        account_name: string;
        debit: number;
        credit: number;
      };
    } = {};

    if (expenses && !expensesError) {
      expenses.forEach((expense: any) => {
        const accountCode = expense.account_code || expense.accounts?.account_code || "غير محدد";
        const accountName = expense.accounts?.account_name || expense.expense_type || "منصرفات";
        const key = `expense-${accountCode}`;
        
        if (!balanceData[key]) {
          balanceData[key] = {
            type: "المنصرفات",
            account_code: accountCode,
            account_name: accountName,
            debit: 0,
            credit: 0,
          };
        }
        balanceData[key].debit += Number(expense.net_amount) || Number(expense.amount) || 0;
      });
    }

    if (payrolls && !payrollsError) {
      const totalPayroll = payrolls.reduce((sum: number, p: any) => sum + (Number(p.total_amount) || 0), 0);
      if (totalPayroll > 0) {
        balanceData["payroll-salaries"] = {
          type: "الرواتب",
          account_code: "رواتب الموظفين",
          account_name: "مصروفات الرواتب والأجور",
          debit: totalPayroll,
          credit: 0,
        };
      }
    }

    if (journalEntries && !journalError) {
      journalEntries.forEach((entry: any) => {
        const accountCode = entry.accounts?.account_code || `JE-${entry.account_id || "غير محدد"}`;
        const accountName = entry.accounts?.account_name || entry.description || "قيد يومية";
        const key = `journal-${accountCode}`;
        
        if (!balanceData[key]) {
          balanceData[key] = {
            type: "قيود اليومية",
            account_code: accountCode,
            account_name: accountName,
            debit: 0,
            credit: 0,
          };
        }
        balanceData[key].debit += Number(entry.debit) || 0;
        balanceData[key].credit += Number(entry.credit) || 0;
      });
    }

    let balances = Object.values(balanceData);

    if (entryType && entryType !== "all") {
      balances = balances.filter(b => {
        if (entryType === "expenses") return b.type === "المنصرفات";
        if (entryType === "payrolls") return b.type === "الرواتب";
        if (entryType === "journals") return b.type === "قيود اليومية";
        return true;
      });
    }

    const totalDebit = balances.reduce((sum, b) => sum + b.debit, 0);
    const totalCredit = balances.reduce((sum, b) => sum + b.credit, 0);
    const difference = totalDebit - totalCredit;
    const isBalanced = Math.abs(difference) < 0.01;

    const typeDistribution = balances.reduce((acc: any, b) => {
      if (!acc[b.type]) {
        acc[b.type] = { type: b.type, debit: 0, credit: 0 };
      }
      acc[b.type].debit += b.debit;
      acc[b.type].credit += b.credit;
      return acc;
    }, {});

    return NextResponse.json({
      balances,
      stats: {
        totalDebit,
        totalCredit,
        difference,
        isBalanced,
        accountsCount: balances.length,
      },
      chartData: {
        typeDistribution: Object.values(typeDistribution),
      },
    });
  } catch (error) {
    console.error("Trial Balance API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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

    // Fetch all relevant data in parallel
    const [
      { data: journalEntries },
      { data: monthlyExpenses },
      { data: expenses },
      { data: salesInvoices },
      { data: receiptVouchers },
      { data: paymentVouchers },
      { data: manualIncome },
      { data: creditNotes },
      { data: salaryPayrolls },
      { data: monthlyDeductions }
    ] = await Promise.all([
      supabase.from("journal_entries").select("*, accounts(id, account_code, account_name, type)").eq("company_id", companyId),
      supabase.from("monthly_expenses").select("*, accounts:account_id(id, account_code, account_name, type)").eq("company_id", companyId),
      supabase.from("expenses").select("*, accounts:account_id(id, account_code, account_name, type)").eq("company_id", companyId),
      supabase.from("sales_invoices").select("*").eq("company_id", companyId),
      supabase.from("receipt_vouchers").select("*").eq("company_id", companyId),
      supabase.from("payment_vouchers").select("*").eq("company_id", companyId),
      supabase.from("manual_income").select("*, accounts:account_id(id, account_code, account_name, type)").eq("company_id", companyId),
      supabase.from("credit_notes").select("*").eq("company_id", companyId),
      supabase.from("salary_payrolls").select("*").eq("company_id", companyId),
      supabase.from("monthly_deductions").select("*, accounts:account_id(id, account_code, account_name, type)").eq("company_id", companyId)
    ]);

    const balanceData: {
      [key: string]: {
        type: string;
        account_code: string;
        account_name: string;
        debit: number;
        credit: number;
      };
    } = {};

    const addEntry = (key: string, data: { type: string, account_code: string, account_name: string, debit: number, credit: number }) => {
      if (!balanceData[key]) {
        balanceData[key] = { ...data };
      } else {
        balanceData[key].debit += data.debit;
        balanceData[key].credit += data.credit;
      }
    };

    // 1. Journal Entries
    if (journalEntries) {
      journalEntries.forEach((entry: any) => {
        const accountCode = entry.accounts?.account_code || `JE-${entry.account_id || "UNC"}`;
        const accountName = entry.accounts?.account_name || "قيد يومية";
        addEntry(`journal-${accountCode}`, {
          type: "قيود اليومية",
          account_code: accountCode,
          account_name: accountName,
          debit: Number(entry.debit) || 0,
          credit: Number(entry.credit) || 0
        });
      });
    }

    // 2. Monthly Expenses
    if (monthlyExpenses) {
      monthlyExpenses.forEach((expense: any) => {
        const accountCode = expense.account_code || expense.accounts?.account_code || "EXP-MONTH";
        const accountName = expense.accounts?.account_name || expense.expense_type || "منصرفات شهرية";
        addEntry(`expense-${accountCode}`, {
          type: "المنصرفات",
          account_code: accountCode,
          account_name: accountName,
          debit: Number(expense.net_amount) || Number(expense.amount) || 0,
          credit: 0
        });
      });
    }

    // 3. Generic Expenses
    if (expenses) {
      expenses.forEach((expense: any) => {
        const accountCode = expense.accounts?.account_code || "EXP-GEN";
        const accountName = expense.accounts?.account_name || "مصروف";
        addEntry(`expense-${accountCode}`, {
          type: "المنصرفات",
          account_code: accountCode,
          account_name: accountName,
          debit: Number(expense.amount) || 0,
          credit: 0
        });
      });
    }

    // 4. Sales Invoices
    if (salesInvoices) {
      salesInvoices.forEach((invoice: any) => {
        addEntry("revenue-sales", {
          type: "الإيرادات",
          account_code: "4101",
          account_name: "المبيعات",
          debit: 0,
          credit: Number(invoice.total_amount) || 0
        });
      });
    }

    // 5. Credit Notes (Sales Returns)
    if (creditNotes) {
      creditNotes.forEach((note: any) => {
        addEntry("revenue-returns", {
          type: "الإيرادات",
          account_code: "4102",
          account_name: "مردودات مبيعات",
          debit: Number(note.total_amount) || 0,
          credit: 0
        });
      });
    }

    // 6. Manual Income
    if (manualIncome) {
      manualIncome.forEach((income: any) => {
        const accountCode = income.accounts?.account_code || "INC-MAN";
        const accountName = income.accounts?.account_name || income.income_type || "دخل إضافي";
        addEntry(`income-${accountCode}`, {
          type: "الإيرادات",
          account_code: accountCode,
          account_name: accountName,
          debit: 0,
          credit: Number(income.total) || Number(income.amount) || 0
        });
      });
    }

    // 7. Salary Payrolls
    if (salaryPayrolls) {
      const totalPayroll = salaryPayrolls.reduce((sum: number, p: any) => sum + (Number(p.total_amount) || 0), 0);
      if (totalPayroll > 0) {
        addEntry("payroll-salaries", {
          type: "الرواتب",
          account_code: "5101",
          account_name: "مصروفات الرواتب والأجور",
          debit: totalPayroll,
          credit: 0
        });
      }
    }

    // 8. Monthly Deductions
    if (monthlyDeductions) {
      monthlyDeductions.forEach((deduction: any) => {
        const accountCode = deduction.accounts?.account_code || "DED-MONTH";
        const accountName = deduction.accounts?.account_name || deduction.deduction_type || "استقطاعات";
        addEntry(`deduction-${accountCode}`, {
          type: "الاستقطاعات",
          account_code: accountCode,
          account_name: accountName,
          debit: 0,
          credit: Number(deduction.amount) || 0
        });
      });
    }

    // 9. Receipt Vouchers
    if (receiptVouchers) {
      receiptVouchers.forEach((receipt: any) => {
        addEntry("assets-cash-bank", {
          type: "الأصول",
          account_code: receipt.debit_account_code || "1101",
          account_name: "نقدية / بنك",
          debit: Number(receipt.total_amount) || 0,
          credit: 0
        });
        addEntry("liabilities-income", {
          type: "أخرى",
          account_code: receipt.credit_account_code || "UNC",
          account_name: "مقابل سند قبض",
          debit: 0,
          credit: Number(receipt.total_amount) || 0
        });
      });
    }

    // 10. Payment Vouchers
    if (paymentVouchers) {
      paymentVouchers.forEach((payment: any) => {
        addEntry("expenses-payments", {
          type: "المنصرفات",
          account_code: payment.debit_account_code || "5201",
          account_name: "مصروفات سندات صرف",
          debit: Number(payment.total_amount) || 0,
          credit: 0
        });
        addEntry("assets-cash-bank", {
          type: "الأصول",
          account_code: payment.credit_account_code || "1101",
          account_name: "نقدية / بنك",
          debit: 0,
          credit: Number(payment.total_amount) || 0
        });
      });
    }

    let balances = Object.values(balanceData);

    if (entryType && entryType !== "all") {
      balances = balances.filter(b => {
        if (entryType === "expenses") return b.type === "المنصرفات" || b.type === "الرواتب";
        if (entryType === "revenue") return b.type === "الإيرادات";
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

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
      { data: receiptVouchers },
      { data: paymentVouchers },
      { data: manualIncome },
      { data: creditNotes },
      { data: salaryPayrolls }
    ] = await Promise.all([
      supabase.from("journal_entries").select("*, accounts:account_id(id, account_code, account_name, type)").eq("company_id", companyId).lte("entry_date", toDate),
      supabase.from("monthly_expenses").select("*").eq("company_id", companyId).lte("expense_date", toDate),
      supabase.from("expenses").select("*").eq("company_id", companyId).lte("expense_date", toDate),
      supabase.from("sales_invoices").select("*").eq("company_id", companyId).lte("issue_date", toDate),
      supabase.from("receipt_vouchers").select("*").eq("company_id", companyId).lte("receipt_date", toDate),
      supabase.from("payment_vouchers").select("*").eq("company_id", companyId).lte("voucher_date", toDate),
      supabase.from("manual_income").select("*").eq("company_id", companyId).lte("income_date", toDate),
      supabase.from("credit_notes").select("*").eq("company_id", companyId).lte("created_at", toDate + "T23:59:59Z"),
      supabase.from("salary_payrolls").select("*").eq("company_id", companyId).lte("payroll_month", toDate.substring(0, 7))
    ]);

    const assetAccounts: { [key: string]: { account_name: string; account_code: string; net_balance: number } } = {};
    const liabilityAccounts: { [key: string]: { account_name: string; account_code: string; net_balance: number } } = {};
    const equityAccounts: { [key: string]: { account_name: string; account_code: string; net_balance: number } } = {};
    
    let cashBalance = 0;
    let revenueTotal = 0;
    let expenseTotal = 0;

    // 1. Journal Entries (Primary source for specific accounts)
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
            assetAccounts[accountId] = { account_name: account.account_name, account_code: account.account_code || "1101", net_balance: 0 };
          }
          assetAccounts[accountId].net_balance += (debit - credit);
        } else if (accountType === "التزام") {
          if (!liabilityAccounts[accountId]) {
            liabilityAccounts[accountId] = { account_name: account.account_name, account_code: account.account_code || "2101", net_balance: 0 };
          }
          liabilityAccounts[accountId].net_balance += (credit - debit);
        } else if (accountType === "حقوق ملكية") {
          if (!equityAccounts[accountId]) {
            equityAccounts[accountId] = { account_name: account.account_name, account_code: account.account_code || "3101", net_balance: 0 };
          }
          equityAccounts[accountId].net_balance += (credit - debit);
        } else if (accountType === "ايراد") {
          revenueTotal += (credit - debit);
        } else if (accountType === "مصروف") {
          expenseTotal += (debit - credit);
        }
      });
    }

    // 2. Sales Invoices -> Increase Revenue & potentially Cash/AR
    if (salesInvoices) {
      salesInvoices.forEach((inv: any) => {
        const amount = Number(inv.total_amount) || 0;
        revenueTotal += amount;
        cashBalance += amount; // Simplified: Assuming cash sales for now if no AR account
      });
    }

    // 3. Credit Notes -> Decrease Revenue & potentially Cash/AR
    if (creditNotes) {
      creditNotes.forEach((note: any) => {
        const amount = Number(note.total_amount) || 0;
        revenueTotal -= amount;
        cashBalance -= amount;
      });
    }

    // 4. Receipt Vouchers -> Increase Cash
    if (receiptVouchers) {
      receiptVouchers.forEach((rv: any) => {
        cashBalance += Number(rv.total_amount) || 0;
      });
    }

    // 5. Payment Vouchers -> Decrease Cash
    if (paymentVouchers) {
      paymentVouchers.forEach((pv: any) => {
        cashBalance -= Number(pv.total_amount) || 0;
      });
    }

    // 6. Expenses -> Increase Expense & Decrease Cash
    const allExpenses = [...(monthlyExpenses || []), ...(expenses || [])];
    allExpenses.forEach((exp: any) => {
      const amount = Number(exp.net_amount) || Number(exp.amount) || 0;
      expenseTotal += amount;
      cashBalance -= amount;
    });

    // 7. Manual Income -> Increase Revenue & Increase Cash
    if (manualIncome) {
      manualIncome.forEach((inc: any) => {
        const amount = Number(inc.total) || Number(inc.amount) || 0;
        revenueTotal += amount;
        cashBalance += amount;
      });
    }

    // 8. Payroll -> Increase Expense & Decrease Cash
    if (salaryPayrolls) {
      salaryPayrolls.forEach((p: any) => {
        const amount = Number(p.total_amount) || 0;
        expenseTotal += amount;
        cashBalance -= amount;
      });
    }

    // Add Cash/Bank to assets if not already balanced via journals
    if (Math.abs(cashBalance) > 0.01) {
      if (!assetAccounts["cash-bank"]) {
        assetAccounts["cash-bank"] = { account_name: "النقدية والبنك", account_code: "1101", net_balance: 0 };
      }
      assetAccounts["cash-bank"].net_balance += cashBalance;
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
      period: { fromDate, toDate },
    });
  } catch (error) {
    console.error("Balance Sheet API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

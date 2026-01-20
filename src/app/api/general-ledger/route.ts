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
    const accountId = searchParams.get("account_id");
    const costCenterId = searchParams.get("cost_center_id");
    const search = searchParams.get("search");
    const entryType = searchParams.get("entry_type");

    // Fetch all relevant data in parallel for better performance
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
      { data: accounts },
      { data: costCenters }
    ] = await Promise.all([
      // 1. Journal Entries
      supabase.from("journal_entries").select("*, accounts(id, account_code, account_name, type)").eq("company_id", companyId),
      // 2. Monthly Expenses
      supabase.from("monthly_expenses").select("*, accounts:account_id(id, account_code, account_name, type), cost_centers:cost_center_id(id, center_code, center_name)").eq("company_id", companyId),
      // 3. Generic Expenses
      supabase.from("expenses").select("*, accounts:account_id(id, account_code, account_name, type)").eq("company_id", companyId),
      // 4. Sales Invoices
      supabase.from("sales_invoices").select("*").eq("company_id", companyId),
      // 5. Receipt Vouchers
      supabase.from("receipt_vouchers").select("*").eq("company_id", companyId),
      // 6. Payment Vouchers
      supabase.from("payment_vouchers").select("*").eq("company_id", companyId),
      // 7. Manual Income
      supabase.from("manual_income").select("*, accounts:account_id(id, account_code, account_name, type), cost_centers:cost_center_id(id, center_code, center_name)").eq("company_id", companyId),
      // 8. Credit Notes
      supabase.from("credit_notes").select("*").eq("company_id", companyId),
      // 9. Salary Payrolls
      supabase.from("salary_payrolls").select("*").eq("company_id", companyId),
      // Metadata
      supabase.from("accounts").select("id, account_code, account_name, type").eq("company_id", companyId).order("account_code"),
      supabase.from("cost_centers").select("id, center_code, center_name").eq("company_id", companyId).order("center_code")
    ]);

    const ledgerEntries: any[] = [];

    // Process Journal Entries
    if (journalEntries) {
      journalEntries.forEach((entry: any) => {
        ledgerEntries.push({
          id: `je-${entry.id}`,
          date: entry.entry_date,
          document_number: entry.entry_number || `JE-${entry.id}`,
          description: entry.description,
          account_code: entry.accounts?.account_code || "",
          account_name: entry.accounts?.account_name || "",
          account_type: entry.accounts?.type || "",
          cost_center_code: "",
          cost_center_name: "",
          debit: Number(entry.debit) || 0,
          credit: Number(entry.credit) || 0,
          source: "journal_entry",
          source_type: "قيد يومية",
          created_at: entry.created_at,
          account_id: entry.account_id,
        });
      });
    }

    // Process Monthly Expenses
    if (monthlyExpenses) {
      monthlyExpenses.forEach((expense: any) => {
        ledgerEntries.push({
          id: `mexp-${expense.id}`,
          date: expense.expense_date,
          document_number: `MEXP-${expense.id}`,
          description: expense.description || expense.expense_type,
          account_code: expense.account_code || expense.accounts?.account_code || "",
          account_name: expense.accounts?.account_name || expense.expense_type || "",
          account_type: expense.accounts?.type || "expense",
          cost_center_code: expense.cost_center_code || expense.cost_centers?.center_code || "",
          cost_center_name: expense.cost_centers?.center_name || "",
          debit: Number(expense.net_amount) || Number(expense.amount) || 0,
          credit: 0,
          source: "expense",
          source_type: "منصرفات شهرية",
          created_at: expense.created_at,
          account_id: expense.account_id,
          cost_center_id: expense.cost_center_id,
        });
      });
    }

    // Process Generic Expenses
    if (expenses) {
      expenses.forEach((expense: any) => {
        ledgerEntries.push({
          id: `exp-${expense.id}`,
          date: expense.expense_date,
          document_number: `EXP-${expense.id}`,
          description: expense.description,
          account_code: expense.accounts?.account_code || "",
          account_name: expense.accounts?.account_name || "مصروف",
          account_type: expense.accounts?.type || "expense",
          cost_center_code: "",
          cost_center_name: "",
          debit: Number(expense.amount) || 0,
          credit: 0,
          source: "expense",
          source_type: "منصرفات",
          created_at: expense.created_at,
          account_id: expense.account_id,
        });
      });
    }

    // Process Sales Invoices
    if (salesInvoices) {
      salesInvoices.forEach((invoice: any) => {
        ledgerEntries.push({
          id: `inv-${invoice.id}`,
          date: invoice.issue_date,
          document_number: invoice.invoice_number || `INV-${invoice.id}`,
          description: `فاتورة مبيعات: ${invoice.client_name}`,
          account_code: "4101", // Default Sales/Revenue code if not specified
          account_name: "المبيعات",
          account_type: "revenue",
          cost_center_code: "",
          cost_center_name: "",
          debit: 0,
          credit: Number(invoice.total_amount) || 0,
          source: "sales_invoice",
          source_type: "فاتورة مبيعات",
          created_at: invoice.created_at,
        });
      });
    }

    // Process Credit Notes
    if (creditNotes) {
      creditNotes.forEach((note: any) => {
        ledgerEntries.push({
          id: `cn-${note.id}`,
          date: note.created_at?.split('T')[0],
          document_number: note.credit_note_number || `CN-${note.id}`,
          description: `إشعار دائن لعميل: ${note.client_name} - سبب: ${note.reason || ""}`,
          account_code: "4101",
          account_name: "مردودات مبيعات",
          account_type: "revenue",
          cost_center_code: "",
          cost_center_name: "",
          debit: Number(note.total_amount) || 0,
          credit: 0,
          source: "credit_note",
          source_type: "إشعار دائن",
          created_at: note.created_at,
        });
      });
    }

    // Process Receipt Vouchers
    if (receiptVouchers) {
      receiptVouchers.forEach((receipt: any) => {
        ledgerEntries.push({
          id: `rv-${receipt.id}`,
          date: receipt.receipt_date,
          document_number: receipt.receipt_number || `RV-${receipt.id}`,
          description: `سند قبض من: ${receipt.received_from} - ${receipt.description || ""}`,
          account_code: receipt.debit_account_code || receipt.credit_account_code || "",
          account_name: receipt.account_name || "سند قبض",
          account_type: "asset",
          cost_center_code: receipt.debit_cost_center || receipt.credit_cost_center || "",
          cost_center_name: "",
          debit: Number(receipt.total_amount) || 0,
          credit: 0,
          source: "receipt_voucher",
          source_type: "سند قبض",
          created_at: receipt.created_at,
        });
      });
    }

    // Process Payment Vouchers
    if (paymentVouchers) {
      paymentVouchers.forEach((payment: any) => {
        ledgerEntries.push({
          id: `pv-${payment.id}`,
          date: payment.voucher_date,
          document_number: payment.voucher_number || `PV-${payment.id}`,
          description: `سند صرف إلى: ${payment.payee_name} - ${payment.description || ""}`,
          account_code: payment.credit_account_code || payment.debit_account_code || "",
          account_name: payment.debit_account_name || "سند صرف",
          account_type: "expense",
          cost_center_code: payment.credit_cost_center || payment.debit_cost_center || "",
          cost_center_name: "",
          debit: 0,
          credit: Number(payment.total_amount) || 0,
          source: "payment_voucher",
          source_type: "سند صرف",
          created_at: payment.created_at,
        });
      });
    }

    // Process Manual Income
    if (manualIncome) {
      manualIncome.forEach((income: any) => {
        ledgerEntries.push({
          id: `mi-${income.id}`,
          date: income.income_date,
          document_number: income.operation_number || `INC-${income.id}`,
          description: `${income.income_type}: ${income.description || ""}`,
          account_code: income.accounts?.account_code || "",
          account_name: income.accounts?.account_name || income.income_type,
          account_type: income.accounts?.type || "revenue",
          cost_center_code: income.cost_centers?.center_code || "",
          cost_center_name: income.cost_centers?.center_name || "",
          debit: 0,
          credit: Number(income.total) || 0,
          source: "manual_income",
          source_type: "دخل إضافي",
          created_at: income.created_at,
          account_id: income.account_id,
          cost_center_id: income.cost_center_id,
        });
      });
    }

    // Process Salary Payrolls
    if (salaryPayrolls) {
      salaryPayrolls.forEach((payroll: any) => {
        ledgerEntries.push({
          id: `sp-${payroll.id}`,
          date: payroll.created_at?.split('T')[0],
          document_number: `PAY-${payroll.id}`,
          description: `مسير رواتب شهر: ${payroll.payroll_month}`,
          account_code: "5101",
          account_name: "رواتب ومنافع موظفين",
          account_type: "expense",
          cost_center_code: "",
          cost_center_name: "",
          debit: Number(payroll.total_amount) || 0,
          credit: 0,
          source: "salary_payroll",
          source_type: "مسير رواتب",
          created_at: payroll.created_at,
        });
      });
    }

    // Apply Filters
    let filteredEntries = ledgerEntries.filter(entry => {
      let matches = true;
      if (fromDate && entry.date < fromDate) matches = false;
      if (toDate && entry.date > toDate) matches = false;
      if (accountId && String(entry.account_id) !== String(accountId)) matches = false;
      if (costCenterId && String(entry.cost_center_id) !== String(costCenterId)) matches = false;
      if (search) {
        const s = search.toLowerCase();
        matches = matches && (
          entry.description?.toLowerCase().includes(s) ||
          entry.document_number?.toLowerCase().includes(s) ||
          entry.account_code?.toLowerCase().includes(s) ||
          entry.account_name?.toLowerCase().includes(s)
        );
      }
      if (entryType && entryType !== "all") {
        if (entryType === "debit") matches = matches && entry.debit > 0;
        if (entryType === "credit") matches = matches && entry.credit > 0;
      }
      return matches;
    });

    // Sort entries
    filteredEntries.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    // Calculate Running Balance
    let runningBalance = 0;
    // For running balance to be correct, we need to calculate it from the beginning of time up to the current entries, 
    // but here we just calculate it for the filtered/returned list for simplicity.
    // In a real GL, you'd fetch the opening balance first.
    const entriesWithBalance = [...filteredEntries].reverse().map(entry => {
      runningBalance += entry.debit - entry.credit;
      return { ...entry, balance: runningBalance };
    }).reverse();

    // Stats
    const totalDebit = filteredEntries.reduce((sum, e) => sum + e.debit, 0);
    const totalCredit = filteredEntries.reduce((sum, e) => sum + e.credit, 0);
    const finalBalance = totalDebit - totalCredit;

    // Charts
    const entriesByMonth: { [key: string]: number } = {};
    filteredEntries.forEach(entry => {
      const month = entry.date?.substring(0, 7) || "unknown";
      entriesByMonth[month] = (entriesByMonth[month] || 0) + entry.debit;
    });

    const accountStats: { [key: string]: { name: string; total: number } } = {};
    filteredEntries.forEach(entry => {
      if (entry.account_code) {
        if (!accountStats[entry.account_code]) {
          accountStats[entry.account_code] = { name: entry.account_name, total: 0 };
        }
        accountStats[entry.account_code].total += entry.debit + entry.credit;
      }
    });

    const topAccounts = Object.entries(accountStats)
      .map(([code, data]) => ({ code, name: data.name, total: data.total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    const costCenterStats: { [key: string]: { name: string; total: number } } = {};
    filteredEntries.forEach(entry => {
      if (entry.cost_center_code) {
        if (!costCenterStats[entry.cost_center_code]) {
          costCenterStats[entry.cost_center_code] = { name: entry.cost_center_name, total: 0 };
        }
        costCenterStats[entry.cost_center_code].total += entry.debit + entry.credit;
      }
    });

    return NextResponse.json({
      entries: entriesWithBalance,
      stats: {
        totalDebit,
        totalCredit,
        finalBalance,
        entriesCount: filteredEntries.length,
        activeAccounts: Object.keys(accountStats).length,
      },
      chartData: {
        monthlyTrend: Object.entries(entriesByMonth).map(([month, amount]) => ({ month, amount })),
        topAccounts,
        costCenterDistribution: Object.entries(costCenterStats).map(([code, data]) => ({ 
          code, 
          name: data.name, 
          total: data.total 
        })),
      },
      metadata: {
        accounts: accounts || [],
        costCenters: costCenters || [],
      },
    });
  } catch (error) {
    console.error("General Ledger API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

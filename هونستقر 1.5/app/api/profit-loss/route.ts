import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query } from "@/lib/db";

export const dynamic = 'force-dynamic';

async function getCompanyId(userId: number) {
  const users = await query<any>("SELECT company_id FROM users WHERE id = ?", [userId]);
  return users[0]?.company_id;
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("auth_session");

    if (!sessionCookie) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    let companyId = session.company_id;
    const userName = session.user_name || session.name || "المستخدم";

    if (!companyId && session.user_id) {
      companyId = await getCompanyId(session.user_id);
    }

    if (!companyId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month") || new Date().toISOString().slice(0, 7);
    const includeTax = searchParams.get("includeTax") !== "false";

    const [year, monthNum] = month.split("-").map(Number);
    const monthStart = `${year}-${String(monthNum).padStart(2, "0")}-01`;
    const lastDay = new Date(year, monthNum, 0).getDate();
    const monthEnd = `${year}-${String(monthNum).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    // Company info
    const companies = await query<any>(
      "SELECT name, logo_path FROM companies WHERE id = ?",
      [companyId]
    );
    const companyInfo = companies[0] || { name: "اسم الشركة", logo_path: null };

    // ─── 1. SALES INVOICES (income) ──────────────────────────────────────────
    const invoices = await query<any>(`
      SELECT
        si.id, si.invoice_number, si.issue_date, si.client_name,
        si.total_amount, si.tax_amount AS vat_total,
        COALESCE(si.discount, 0) AS discount,
        (si.total_amount + COALESCE(si.discount, 0)) AS before_discount,
        COALESCE(u.name, 'النظام') AS created_by
      FROM sales_invoices si
      LEFT JOIN users u ON si.created_by = u.id
      WHERE si.company_id = ?
        AND DATE(si.issue_date) BETWEEN ? AND ?
        AND COALESCE(si.status, '') != 'draft'
      ORDER BY si.issue_date DESC
    `, [companyId, monthStart, monthEnd]);

    let invoiceTotalWithTax = 0;
    let invoiceTotalWithoutTax = 0;
    for (const inv of invoices) {
      const total = parseFloat(inv.total_amount) || 0;
      const tax = parseFloat(inv.vat_total) || 0;
      invoiceTotalWithTax += total;
      invoiceTotalWithoutTax += (total - tax);
    }
    const invoiceIncome = includeTax ? invoiceTotalWithTax : invoiceTotalWithoutTax;

    // ─── 2. CREDIT NOTES (deducted from income) ──────────────────────────────
    const creditNotes = await query<any>(`
      SELECT id, credit_note_number, created_at, client_name,
             total_amount, vat_amount, total_before_vat, reason
      FROM credit_notes
      WHERE company_id = ? AND status = 'active'
        AND DATE(created_at) BETWEEN ? AND ?
      ORDER BY created_at DESC
    `, [companyId, monthStart, monthEnd]);

    let creditNotesTotal = 0;
    for (const cn of creditNotes) {
      const total = parseFloat(cn.total_amount) || 0;
      const vat = parseFloat(cn.vat_amount) || 0;
      creditNotesTotal += includeTax ? total : (total - vat);
    }

    // ─── 3. MANUAL INCOME (other income) ─────────────────────────────────────
    const manualIncome = await query<any>(`
      SELECT id, operation_number, income_date, income_type,
             amount, vat, total, description, payment_method
      FROM manual_income
      WHERE company_id = ? AND income_date BETWEEN ? AND ?
      ORDER BY income_date DESC
    `, [companyId, monthStart, monthEnd]);

    let manualIncomeTotal = 0;
    for (const inc of manualIncome) {
      const total = parseFloat(inc.total) || 0;
      const vat = parseFloat(inc.vat) || 0;
      manualIncomeTotal += includeTax ? total : (total - vat);
    }

    // ─── 4. RECEIPT VOUCHERS (income receipts) ───────────────────────────────
    const receiptVouchers = await query<any>(`
      SELECT id, receipt_number, receipt_date, received_from,
             amount, tax_value, total_amount, description, payment_method
      FROM receipt_vouchers
      WHERE company_id = ? AND receipt_date BETWEEN ? AND ?
      ORDER BY receipt_date DESC
    `, [companyId, monthStart, monthEnd]);

    let receiptVouchersTotal = 0;
    for (const rv of receiptVouchers) {
      const total = parseFloat(rv.total_amount) || 0;
      const tax = parseFloat(rv.tax_value) || 0;
      receiptVouchersTotal += includeTax ? total : (total - tax);
    }

    // ─── 5. MONTHLY EXPENSES (operational expenses) ──────────────────────────
    const monthlyExpenses = await query<any>(`
      SELECT id, expense_date, expense_type, amount, description,
             COALESCE(employee_name, 'غير محدد') AS employee_name,
             COALESCE(employee_name, 'غير محدد') AS employee_display_name,
             account_code, cost_center_code,
             tax_value, net_amount
      FROM monthly_expenses
      WHERE company_id = ? AND DATE(expense_date) BETWEEN ? AND ?
      ORDER BY expense_date DESC
    `, [companyId, monthStart, monthEnd]);

    let monthlyExpensesTotal = 0;
    for (const exp of monthlyExpenses) {
      monthlyExpensesTotal += parseFloat(exp.amount) || 0;
    }

    // ─── 6. SALARY PAYROLLS (payroll expenses) ───────────────────────────────
    const payrolls = await query<any>(`
      SELECT id, payroll_month, total_amount, employee_count,
             is_paid, saved_by, created_at
      FROM salary_payrolls
      WHERE company_id = ? AND payroll_month = ? AND (is_draft IS NULL OR is_draft = 0)
      ORDER BY created_at DESC
    `, [companyId, month]);

    let payrollsTotal = 0;
    for (const pr of payrolls) {
      payrollsTotal += parseFloat(pr.total_amount) || 0;
    }

    // ─── 7. PAYMENT VOUCHERS (expense payments) ──────────────────────────────
    const paymentVouchers = await query<any>(`
      SELECT id, voucher_number, voucher_date, payee_name,
             amount, tax_value, total_amount, description, payment_method
      FROM payment_vouchers
      WHERE company_id = ? AND voucher_date BETWEEN ? AND ?
      ORDER BY voucher_date DESC
    `, [companyId, monthStart, monthEnd]);

    let paymentVouchersTotal = 0;
    for (const pv of paymentVouchers) {
      const total = parseFloat(pv.total_amount) || 0;
      const tax = parseFloat(pv.tax_value) || 0;
      paymentVouchersTotal += includeTax ? total : (total - tax);
    }

    // ─── 8. JOURNAL ENTRIES (accounting entries) ─────────────────────────────
    const journalEntries = await query<any>(`
      SELECT
        je.id, je.entry_number, je.entry_date, je.description,
        je.debit, je.credit, je.status, je.source_type,
        a.account_code, a.account_name, a.type AS account_type,
        cc.center_code, cc.center_name
      FROM journal_entries je
      LEFT JOIN accounts a ON je.account_id = a.id
      LEFT JOIN cost_centers cc ON je.cost_center_id = cc.id
      WHERE je.company_id = ? AND je.entry_date BETWEEN ? AND ?
      ORDER BY je.entry_date DESC
    `, [companyId, monthStart, monthEnd]);

    let journalIncomeTotal = 0;
    let journalExpenseTotal = 0;
    const journalIncomeEntries: any[] = [];
    const journalExpenseEntries: any[] = [];

    for (const je of journalEntries) {
      const accType = (je.account_type || "").trim();
      const debit = parseFloat(je.debit) || 0;
      const credit = parseFloat(je.credit) || 0;
      const base = {
        id: je.id,
        entry_number: je.entry_number,
        entry_date: je.entry_date,
        description: je.description,
        debit, credit,
        status: je.status,
        source_type: je.source_type || "manual",
        account_code: je.account_code || "",
        account_name: je.account_name || "",
        account_type: accType,
        cost_center_name: je.center_name || "",
        cost_center_code: je.center_code || "",
      };

      // دخل = income account → credit side is revenue
      if (accType === "دخل") {
        const net = credit - debit;
        if (net > 0) {
          journalIncomeTotal += net;
          journalIncomeEntries.push({ ...base, net_amount: net });
        } else if (net < 0) {
          journalExpenseTotal += Math.abs(net);
          journalExpenseEntries.push({ ...base, net_amount: Math.abs(net) });
        }
      }
      // مصروف = expense account → debit side is expense
      else if (accType === "مصروف") {
        const net = debit - credit;
        if (net > 0) {
          journalExpenseTotal += net;
          journalExpenseEntries.push({ ...base, net_amount: net });
        } else if (net < 0) {
          journalIncomeTotal += Math.abs(net);
          journalIncomeEntries.push({ ...base, net_amount: Math.abs(net) });
        }
      }
    }

    // ─── TOTALS ───────────────────────────────────────────────────────────────
    const netInvoiceIncome = invoiceIncome - creditNotesTotal;
    const totalIncome = netInvoiceIncome + manualIncomeTotal + receiptVouchersTotal + journalIncomeTotal;
    const totalExpenses = monthlyExpensesTotal + payrollsTotal + paymentVouchersTotal + journalExpenseTotal;
    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    return NextResponse.json({
      companyInfo,
      userName,
      month,
      includeTax,
      summary: {
        // Current field names
        invoiceTotalWithTax,
        invoiceTotalWithoutTax,
        invoiceIncome,
        creditNotesTotal,
        netInvoiceIncome,
        manualIncomeTotal,
        receiptVouchersTotal,
        journalIncomeTotal,
        totalIncome,
        monthlyExpensesTotal,
        payrollsTotal,
        paymentVouchersTotal,
        journalExpenseTotal,
        totalExpenses,
        netProfit,
        profitMargin,
        // Legacy aliases for client compatibility
        invoiceTotal: invoiceIncome,
        expensesTotal: monthlyExpensesTotal,
        journalRevenueTotal: journalIncomeTotal,
      },
      details: {
        invoices,
        creditNotes,
        manualIncome,
        receiptVouchers,
        // Legacy alias
        expenses: monthlyExpenses,
        monthlyExpenses,
        payrolls,
        paymentVouchers,
        // Legacy alias
        journalRevenueEntries: journalIncomeEntries,
        journalIncomeEntries,
        journalExpenseEntries,
      },
      counts: {
        invoices: invoices.length,
        creditNotes: creditNotes.length,
        manualIncome: manualIncome.length,
        receiptVouchers: receiptVouchers.length,
        // Legacy alias
        expenses: monthlyExpenses.length,
        monthlyExpenses: monthlyExpenses.length,
        payrolls: payrolls.length,
        paymentVouchers: paymentVouchers.length,
        // Legacy alias
        journalRevenue: journalIncomeEntries.length,
        journalIncome: journalIncomeEntries.length,
        journalExpense: journalExpenseEntries.length,
      },
    });
  } catch (error: any) {
    console.error("Error fetching profit/loss data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

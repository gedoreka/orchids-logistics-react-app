import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
      const monthStart = `${year}-${String(monthNum).padStart(2, '0')}-01`;
      // Safely calculate the last day of the month without timezone shifts
      const lastDay = new Date(year, monthNum, 0).getDate();
      const monthEnd = `${year}-${String(monthNum).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const companies = await query<any>(
      "SELECT name, logo_path FROM companies WHERE id = ?",
      [companyId]
    );
    const companyInfo = companies[0] || { name: "اسم الشركة", logo_path: null };

      // 1. Sales Invoices (MySQL) - Linked by issue_date
      const invoicesResult = await query<any>(`
        SELECT 
          si.id,
          si.invoice_number,
          si.issue_date,
          si.total_amount,
          si.discount,
          (si.total_amount + COALESCE(si.discount, 0)) as before_discount,
          COALESCE(u.name, 'النظام') as created_by
        FROM sales_invoices si
        LEFT JOIN users u ON si.created_by = u.id
        WHERE si.company_id = ? AND si.issue_date BETWEEN ? AND ?
        ORDER BY si.issue_date DESC
      `, [companyId, monthStart, monthEnd]);
  
      let invoiceTotal = 0;
      let invoiceTotalWithoutTax = 0;
      for (const inv of invoicesResult) {
        const total = parseFloat(inv.total_amount) || 0;
        invoiceTotal += total;
        invoiceTotalWithoutTax += total / 1.15;
      }
  
      // 2. Credit Notes (Supabase) - Reduction from income
      const { data: creditNotesData, error: cnError } = await supabase
        .from("credit_notes")
        .select("*")
        .eq("company_id", companyId)
        .gte("created_at", `${monthStart}T00:00:00Z`)
        .lte("created_at", `${monthEnd}T23:59:59Z`);
      
      const creditNotes = creditNotesData || [];
      let creditNotesTotal = 0;
      for (const cn of creditNotes) {
        creditNotesTotal += parseFloat(cn.total_amount) || 0;
      }

      // 3. Manual Income (Supabase)
      const { data: manualIncomeData, error: manualIncomeError } = await supabase
        .from("manual_income")
        .select("*")
        .eq("company_id", companyId)
        .gte("income_date", monthStart)
        .lte("income_date", monthEnd)
        .order("income_date", { ascending: false });
  
      const manualIncome = manualIncomeData || [];
      let manualIncomeTotal = 0;
      for (const inc of manualIncome) {
        manualIncomeTotal += parseFloat(inc.total) || 0;
      }
  
      // 4. Receipt Vouchers (MySQL)
      const receiptVouchersResult = await query<any>(`
        SELECT * FROM receipt_vouchers 
        WHERE company_id = ? AND receipt_date BETWEEN ? AND ?
        ORDER BY receipt_date DESC
      `, [companyId, monthStart, monthEnd]);
  
      let receiptVouchersTotal = 0;
      for (const rv of receiptVouchersResult) {
        receiptVouchersTotal += parseFloat(rv.total_amount) || 0;
      }
  
      // 5. Operational Expenses (MySQL)
      const monthlyExpensesResult = await query<any>(`
        SELECT 
          me.*,
          COALESCE(me.employee_name, 'غير محدد') as employee_display_name
        FROM monthly_expenses me
        WHERE me.company_id = ? AND me.expense_date BETWEEN ? AND ?
        ORDER BY me.expense_date DESC
      `, [companyId, monthStart, monthEnd]);
  
      let monthlyExpensesTotal = 0;
      for (const exp of monthlyExpensesResult) {
        monthlyExpensesTotal += parseFloat(exp.amount) || 0;
      }

      // 6. General Expenses (Supabase)
      const { data: generalExpensesData } = await supabase
        .from("expenses")
        .select("*")
        .eq("company_id", companyId)
        .gte("expense_date", monthStart)
        .lte("expense_date", monthEnd);

      const generalExpenses = generalExpensesData || [];
      let generalExpensesTotal = 0;
      for (const exp of generalExpenses) {
        generalExpensesTotal += parseFloat(exp.amount) || 0;
      }

      // 7. Payment Vouchers (Supabase)
      const { data: paymentVouchersData } = await supabase
        .from("payment_vouchers")
        .select("*")
        .eq("company_id", companyId)
        .gte("voucher_date", monthStart)
        .lte("voucher_date", monthEnd);

      const paymentVouchers = paymentVouchersData || [];
      let paymentVouchersTotal = 0;
      for (const pv of paymentVouchers) {
        paymentVouchersTotal += parseFloat(pv.total_amount) || 0;
      }
  
      // 8. Salary Payrolls (MySQL)
      const payrollsResult = await query<any>(`
        SELECT 
          sp.id,
          sp.payroll_month,
          sp.total_amount,
          sp.created_at,
          sp.is_draft
        FROM salary_payrolls sp
        WHERE sp.company_id = ? AND sp.payroll_month = ? AND sp.is_draft = 0
        ORDER BY sp.created_at DESC
      `, [companyId, month]);
  
      let payrollsTotal = 0;
      for (const pr of payrollsResult) {
        payrollsTotal += parseFloat(pr.total_amount) || 0;
      }
  
      const invoiceIncomeValue = includeTax ? invoiceTotal : invoiceTotalWithoutTax;
      // Net Income = Invoices (filtered by issue_date) - Credit Notes + Manual Income + Receipt Vouchers
      const totalIncome = (invoiceIncomeValue - creditNotesTotal) + manualIncomeTotal + receiptVouchersTotal;
      // Net Expenses = Monthly (MySQL) + General (Supabase) + Payment Vouchers (Supabase) + Payrolls (MySQL)
      const totalExpenses = monthlyExpensesTotal + generalExpensesTotal + paymentVouchersTotal + payrollsTotal;
      const netProfit = totalIncome - totalExpenses;
      const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;
  
      return NextResponse.json({
        companyInfo,
        userName,
        month,
        includeTax,
        summary: {
          invoiceTotal: invoiceIncomeValue,
          invoiceTotalWithTax: invoiceTotal,
          invoiceTotalWithoutTax: invoiceTotalWithoutTax,
          creditNotesTotal,
          manualIncomeTotal,
          receiptVouchersTotal,
          totalIncome,
          expensesTotal: monthlyExpensesTotal + generalExpensesTotal,
          paymentVouchersTotal,
          payrollsTotal,
          totalExpenses,
          netProfit,
          profitMargin
        },
        details: {
          invoices: invoicesResult,
          creditNotes: creditNotes,
          manualIncome,
          receiptVouchers: receiptVouchersResult,
          expenses: [
            ...monthlyExpensesResult.map((e: any) => ({ ...e, source: 'operational' })),
            ...generalExpenses.map((e: any) => ({ ...e, source: 'general' }))
          ],
          paymentVouchers: paymentVouchers,
          payrolls: payrollsResult
        },
        counts: {
          invoices: invoicesResult.length,
          creditNotes: creditNotes.length,
          manualIncome: manualIncome.length,
          receiptVouchers: receiptVouchersResult.length,
          expenses: monthlyExpensesResult.length + generalExpenses.length,
          paymentVouchers: paymentVouchers.length,
          payrolls: payrollsResult.length
        }
      });
  } catch (error: any) {
    console.error("Error fetching profit/loss data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

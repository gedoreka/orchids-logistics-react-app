import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    if (!companyId || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const cId = parseInt(companyId);

    // 1. Fetch Output Tax (Sales)
    const [salesInvoices, manualIncome, receiptVouchers] = await Promise.all([
      supabase
        .from("sales_invoices")
        .select("vat_total, total_amount")
        .eq("company_id", cId)
        .gte("issue_date", startDate)
        .lte("issue_date", endDate),
      supabase
        .from("manual_income")
        .select("vat, amount")
        .eq("company_id", cId)
        .gte("income_date", startDate)
        .lte("income_date", endDate),
      supabase
        .from("receipt_vouchers")
        .select("tax_value, amount")
        .eq("company_id", cId)
        .gte("receipt_date", startDate)
        .lte("receipt_date", endDate)
    ]);

    const outputTax = {
      sales_vat: (salesInvoices.data || []).reduce((sum, item) => sum + (Number(item.vat_total) || 0), 0),
      sales_taxable: (salesInvoices.data || []).reduce((sum, item) => sum + (Number(item.total_amount) || 0), 0),
      income_vat: (manualIncome.data || []).reduce((sum, item) => sum + (Number(item.vat) || 0), 0),
      income_taxable: (manualIncome.data || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
      receipt_vat: (receiptVouchers.data || []).reduce((sum, item) => sum + (Number(item.tax_value) || 0), 0),
      receipt_taxable: (receiptVouchers.data || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    };

    // 2. Fetch Input Tax (Purchases/Expenses)
    const [monthlyExpenses, paymentVouchers] = await Promise.all([
      supabase
        .from("monthly_expenses")
        .select("tax_value, amount")
        .eq("company_id", cId)
        .gte("expense_date", startDate)
        .lte("expense_date", endDate),
      supabase
        .from("payment_vouchers")
        .select("tax_value, amount")
        .eq("company_id", cId)
        .gte("voucher_date", startDate)
        .lte("voucher_date", endDate)
    ]);

    const inputTax = {
      expense_vat: (monthlyExpenses.data || []).reduce((sum, item) => sum + (Number(item.tax_value) || 0), 0),
      expense_taxable: (monthlyExpenses.data || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
      payment_vat: (paymentVouchers.data || []).reduce((sum, item) => sum + (Number(item.tax_value) || 0), 0),
      payment_taxable: (paymentVouchers.data || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    };

    const totalOutputTax = outputTax.sales_vat + outputTax.income_vat + outputTax.receipt_vat;
    const totalSalesTaxable = outputTax.sales_taxable + outputTax.income_taxable + outputTax.receipt_taxable;
    
    const totalInputTax = inputTax.expense_vat + inputTax.payment_vat;
    const totalPurchasesTaxable = inputTax.expense_taxable + inputTax.payment_taxable;

    const netTaxPayable = totalOutputTax - totalInputTax;

    return NextResponse.json({
      success: true,
      data: {
        total_sales_taxable: totalSalesTaxable,
        total_output_tax: totalOutputTax,
        total_purchases_taxable: totalPurchasesTaxable,
        total_input_tax: totalInputTax,
        net_tax_payable: netTaxPayable,
        details: {
          output: outputTax,
          input: inputTax
        }
      }
    });
  } catch (error) {
    console.error("Error collecting tax data:", error);
    return NextResponse.json({ error: "Failed to collect tax data" }, { status: 500 });
  }
}

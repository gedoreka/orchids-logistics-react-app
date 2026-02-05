import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { query } from "@/lib/db";

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

    // 1. Fetch from MySQL
    const [salesInvoices, manualIncome, receiptVouchers, monthlyExpenses] = await Promise.all([
      query<any>(
        "SELECT total_amount, vat_rate FROM sales_invoices WHERE company_id = ? AND issue_date >= ? AND issue_date <= ?",
        [cId, startDate, endDate]
      ),
      query<any>(
        "SELECT amount, vat FROM manual_income WHERE company_id = ? AND income_date >= ? AND income_date <= ?",
        [cId, startDate, endDate]
      ),
      query<any>(
        "SELECT amount, tax_value FROM receipt_vouchers WHERE company_id = ? AND receipt_date >= ? AND receipt_date <= ?",
        [cId, startDate, endDate]
      ),
      query<any>(
        "SELECT amount, tax_value FROM monthly_expenses WHERE company_id = ? AND expense_date >= ? AND expense_date <= ?",
        [cId, startDate, endDate]
      )
    ]);

    // 2. Fetch Payment Vouchers from Supabase (as they don't exist in MySQL)
    const { data: paymentVouchers } = await supabase
      .from("payment_vouchers")
      .select("tax_value, amount")
      .eq("company_id", cId)
      .gte("voucher_date", startDate)
      .lte("voucher_date", endDate);

    // 3. Calculate Output Tax (Sales/Income)
    const outputTax = {
      // Sales Invoices: total_amount is gross, calculate net and vat
      sales_vat: salesInvoices.reduce((sum, item) => {
        const gross = Number(item.total_amount) || 0;
        const rate = (Number(item.vat_rate) || 15) / 100;
        const net = gross / (1 + rate);
        return sum + (gross - net);
      }, 0),
      sales_taxable: salesInvoices.reduce((sum, item) => {
        const gross = Number(item.total_amount) || 0;
        const rate = (Number(item.vat_rate) || 15) / 100;
        return sum + (gross / (1 + rate));
      }, 0),
      // Manual Income: amount is taxable, vat is stored
      income_vat: manualIncome.reduce((sum, item) => sum + (Number(item.vat) || 0), 0),
      income_taxable: manualIncome.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
      // Receipt Vouchers: amount is taxable, tax_value is stored
      receipt_vat: receiptVouchers.reduce((sum, item) => sum + (Number(item.tax_value) || 0), 0),
      receipt_taxable: receiptVouchers.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    };

    // 4. Calculate Input Tax (Expenses/Purchases)
    const inputTax = {
      // Monthly Expenses: amount is gross, tax_value is stored
      expense_vat: monthlyExpenses.reduce((sum, item) => sum + (Number(item.tax_value) || 0), 0),
      expense_taxable: monthlyExpenses.reduce((sum, item) => {
        const gross = Number(item.amount) || 0;
        const tax = Number(item.tax_value) || 0;
        return sum + (gross - tax);
      }, 0),
      // Payment Vouchers: amount is taxable, tax_value is stored
      payment_vat: (paymentVouchers || []).reduce((sum, item) => sum + (Number(item.tax_value) || 0), 0),
      payment_taxable: (paymentVouchers || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
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


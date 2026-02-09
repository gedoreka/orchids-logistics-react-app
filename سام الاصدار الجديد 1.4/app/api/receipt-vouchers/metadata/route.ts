import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const companyId = searchParams.get("company_id");

  if (!companyId) {
    return NextResponse.json({ error: "company_id required" }, { status: 400 });
  }

  try {
    const accounts = await query<any>(
      "SELECT id, account_code, account_name FROM accounts WHERE company_id = ? ORDER BY account_code",
      [companyId]
    );

    const costCenters = await query<any>(
      "SELECT id, center_code, center_name FROM cost_centers WHERE company_id = ? ORDER BY center_code",
      [companyId]
    );

    const maxReceiptData = await query<any>(
      `SELECT receipt_number FROM receipt_vouchers WHERE company_id = ? ORDER BY id DESC LIMIT 1`,
      [companyId]
    );

    let nextNumber = 1;
    if (maxReceiptData && maxReceiptData.length > 0 && maxReceiptData[0].receipt_number) {
      const match = maxReceiptData[0].receipt_number.match(/\d+/);
      if (match) nextNumber = parseInt(match[0]) + 1;
    }
    const receiptNumber = "RCV" + String(nextNumber).padStart(5, "0");

    const vouchers = await query<any>(
      `SELECT
        id,
        receipt_number,
        receipt_date,
        received_from,
        branch_code,
        branch_name,
        payment_method,
        account_name,
        account_code AS debit_account_code,
        debit_cost_center_code AS debit_cost_center,
        credit_account_code,
        credit_cost_center_code AS credit_cost_center,
        amount,
        tax_percent AS tax_rate,
        tax_value,
        total_amount,
        document_number,
        bank_name,
        document_date,
        description,
        notes,
        created_at
      FROM receipt_vouchers
      WHERE company_id = ?
      ORDER BY created_at DESC`,
      [companyId]
    );

    return NextResponse.json({
      accounts: accounts || [],
      costCenters: costCenters || [],
      receiptNumber,
      vouchers: vouchers || [],
      totalVouchers: vouchers?.length || 0,
    });
  } catch (error) {
    console.error("Error fetching receipt vouchers metadata:", error);
    return NextResponse.json(
      { error: "Failed to fetch metadata" },
      { status: 500 }
    );
  }
}

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

    // Get the max voucher number from MySQL
    const maxVoucherData = await query<any>(
      `SELECT voucher_number FROM payment_vouchers WHERE company_id = ? ORDER BY id DESC LIMIT 1`,
      [companyId]
    );

    let nextNumber = 1;
    if (maxVoucherData && maxVoucherData.length > 0 && maxVoucherData[0].voucher_number) {
      const match = maxVoucherData[0].voucher_number.match(/\d+/);
      if (match) nextNumber = parseInt(match[0]) + 1;
    }
    const voucherNumber = "PV" + String(nextNumber).padStart(5, "0");

    // Get vouchers list from MySQL
    const vouchers = await query<any>(
      `SELECT * FROM payment_vouchers WHERE company_id = ? ORDER BY created_at DESC`,
      [companyId]
    );

    return NextResponse.json({
      accounts: accounts || [],
      costCenters: costCenters || [],
      voucherNumber,
      vouchers: vouchers || [],
      totalVouchers: vouchers?.length || 0,
    });
  } catch (error) {
    console.error("Error fetching payment vouchers metadata:", error);
    return NextResponse.json(
      { error: "Failed to fetch metadata" },
      { status: 500 }
    );
  }
}

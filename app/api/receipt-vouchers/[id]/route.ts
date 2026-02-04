import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const vouchers = await query<any>(
      `SELECT * FROM receipt_vouchers WHERE id = ?`,
      [id]
    );

    if (!vouchers || vouchers.length === 0) {
      return NextResponse.json(
        { error: "Voucher not found" },
        { status: 404 }
      );
    }

    const voucher = vouchers[0];

    const companyData = await query<any>(
      `SELECT id, name, commercial_number, vat_number, country, region, district, street, postal_code, short_address, logo_path, stamp_path, digital_seal_path FROM companies WHERE id = ?`,
      [voucher.company_id]
    );

    const company = companyData?.[0] || {};

    return NextResponse.json({
      voucher,
      company,
    });
  } catch (error) {
    console.error("Error fetching receipt voucher:", error);
    return NextResponse.json(
      { error: "Failed to fetch voucher" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const searchParams = request.nextUrl.searchParams;
  const companyId = searchParams.get("company_id") || "1";

  try {
    await query(
      `DELETE FROM receipt_vouchers WHERE id = ? AND company_id = ?`,
      [id, companyId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting receipt voucher:", error);
    return NextResponse.json(
      { error: "Failed to delete voucher" },
      { status: 500 }
    );
  }
}

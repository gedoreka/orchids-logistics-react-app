import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { query } from "@/lib/db";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const searchParams = request.nextUrl.searchParams;
  const companyId = searchParams.get("company_id") || "1";

    try {
      // First fetch the voucher to get its company_id
      const { data: voucher, error } = await supabase
        .from("receipt_vouchers")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !voucher) {
        return NextResponse.json(
          { error: "Voucher not found" },
          { status: 404 }
        );
      }

      // Fetch company data based on the voucher's company_id
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
    const { error } = await supabase
      .from("receipt_vouchers")
      .delete()
      .eq("id", id)
      .eq("company_id", companyId);

    if (error) {
      return NextResponse.json(
        { error: "Failed to delete voucher" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting receipt voucher:", error);
    return NextResponse.json(
      { error: "Failed to delete voucher" },
      { status: 500 }
    );
  }
}

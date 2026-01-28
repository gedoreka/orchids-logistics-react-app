import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    const { data: maxIdData } = await supabase
      .from("payment_vouchers")
      .select("voucher_number")
      .eq("company_id", companyId)
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

    let nextNumber = 1;
    if (maxIdData?.voucher_number) {
      const match = maxIdData.voucher_number.match(/\d+/);
      if (match) nextNumber = parseInt(match[0]) + 1;
    }
    const voucherNumber = "PV" + String(nextNumber).padStart(5, "0");

    const { data: vouchers, count } = await supabase
      .from("payment_vouchers")
      .select("*", { count: "exact" })
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    return NextResponse.json({
      accounts: accounts || [],
      costCenters: costCenters || [],
      voucherNumber,
      vouchers: vouchers || [],
      totalVouchers: count || 0,
    });
  } catch (error) {
    console.error("Error fetching payment vouchers metadata:", error);
    return NextResponse.json(
      { error: "Failed to fetch metadata" },
      { status: 500 }
    );
  }
}

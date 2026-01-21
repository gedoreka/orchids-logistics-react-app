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
    const { data: income, error } = await supabase
      .from("manual_income")
      .select("*")
      .eq("id", id)
      .eq("company_id", companyId)
      .single();

    if (error || !income) {
      return NextResponse.json(
        { error: "Income record not found" },
        { status: 404 }
      );
    }

    const companyData = await query<any>(
      `SELECT id, name, commercial_number, vat_number, country, region, district, street, postal_code, short_address, logo_path, stamp_path, digital_seal_path FROM companies WHERE id = ?`,
      [companyId]
    );

    const company = companyData?.[0] || {};

    return NextResponse.json({
      income,
      company,
    });
  } catch (error) {
    console.error("Error fetching income:", error);
    return NextResponse.json(
      { error: "Failed to fetch income" },
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
      .from("manual_income")
      .delete()
      .eq("id", id)
      .eq("company_id", companyId);

    if (error) {
      return NextResponse.json(
        { error: "Failed to delete income" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting income:", error);
    return NextResponse.json(
      { error: "Failed to delete income" },
      { status: 500 }
    );
  }
}

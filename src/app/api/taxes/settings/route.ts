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

    if (!companyId) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("tax_settings")
      .select("*")
      .eq("company_id", parseInt(companyId))
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows found"

    // If no settings exist, return default settings
    if (!data) {
      return NextResponse.json({
        success: true,
        settings: {
          tax_calculation_status: true,
          tax_included: false,
          tax_on_packaging: false,
          order_module_tax: false,
          parcel_module_tax: false,
          vendor_tax: false
        }
      });
    }

    return NextResponse.json({ success: true, settings: data });
  } catch (error) {
    console.error("Error fetching tax settings:", error);
    return NextResponse.json({ error: "Failed to fetch tax settings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      company_id, 
      tax_calculation_status,
      tax_included,
      tax_on_packaging,
      order_module_tax,
      parcel_module_tax,
      vendor_tax
    } = body;

    if (!company_id) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("tax_settings")
      .upsert({
        company_id: parseInt(company_id),
        tax_calculation_status,
        tax_included,
        tax_on_packaging,
        order_module_tax,
        parcel_module_tax,
        vendor_tax,
        updated_at: new Date().toISOString()
      }, { onConflict: 'company_id' })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, settings: data });
  } catch (error) {
    console.error("Error saving tax settings:", error);
    return NextResponse.json({ error: "Failed to save tax settings" }, { status: 500 });
  }
}

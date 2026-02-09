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

    const cid = parseInt(companyId);

    // Fetch tax types and settings in parallel
    const [typesRes, settingsRes] = await Promise.all([
      supabase.from("tax_types").select("*").eq("company_id", cid).order("created_at", { ascending: false }),
      supabase.from("tax_settings").select("*").eq("company_id", cid).single()
    ]);

    if (typesRes.error) throw typesRes.error;

    const taxTypes = typesRes.data || [];
    const settings = settingsRes.data || {
      tax_calculation_status: true,
      tax_included: false,
      tax_on_packaging: false,
      order_module_tax: false,
      parcel_module_tax: false,
      vendor_tax: false
    };

    // Compute stats
    const activeCount = taxTypes.filter((t: any) => t.status === "active").length;
    const inactiveCount = taxTypes.filter((t: any) => t.status !== "active").length;
    const defaultTax = taxTypes.find((t: any) => t.is_default);
    const avgRate = taxTypes.length > 0 ? taxTypes.reduce((sum: number, t: any) => sum + (parseFloat(t.tax_rate) || 0), 0) / taxTypes.length : 0;

    return NextResponse.json({
      success: true,
      tax_types: taxTypes,
      settings,
      stats: {
        totalTypes: taxTypes.length,
        activeCount,
        inactiveCount,
        defaultRate: defaultTax ? parseFloat(defaultTax.tax_rate) : 15,
        avgRate: Math.round(avgRate * 100) / 100
      }
    });
  } catch (error) {
    console.error("Error fetching tax types:", error);
    return NextResponse.json({ error: "Failed to fetch tax types" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      company_id, 
      tax_code, 
      name_ar, 
      name_en, 
      description, 
      tax_rate, 
      is_default, 
      apply_to, 
      status 
    } = body;

    if (!company_id || !tax_code || !name_ar || tax_rate === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("tax_types")
      .insert({
        company_id: parseInt(company_id),
        tax_code,
        name_ar,
        name_en,
        description,
        tax_rate: parseFloat(tax_rate),
        is_default: !!is_default,
        apply_to: apply_to || 'all',
        status: status || 'active'
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: "رمز الضريبة موجود مسبقاً" }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, tax_type: data });
  } catch (error) {
    console.error("Error creating tax type:", error);
    return NextResponse.json({ error: "Failed to create tax type" }, { status: 500 });
  }
}

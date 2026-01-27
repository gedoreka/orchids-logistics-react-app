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
      .from("tax_types")
      .select("*")
      .eq("company_id", parseInt(companyId))
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, tax_types: data });
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

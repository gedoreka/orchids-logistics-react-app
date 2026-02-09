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
    const status = searchParams.get("status");
    const year = searchParams.get("year");
    const quarter = searchParams.get("quarter");

    if (!companyId) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 });
    }

    let query = supabase
      .from("tax_declarations")
      .select("*")
      .eq("company_id", parseInt(companyId))
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    if (year) {
      query = query.eq("period_year", parseInt(year));
    }
    if (quarter) {
      query = query.eq("period_quarter", parseInt(quarter));
    }

    const { data, error } = await query;
    if (error) throw error;

    const declarations = data || [];

    // Compute stats
    const totalNetTax = declarations.reduce((s: number, d: any) => s + (Number(d.net_tax_payable) || 0), 0);
    const totalOutputTax = declarations.reduce((s: number, d: any) => s + (Number(d.total_output_tax) || 0), 0);
    const totalInputTax = declarations.reduce((s: number, d: any) => s + (Number(d.total_input_tax) || 0), 0);
    const draftCount = declarations.filter((d: any) => d.status === "draft").length;
    const submittedCount = declarations.filter((d: any) => d.status === "submitted").length;
    const completedCount = declarations.filter((d: any) => d.status === "completed").length;

    return NextResponse.json({
      success: true,
      declarations,
      stats: {
        totalNetTax,
        totalOutputTax,
        totalInputTax,
        totalCount: declarations.length,
        draftCount,
        submittedCount,
        completedCount,
      },
    });
  } catch (error) {
    console.error("Error fetching tax declarations:", error);
    return NextResponse.json({ error: "Failed to fetch tax declarations" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      company_id,
      period_year,
      period_quarter,
      start_date,
      end_date,
      status,
      total_sales_taxable,
      total_output_tax,
      total_purchases_taxable,
      total_input_tax,
      net_tax_payable,
    } = body;

    if (!company_id || !period_year || !period_quarter) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("tax_declarations")
      .insert({
        company_id: parseInt(company_id),
        period_year,
        period_quarter,
        start_date,
        end_date,
        status: status || "draft",
        total_sales_taxable: total_sales_taxable || 0,
        total_output_tax: total_output_tax || 0,
        total_purchases_taxable: total_purchases_taxable || 0,
        total_input_tax: total_input_tax || 0,
        net_tax_payable: net_tax_payable || 0,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, declaration: data });
  } catch (error) {
    console.error("Error creating tax declaration:", error);
    return NextResponse.json({ error: "Failed to create tax declaration" }, { status: 500 });
  }
}

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
      .from("ecommerce_stores")
      .select("*")
      .eq("company_id", parseInt(companyId))
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, stores: data });
  } catch (error) {
    console.error("Error fetching stores:", error);
    return NextResponse.json({ error: "Failed to fetch stores" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_id, store_name, phone_number, notes } = body;

    if (!company_id || !store_name) {
      return NextResponse.json({ error: "Company ID and store name required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("ecommerce_stores")
      .insert({
        company_id: parseInt(company_id),
        store_name,
        phone_number,
        notes,
        status: "active"
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, store: data });
  } catch (error) {
    console.error("Error creating store:", error);
    return NextResponse.json({ error: "Failed to create store" }, { status: 500 });
  }
}

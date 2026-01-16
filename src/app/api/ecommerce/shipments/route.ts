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

    if (!companyId) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 });
    }

    let query = supabase
      .from("individual_shipments")
      .select("*")
      .eq("company_id", parseInt(companyId))
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, shipments: data });
  } catch (error) {
    console.error("Error fetching shipments:", error);
    return NextResponse.json({ error: "Failed to fetch shipments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      company_id, 
      shipment_type,
      sender_name, 
      sender_phone, 
      sender_address,
      recipient_name,
      recipient_phone,
      recipient_address,
      package_description,
      package_weight,
      shipping_cost,
      payment_method,
      captain_name,
      notes
    } = body;

    if (!company_id || !sender_name || !sender_phone || !recipient_name || !recipient_phone) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    const orderNumber = `SHP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const { data, error } = await supabase
      .from("individual_shipments")
      .insert({
        company_id: parseInt(company_id),
        order_number: orderNumber,
        shipment_type: shipment_type || "طرود",
        sender_name,
        sender_phone,
        sender_address,
        recipient_name,
        recipient_phone,
        recipient_address,
        package_description,
        package_weight: parseFloat(package_weight) || 0,
        shipping_cost: parseFloat(shipping_cost) || 0,
        payment_method: payment_method || "نقدي",
        captain_name,
        notes,
        status: "pending"
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, shipment: data, order_number: orderNumber });
  } catch (error) {
    console.error("Error creating shipment:", error);
    return NextResponse.json({ error: "Failed to create shipment" }, { status: 500 });
  }
}

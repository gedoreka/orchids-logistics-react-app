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
      .from("personal_shipments")
      .select("*, ecommerce_captains(name, phone)")
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
      sender_name, 
      sender_phone, 
      sender_address,
      receiver_name,
      receiver_phone,
      receiver_address,
      shipment_type,
      distance_km,
      delivery_fee,
      additional_charge,
      tips,
      payment_method,
      notes
    } = body;

    if (!company_id || !sender_name || !receiver_name) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    const total_fee = (parseFloat(delivery_fee) || 0) + (parseFloat(additional_charge) || 0) + (parseFloat(tips) || 0);

    const { data, error } = await supabase
      .from("personal_shipments")
      .insert({
        company_id: parseInt(company_id),
        order_number: `SHP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sender_name,
        sender_phone,
        sender_address,
        receiver_name,
        receiver_phone,
        receiver_address,
        shipment_type: shipment_type || "عادي",
        distance_km: parseFloat(distance_km) || 0,
        delivery_fee: parseFloat(delivery_fee) || 0,
        additional_charge: parseFloat(additional_charge) || 0,
        tips: parseFloat(tips) || 0,
        total_fee,
        payment_method: payment_method || "نقدي",
        payment_status: "غير مدفوع",
        status: "قيد الانتظار",
        notes
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, shipment: data });
  } catch (error) {
    console.error("Error creating shipment:", error);
    return NextResponse.json({ error: "Failed to create shipment" }, { status: 500 });
  }
}

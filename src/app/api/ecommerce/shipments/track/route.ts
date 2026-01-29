import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get("order_number");
    const phone = searchParams.get("phone");

    if (!orderNumber && !phone) {
      return NextResponse.json({ error: "Order number or phone required" }, { status: 400 });
    }

    let query = supabase
      .from("individual_shipments")
      .select("*");

    if (orderNumber) {
      query = query.eq("order_number", orderNumber);
    } else if (phone) {
      query = query.or(`sender_phone.eq.${phone},recipient_phone.eq.${phone}`);
    }

    const { data, error } = await query;

    if (error) throw error;

    if (!data || data.length === 0) {
      return NextResponse.json({ success: false, message: "Shipment not found" });
    }

    return NextResponse.json({ success: true, shipment: data[0], shipments: data });
  } catch (error) {
    console.error("Error tracking shipment:", error);
    return NextResponse.json({ error: "Failed to track shipment" }, { status: 500 });
  }
}

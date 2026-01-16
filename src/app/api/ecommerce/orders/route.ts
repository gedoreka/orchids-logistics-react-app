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
    const month = searchParams.get("month");
    const day = searchParams.get("day");
    const date = searchParams.get("date");
    const status = searchParams.get("status");

    if (!companyId) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 });
    }

    let query = supabase
      .from("ecommerce_orders")
      .select("*, ecommerce_stores(store_name)")
      .eq("company_id", parseInt(companyId))
      .order("created_at", { ascending: false });

    if (date) {
      query = query.eq("order_date", date);
    } else if (month) {
      const startDate = `${month}-01`;
      const endDate = new Date(parseInt(month.split("-")[0]), parseInt(month.split("-")[1]), 0).toISOString().split("T")[0];
      query = query.gte("order_date", startDate).lte("order_date", endDate);
    }

    if (day && month && !date) {
      const dayDate = `${month}-${day.padStart(2, "0")}`;
      query = query.eq("order_date", dayDate);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, orders: data });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_id, orders } = body;

    if (!company_id || !orders || !Array.isArray(orders)) {
      return NextResponse.json({ error: "Company ID and orders array required" }, { status: 400 });
    }

    const ordersToInsert = orders.map((order: any) => ({
      company_id: parseInt(company_id),
      order_number: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      store: order.store,
      recipient_name: order.recipient_name,
      phone: order.phone,
      address: order.address,
      captain: order.captain,
      order_value: parseFloat(order.order_value) || 0,
      payment_method: order.payment_method || "نقدي",
      status: "جديد",
      payment_status: "غير مدفوع",
      notes: order.notes,
      order_date: order.order_date || new Date().toISOString().split("T")[0]
    }));

    const { data, error } = await supabase
      .from("ecommerce_orders")
      .insert(ordersToInsert)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, orders: data });
  } catch (error) {
    console.error("Error creating orders:", error);
    return NextResponse.json({ error: "Failed to create orders" }, { status: 500 });
  }
}

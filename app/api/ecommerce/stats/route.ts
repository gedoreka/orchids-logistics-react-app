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

    const today = new Date().toISOString().split("T")[0];
    const currentMonth = today.substring(0, 7);

    const [ordersResult, storesResult, shipmentsResult, captainsResult] = await Promise.all([
      supabase
        .from("ecommerce_orders")
        .select("id, order_value, status, order_date")
        .eq("company_id", parseInt(companyId)),
      supabase
        .from("ecommerce_stores")
        .select("id")
        .eq("company_id", parseInt(companyId)),
      supabase
        .from("personal_shipments")
        .select("id, total_fee, status")
        .eq("company_id", parseInt(companyId)),
      supabase
        .from("ecommerce_captains")
        .select("id, status")
        .eq("company_id", parseInt(companyId))
    ]);

    const orders = ordersResult.data || [];
    const stores = storesResult.data || [];
    const shipments = shipmentsResult.data || [];
    const captains = captainsResult.data || [];

    const totalOrders = orders.length;
    const totalOrdersValue = orders.reduce((sum: number, o: any) => sum + (parseFloat(o.order_value) || 0), 0);
    const todayOrders = orders.filter((o: any) => o.order_date === today).length;
    const monthlyOrders = orders.filter((o: any) => o.order_date?.startsWith(currentMonth)).length;

    const pendingOrders = orders.filter((o: any) => o.status === "جديد" || o.status === "قيد الانتظار").length;
    const confirmedOrders = orders.filter((o: any) => o.status === "مؤكد").length;
    const deliveredOrders = orders.filter((o: any) => o.status === "تم التوصيل").length;

    const totalShipments = shipments.length;
    const totalShipmentsValue = shipments.reduce((sum: number, s: any) => sum + (parseFloat(s.total_fee) || 0), 0);
    const pendingShipments = shipments.filter((s: any) => s.status === "قيد الانتظار").length;
    const deliveredShipments = shipments.filter((s: any) => s.status === "تم التوصيل").length;

    const totalStores = stores.length;
    const totalCaptains = captains.length;
    const activeCaptains = captains.filter((c: any) => c.status === "متاح").length;

    return NextResponse.json({
      success: true,
      stats: {
        orders: {
          total: totalOrders,
          totalValue: totalOrdersValue,
          today: todayOrders,
          monthly: monthlyOrders,
          pending: pendingOrders,
          confirmed: confirmedOrders,
          delivered: deliveredOrders
        },
        shipments: {
          total: totalShipments,
          totalValue: totalShipmentsValue,
          pending: pendingShipments,
          delivered: deliveredShipments
        },
        stores: {
          total: totalStores
        },
        captains: {
          total: totalCaptains,
          active: activeCaptains
        }
      }
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

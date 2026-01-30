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

    const { data: shipments, error } = await supabase
      .from("individual_shipments")
      .select("status")
      .eq("company_id", parseInt(companyId));

    if (error) throw error;

    const stats = {
      total: shipments?.length || 0,
      pending: shipments?.filter(s => s.status === "pending").length || 0,
      inProgress: shipments?.filter(s => s.status === "in_progress" || s.status === "قيد التوصيل").length || 0,
      delivered: shipments?.filter(s => s.status === "delivered" || s.status === "تم التسليم").length || 0,
    };

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ success: true, stats: { total: 0, pending: 0, inProgress: 0, delivered: 0 } });
  }
}

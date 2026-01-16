import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const updateData: any = { ...body, updated_at: new Date().toISOString() };
    
    if (body.delivery_fee !== undefined || body.additional_charge !== undefined || body.tips !== undefined) {
      const delivery_fee = parseFloat(body.delivery_fee) || 0;
      const additional_charge = parseFloat(body.additional_charge) || 0;
      const tips = parseFloat(body.tips) || 0;
      updateData.total_fee = delivery_fee + additional_charge + tips;
    }

    const { data, error } = await supabase
      .from("personal_shipments")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, shipment: data });
  } catch (error) {
    console.error("Error updating shipment:", error);
    return NextResponse.json({ error: "Failed to update shipment" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { error } = await supabase
      .from("personal_shipments")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Shipment deleted successfully" });
  } catch (error) {
    console.error("Error deleting shipment:", error);
    return NextResponse.json({ error: "Failed to delete shipment" }, { status: 500 });
  }
}

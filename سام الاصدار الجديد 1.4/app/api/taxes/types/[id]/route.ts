import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      tax_code, 
      name_ar, 
      name_en, 
      description, 
      tax_rate, 
      is_default, 
      apply_to, 
      status 
    } = body;

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (tax_code !== undefined) updateData.tax_code = tax_code;
    if (name_ar !== undefined) updateData.name_ar = name_ar;
    if (name_en !== undefined) updateData.name_en = name_en;
    if (description !== undefined) updateData.description = description;
    if (tax_rate !== undefined) updateData.tax_rate = parseFloat(tax_rate);
    if (is_default !== undefined) updateData.is_default = is_default;
    if (apply_to !== undefined) updateData.apply_to = apply_to;
    if (status !== undefined) updateData.status = status;

    const { data, error } = await supabase
      .from("tax_types")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, tax_type: data });
  } catch (error) {
    console.error("Error updating tax type:", error);
    return NextResponse.json({ error: "Failed to update tax type" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from("tax_types")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Tax type deleted successfully" });
  } catch (error) {
    console.error("Error deleting tax type:", error);
    return NextResponse.json({ error: "Failed to delete tax type" }, { status: 500 });
  }
}

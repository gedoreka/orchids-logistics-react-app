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

    const { data, error } = await supabase
      .from("tax_types")
      .update({
        tax_code,
        name_ar,
        name_en,
        description,
        tax_rate: tax_rate !== undefined ? parseFloat(tax_rate) : undefined,
        is_default,
        apply_to,
        status,
        updated_at: new Date().toISOString()
      })
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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

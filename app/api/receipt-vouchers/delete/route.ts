import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const company_id = searchParams.get("company_id");

    if (!id || !company_id) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("receipt_vouchers")
      .delete()
      .eq("id", id)
      .eq("company_id", company_id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "تم حذف السند بنجاح" });
  } catch (error) {
    console.error("Error deleting receipt voucher:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete receipt voucher" },
      { status: 500 }
    );
  }
}

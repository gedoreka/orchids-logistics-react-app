import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

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

    await query(
      `DELETE FROM payment_vouchers WHERE id = ? AND company_id = ?`,
      [id, company_id]
    );

    return NextResponse.json({ success: true, message: "تم حذف سند الصرف بنجاح" });
  } catch (error) {
    console.error("Error deleting payment voucher:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete payment voucher" },
      { status: 500 }
    );
  }
}

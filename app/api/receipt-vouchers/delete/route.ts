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
      `DELETE FROM receipt_vouchers WHERE id = ? AND company_id = ?`,
      [id, company_id]
    );

    return NextResponse.json({ success: true, message: "تم حذف السند بنجاح" });
  } catch (error) {
    console.error("Error deleting receipt voucher:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete receipt voucher" },
      { status: 500 }
    );
  }
}

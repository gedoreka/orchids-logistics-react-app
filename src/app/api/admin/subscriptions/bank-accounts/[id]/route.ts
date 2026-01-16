import { NextRequest, NextResponse } from "next/server";
import { execute, query } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { bank_name, account_holder, account_number, iban, logo_path, is_active, sort_order } = body;

    await execute(`
      UPDATE admin_bank_accounts SET
        bank_name = ?,
        account_holder = ?,
        account_number = ?,
        iban = ?,
        logo_path = ?,
        is_active = ?,
        sort_order = ?
      WHERE id = ?
    `, [
      bank_name,
      account_holder,
      account_number || null,
      iban,
      logo_path || null,
      is_active !== undefined ? is_active : 1,
      sort_order || 0,
      params.id
    ]);

    return NextResponse.json({ success: true, message: "تم تحديث الحساب البنكي بنجاح" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await execute(`DELETE FROM admin_bank_accounts WHERE id = ?`, [params.id]);
    return NextResponse.json({ success: true, message: "تم حذف الحساب البنكي بنجاح" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

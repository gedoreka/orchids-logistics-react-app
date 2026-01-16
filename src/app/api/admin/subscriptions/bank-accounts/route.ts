import { NextRequest, NextResponse } from "next/server";
import { execute, query } from "@/lib/db";

export async function GET() {
  try {
    const accounts = await query(`
      SELECT * FROM admin_bank_accounts 
      ORDER BY sort_order ASC, id ASC
    `);

    return NextResponse.json({ success: true, accounts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bank_name, account_holder, account_number, iban, logo_path, is_active, sort_order } = body;

    const result = await execute(`
      INSERT INTO admin_bank_accounts (bank_name, account_holder, account_number, iban, logo_path, is_active, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      bank_name,
      account_holder,
      account_number || null,
      iban,
      logo_path || null,
      is_active !== undefined ? is_active : 1,
      sort_order || 0
    ]);

    return NextResponse.json({ 
      success: true, 
      id: result.insertId,
      message: "تم إضافة الحساب البنكي بنجاح" 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

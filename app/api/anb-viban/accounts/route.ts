import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");
    if (!companyId) {
      return NextResponse.json({ error: "company_id مطلوب" }, { status: 400 });
    }

    const rows = await query<any>(
      `SELECT * FROM anb_virtual_accounts WHERE company_id = ? ORDER BY created_at DESC`,
      [companyId]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching virtual accounts:", error);
    return NextResponse.json({ error: "فشل في جلب الحسابات" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_id, account_name, account_name_en, notes } = body;

    if (!company_id || !account_name) {
      return NextResponse.json({ error: "company_id و account_name مطلوبة" }, { status: 400 });
    }

    // Get settings to find master IBAN
    const settingsRows = await query<any>(
      `SELECT master_iban, client_id, client_secret, api_base_url, is_sandbox FROM anb_viban_settings WHERE company_id = ? AND is_active = 1`,
      [company_id]
    );

    if (settingsRows.length === 0) {
      return NextResponse.json({ error: "يجب إعداد ربط ANB أولاً" }, { status: 400 });
    }

    const settings = settingsRows[0];

    // Generate internal reference
    const referenceId = `VIBAN-${company_id}-${Date.now().toString(36).toUpperCase()}`;

    // Insert locally first (VIBAN will be assigned when ANB API is connected)
    const result = await execute(
      `INSERT INTO anb_virtual_accounts 
       (company_id, account_name, account_name_en, reference_id, master_iban, status, notes)
       VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
      [company_id, account_name, account_name_en || null, referenceId, settings.master_iban, notes || null]
    );

    const insertId = (result as any).insertId;

    // TODO: When ANB VIBAN API is activated, call:
    // POST {api_base_url}/virtual-iban-management/create
    // with OAuth token from POST {api_base_url}/auth/token
    // Response will contain the actual VIBAN number
    // Then: UPDATE anb_virtual_accounts SET viban = ?, status = 'active', anb_response = ? WHERE id = ?

    const newAccount = await query<any>(
      `SELECT * FROM anb_virtual_accounts WHERE id = ?`,
      [insertId]
    );

    return NextResponse.json({
      success: true,
      message: "تم إنشاء الحساب. بانتظار تعيين رقم الآيبان من ANB",
      account: newAccount[0]
    });
  } catch (error) {
    console.error("Error creating virtual account:", error);
    return NextResponse.json({ error: "فشل في إنشاء الحساب" }, { status: 500 });
  }
}

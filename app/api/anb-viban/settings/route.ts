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
      `SELECT id, company_id, master_iban, master_account_name, client_id,
              CASE WHEN client_secret IS NOT NULL AND client_secret != '' THEN '********' ELSE '' END as client_secret_masked,
              api_base_url, is_active, is_sandbox, auto_reconcile, created_at, updated_at
       FROM anb_viban_settings WHERE company_id = ?`,
      [companyId]
    );

    return NextResponse.json(rows[0] || null);
  } catch (error) {
    console.error("Error fetching VIBAN settings:", error);
    return NextResponse.json({ error: "فشل في جلب الإعدادات" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      company_id, master_iban,
      client_id, client_secret, api_base_url,
      is_sandbox, auto_reconcile
    } = body;

    if (!company_id || !master_iban) {
      return NextResponse.json({ error: "company_id و master_iban مطلوبة" }, { status: 400 });
    }

    const existing = await query<any>(
      `SELECT id FROM anb_viban_settings WHERE company_id = ?`,
      [company_id]
    );

    if (existing.length > 0) {
      const updates: string[] = [];
      const params: any[] = [];

      updates.push("master_iban = ?"); params.push(master_iban);
      updates.push("api_base_url = ?"); params.push(api_base_url || "https://api.anb.com.sa");
      updates.push("is_active = ?"); params.push(1);
      updates.push("is_sandbox = ?"); params.push(is_sandbox !== undefined ? is_sandbox : 1);
      updates.push("auto_reconcile = ?"); params.push(auto_reconcile !== undefined ? auto_reconcile : 1);

      if (client_id) {
        updates.push("client_id = ?"); params.push(client_id);
      }
      if (client_secret && client_secret !== "********") {
        updates.push("client_secret = ?"); params.push(client_secret);
      }

      params.push(company_id);

      await execute(
        `UPDATE anb_viban_settings SET ${updates.join(", ")} WHERE company_id = ?`,
        params
      );

      const updatedRows = await query<any>(
        `SELECT id, company_id, master_iban, client_id,
                CASE WHEN client_secret IS NOT NULL AND client_secret != '' THEN '********' ELSE '' END as client_secret_masked,
                api_base_url, is_active, is_sandbox, auto_reconcile
         FROM anb_viban_settings WHERE company_id = ?`,
        [company_id]
      );

      return NextResponse.json({ success: true, message: "تم تحديث الإعدادات بنجاح", settings: updatedRows[0] });
    } else {
      await execute(
        `INSERT INTO anb_viban_settings (company_id, master_iban, client_id, client_secret, api_base_url, is_active, is_sandbox, auto_reconcile)
         VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
        [
          company_id, master_iban,
          client_id || null, client_secret || null,
          api_base_url || "https://api.anb.com.sa",
          is_sandbox !== undefined ? is_sandbox : 1,
          auto_reconcile !== undefined ? auto_reconcile : 1
        ]
      );

      const newRows = await query<any>(
        `SELECT id, company_id, master_iban, client_id,
                CASE WHEN client_secret IS NOT NULL AND client_secret != '' THEN '********' ELSE '' END as client_secret_masked,
                api_base_url, is_active, is_sandbox, auto_reconcile
         FROM anb_viban_settings WHERE company_id = ?`,
        [company_id]
      );

      return NextResponse.json({ success: true, message: "تم حفظ الإعدادات بنجاح", settings: newRows[0] });
    }
  } catch (error) {
    console.error("Error saving VIBAN settings:", error);
    return NextResponse.json({ error: "فشل في حفظ الإعدادات" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");
    if (!companyId) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 });
    }

    const rows = await query<any>(
      `SELECT id, company_id, client_id, 
              CASE WHEN client_secret IS NOT NULL AND client_secret != '' THEN '********' ELSE '' END as client_secret_masked,
              CASE WHEN mtls_certificate IS NOT NULL AND mtls_certificate != '' THEN 1 ELSE 0 END as has_certificate,
              CASE WHEN mtls_private_key IS NOT NULL AND mtls_private_key != '' THEN 1 ELSE 0 END as has_private_key,
              mol_establishment_id, national_unified_no, debit_account, bank_code, is_active, created_at, updated_at
       FROM anb_credentials WHERE company_id = ?`,
      [companyId]
    );

    return NextResponse.json(rows[0] || null);
  } catch (error) {
    console.error("Error fetching ANB credentials:", error);
    return NextResponse.json({ error: "Failed to fetch credentials" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      company_id, client_id, client_secret,
      mtls_certificate, mtls_private_key,
      mol_establishment_id, national_unified_no,
      debit_account, bank_code
    } = body;

    if (!company_id || !client_id || !client_secret) {
      return NextResponse.json({ error: "company_id, client_id, client_secret مطلوبة" }, { status: 400 });
    }

    // Upsert
    const existing = await query<any>(
      `SELECT id FROM anb_credentials WHERE company_id = ?`,
      [company_id]
    );

    if (existing.length > 0) {
      // Update - only update non-empty fields
      const updates: string[] = [];
      const params: any[] = [];

      updates.push("client_id = ?"); params.push(client_id);
      
      if (client_secret && client_secret !== '********') {
        updates.push("client_secret = ?"); params.push(client_secret);
      }
      if (mtls_certificate) {
        updates.push("mtls_certificate = ?"); params.push(mtls_certificate);
      }
      if (mtls_private_key) {
        updates.push("mtls_private_key = ?"); params.push(mtls_private_key);
      }

      updates.push("mol_establishment_id = ?"); params.push(mol_establishment_id || null);
      updates.push("national_unified_no = ?"); params.push(national_unified_no || null);
      updates.push("debit_account = ?"); params.push(debit_account || null);
      updates.push("bank_code = ?"); params.push(bank_code || '030');

      params.push(company_id);

      await execute(
        `UPDATE anb_credentials SET ${updates.join(", ")} WHERE company_id = ?`,
        params
      );

      return NextResponse.json({ success: true, message: "تم تحديث البيانات بنجاح" });
    } else {
      await execute(
        `INSERT INTO anb_credentials (company_id, client_id, client_secret, mtls_certificate, mtls_private_key, mol_establishment_id, national_unified_no, debit_account, bank_code)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [company_id, client_id, client_secret, mtls_certificate || null, mtls_private_key || null, mol_establishment_id || null, national_unified_no || null, debit_account || null, bank_code || '030']
      );

      return NextResponse.json({ success: true, message: "تم حفظ البيانات بنجاح" });
    }
  } catch (error) {
    console.error("Error saving ANB credentials:", error);
    return NextResponse.json({ error: "فشل في حفظ البيانات" }, { status: 500 });
  }
}

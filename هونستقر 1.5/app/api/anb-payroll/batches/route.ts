import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");
    if (!companyId) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 });
    }

    const batches = await query<any>(
      `SELECT b.*, COUNT(bi.id) as item_count
       FROM anb_payroll_batches b
       LEFT JOIN anb_payroll_batch_items bi ON b.id = bi.batch_id
       WHERE b.company_id = ?
       GROUP BY b.id
       ORDER BY b.id DESC`,
      [companyId]
    );

    return NextResponse.json(batches);
  } catch (error) {
    console.error("Error fetching ANB batches:", error);
    return NextResponse.json({ error: "Failed to fetch batches" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      company_id, payroll_month, debit_account,
      auto_wps, mol_establishment_id, national_unified_no,
      items = []
    } = body;

    if (!company_id || !payroll_month || !debit_account || items.length === 0) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة مع موظف واحد على الأقل" }, { status: 400 });
    }

    const totalAmount = items.reduce((sum: number, item: any) => sum + (parseFloat(item.net_salary) || 0), 0);
    const batchRef = `ANB-${company_id}-${payroll_month.replace(/[^0-9]/g, '')}-${Date.now().toString(36).toUpperCase()}`;

    const result = await execute(
      `INSERT INTO anb_payroll_batches (company_id, batch_reference, payroll_month, debit_account, total_amount, employee_count, auto_wps, mol_establishment_id, national_unified_no)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [company_id, batchRef, payroll_month, debit_account, totalAmount, items.length, auto_wps ? 1 : 0, mol_establishment_id || null, national_unified_no || null]
    );

    const batchId = result.insertId;

    // Insert items
    for (const item of items) {
      await execute(
        `INSERT INTO anb_payroll_batch_items (batch_id, employee_id, employee_name, identity_number, iban, bank_code, basic_salary, housing_allowance, other_earnings, deductions, net_salary)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [batchId, item.employee_id || null, item.employee_name, item.identity_number, item.iban, item.bank_code || '030', item.basic_salary || 0, item.housing_allowance || 0, item.other_earnings || 0, item.deductions || 0, item.net_salary || 0]
      );
    }

    return NextResponse.json({ success: true, batch_id: batchId, batch_reference: batchRef });
  } catch (error) {
    console.error("Error creating ANB batch:", error);
    return NextResponse.json({ error: "فشل في إنشاء الدفعة" }, { status: 500 });
  }
}

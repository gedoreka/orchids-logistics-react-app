import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      company_id,
      receipt_number,
      receipt_date,
      received_from,
      branch_code,
      branch_name,
      payment_method,
      account_name,
      debit_account_code,
      debit_cost_center,
      credit_account_code,
      credit_cost_center,
      amount,
      tax_group,
      tax_rate,
      tax_value,
      total_amount,
      document_number,
      bank_name,
      document_date,
      description,
      notes,
      created_by
    } = body;

    if (!company_id || !receipt_number) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let result;

    if (id) {
      await query(
        `UPDATE receipt_vouchers SET
          receipt_number = ?,
          receipt_date = ?,
          received_from = ?,
          branch_code = ?,
          branch_name = ?,
          payment_method = ?,
          account_name = ?,
          debit_account_code = ?,
          debit_cost_center = ?,
          credit_account_code = ?,
          credit_cost_center = ?,
          amount = ?,
          tax_group = ?,
          tax_rate = ?,
          tax_value = ?,
          total_amount = ?,
          document_number = ?,
          bank_name = ?,
          document_date = ?,
          description = ?,
          notes = ?
        WHERE id = ? AND company_id = ?`,
        [
          receipt_number,
          receipt_date || new Date().toISOString().split('T')[0],
          received_from || "",
          branch_code || "",
          branch_name || "",
          payment_method || "نقدي",
          account_name || "",
          debit_account_code || "",
          debit_cost_center || "",
          credit_account_code || "",
          credit_cost_center || "",
          parseFloat(amount) || 0,
          tax_group || "",
          parseFloat(tax_rate) || 0,
          parseFloat(tax_value) || 0,
          parseFloat(total_amount) || 0,
          document_number || "",
          bank_name || "",
          document_date || null,
          description || "",
          notes || "",
          id,
          company_id
        ]
      );
      result = { id };
    } else {
      const insertResult = await query<any>(
        `INSERT INTO receipt_vouchers (
          company_id,
          receipt_number,
          receipt_date,
          received_from,
          branch_code,
          branch_name,
          payment_method,
          account_name,
          debit_account_code,
          debit_cost_center,
          credit_account_code,
          credit_cost_center,
          amount,
          tax_group,
          tax_rate,
          tax_value,
          total_amount,
          document_number,
          bank_name,
          document_date,
          description,
          notes,
          created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          company_id,
          receipt_number,
          receipt_date || new Date().toISOString().split('T')[0],
          received_from || "",
          branch_code || "",
          branch_name || "",
          payment_method || "نقدي",
          account_name || "",
          debit_account_code || "",
          debit_cost_center || "",
          credit_account_code || "",
          credit_cost_center || "",
          parseFloat(amount) || 0,
          tax_group || "",
          parseFloat(tax_rate) || 0,
          parseFloat(tax_value) || 0,
          parseFloat(total_amount) || 0,
          document_number || "",
          bank_name || "",
          document_date || null,
          description || "",
          notes || "",
          created_by || "System"
        ]
      );
      result = { id: insertResult.insertId };
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: id ? "تم تحديث السند بنجاح" : "تم حفظ السند بنجاح"
    });
  } catch (error) {
    console.error("Error saving receipt voucher:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save receipt voucher" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      company_id,
      voucher_number,
      voucher_date,
      payee_name,
      branch_code,
      branch_name,
      payment_method,
      account_code,
      account_name,
      debit_cost_center_code,
      debit_cost_center_name,
      credit_account_code,
      credit_account_name,
      credit_cost_center_code,
      credit_cost_center_name,
      amount,
      tax_label,
      tax_percent,
      tax_value,
      total_amount,
      document_number,
      document_date,
      bank_name,
      description,
      notes
    } = body;

    if (!company_id || !voucher_number || !payee_name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let result;

    if (id) {
      // Update existing voucher
      await query(
        `UPDATE payment_vouchers SET
          voucher_number = ?,
          voucher_date = ?,
          payee_name = ?,
          branch_code = ?,
          branch_name = ?,
          payment_method = ?,
          account_code = ?,
          account_name = ?,
          debit_cost_center_code = ?,
          debit_cost_center_name = ?,
          credit_account_code = ?,
          credit_account_name = ?,
          credit_cost_center_code = ?,
          credit_cost_center_name = ?,
          amount = ?,
          tax_label = ?,
          tax_percent = ?,
          tax_value = ?,
          total_amount = ?,
          document_number = ?,
          document_date = ?,
          bank_name = ?,
          description = ?,
          notes = ?
        WHERE id = ? AND company_id = ?`,
        [
          voucher_number,
          voucher_date || new Date().toISOString().split('T')[0],
          payee_name,
          branch_code || "",
          branch_name || "",
          payment_method || "نقدي",
          account_code || "",
          account_name || "",
          debit_cost_center_code || "",
          debit_cost_center_name || "",
          credit_account_code || "",
          credit_account_name || "",
          credit_cost_center_code || "",
          credit_cost_center_name || "",
          parseFloat(amount) || 0,
          tax_label || "",
          parseFloat(tax_percent) || 0,
          parseFloat(tax_value) || 0,
          parseFloat(total_amount) || 0,
          document_number || "",
          document_date || null,
          bank_name || "",
          description || "",
          notes || "",
          id,
          company_id
        ]
      );
      result = { id };
    } else {
      // Insert new voucher
      const insertResult = await query<any>(
        `INSERT INTO payment_vouchers (
          company_id,
          voucher_number,
          voucher_date,
          payee_name,
          branch_code,
          branch_name,
          payment_method,
          account_code,
          account_name,
          debit_cost_center_code,
          debit_cost_center_name,
          credit_account_code,
          credit_account_name,
          credit_cost_center_code,
          credit_cost_center_name,
          amount,
          tax_label,
          tax_percent,
          tax_value,
          total_amount,
          document_number,
          document_date,
          bank_name,
          description,
          notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          company_id,
          voucher_number,
          voucher_date || new Date().toISOString().split('T')[0],
          payee_name,
          branch_code || "",
          branch_name || "",
          payment_method || "نقدي",
          account_code || "",
          account_name || "",
          debit_cost_center_code || "",
          debit_cost_center_name || "",
          credit_account_code || "",
          credit_account_name || "",
          credit_cost_center_code || "",
          credit_cost_center_name || "",
          parseFloat(amount) || 0,
          tax_label || "",
          parseFloat(tax_percent) || 0,
          parseFloat(tax_value) || 0,
          parseFloat(total_amount) || 0,
          document_number || "",
          document_date || null,
          bank_name || "",
          description || "",
          notes || ""
        ]
      );
      result = { id: insertResult.insertId };
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: id ? "تم تحديث سند الصرف بنجاح" : "تم حفظ سند الصرف بنجاح"
    });
  } catch (error) {
    console.error("Error saving payment voucher:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save payment voucher" },
      { status: 500 }
    );
  }
}

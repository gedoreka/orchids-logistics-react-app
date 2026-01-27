import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      company_id,
      voucher_number,
      voucher_date,
      payee_name,
      payee_type,
      payee_id,
      branch_code,
      branch_name,
      payment_method,
      debit_account_code,
      debit_account_name,
      debit_cost_center,
      credit_account_code,
      credit_account_name,
      credit_cost_center,
      amount,
      tax_rate,
      tax_value,
      total_amount,
      currency,
      document_number,
      document_date,
      bank_name,
      check_number,
      payment_purpose,
      description,
      notes,
      status,
      prepared_by,
      approved_by,
      created_by
    } = body;

    if (!company_id || !voucher_number || !payee_name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const voucherData = {
      company_id: parseInt(company_id),
      voucher_number,
      voucher_date: voucher_date || new Date().toISOString().split('T')[0],
      payee_name,
      payee_type: payee_type || "individual",
      payee_id: payee_id || "",
      branch_code: branch_code || "",
      branch_name: branch_name || "",
      payment_method: payment_method || "نقدي",
      debit_account_code: debit_account_code || "",
      debit_account_name: debit_account_name || "",
      debit_cost_center: debit_cost_center || "",
      credit_account_code: credit_account_code || "",
      credit_account_name: credit_account_name || "",
      credit_cost_center: credit_cost_center || "",
      amount: parseFloat(amount) || 0,
      tax_rate: parseFloat(tax_rate) || 0,
      tax_value: parseFloat(tax_value) || 0,
      total_amount: parseFloat(total_amount) || 0,
      currency: currency || "SAR",
      document_number: document_number || "",
      document_date: document_date || null,
      bank_name: bank_name || "",
      check_number: check_number || "",
      payment_purpose: payment_purpose || "",
      description: description || "",
      notes: notes || "",
      status: status || "draft",
      prepared_by: prepared_by || "",
      approved_by: approved_by || "",
      created_by: created_by || "System",
      updated_at: new Date().toISOString()
    };

    let result;

    if (id) {
      const { data, error } = await supabase
        .from("payment_vouchers")
        .update(voucherData)
        .eq("id", id)
        .eq("company_id", company_id)
        .select();

      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from("payment_vouchers")
        .insert(voucherData)
        .select();

      if (error) throw error;
      result = data;
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

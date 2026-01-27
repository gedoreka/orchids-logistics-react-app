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

    const voucherData = {
      company_id: parseInt(company_id),
      receipt_number,
      receipt_date: receipt_date || new Date().toISOString().split('T')[0],
      received_from: received_from || "",
      branch_code: branch_code || "",
      branch_name: branch_name || "",
      payment_method: payment_method || "نقدي",
      account_name: account_name || "",
      debit_account_code: debit_account_code || "",
      debit_cost_center: debit_cost_center || "",
      credit_account_code: credit_account_code || "",
      credit_cost_center: credit_cost_center || "",
      amount: parseFloat(amount) || 0,
      tax_group: tax_group || "",
      tax_rate: parseFloat(tax_rate) || 0,
      tax_value: parseFloat(tax_value) || 0,
      total_amount: parseFloat(total_amount) || 0,
      document_number: document_number || "",
      bank_name: bank_name || "",
      document_date: document_date || null,
      description: description || "",
      notes: notes || "",
      created_by: created_by || "System",
      updated_at: new Date().toISOString()
    };

    let result;

    if (id) {
      const { data, error } = await supabase
        .from("receipt_vouchers")
        .update(voucherData)
        .eq("id", id)
        .eq("company_id", company_id)
        .select();

      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from("receipt_vouchers")
        .insert(voucherData)
        .select();

      if (error) throw error;
      result = data;
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

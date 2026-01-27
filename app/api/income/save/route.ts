import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const companyId = parseInt(formData.get("company_id") as string);
    const userName = formData.get("user_name") as string;
    const incomeType = formData.get("income_type") as string;
    const incomeDate = formData.get("income_date") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const vat = parseFloat(formData.get("vat") as string);
    const total = parseFloat(formData.get("total") as string);
    const description = formData.get("description") as string;
    const accountId = formData.get("account_id") as string;
    const costCenterId = formData.get("cost_center_id") as string;
    const paymentMethod = formData.get("payment_method") as string;
    const receiptFile = formData.get("receipt_file") as File | null;

    const { data: maxIdData } = await supabase
      .from("manual_income")
      .select("id")
      .eq("company_id", companyId)
      .order("id", { ascending: false })
      .limit(1)
      .single();

    const nextId = (maxIdData?.id || 0) + 1;
    const operationNumber = "INC" + String(nextId).padStart(5, "0");

    let uploadedFileName: string | null = null;

    if (receiptFile && receiptFile.size > 0) {
      const ext = receiptFile.name.split('.').pop();
      uploadedFileName = `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${ext}`;
      
      const arrayBuffer = await receiptFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from("income-receipts")
        .upload(uploadedFileName, buffer, {
          contentType: receiptFile.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
      }
    }

    const insertData: Record<string, unknown> = {
      operation_number: operationNumber,
      company_id: companyId,
      income_type: incomeType,
      income_date: incomeDate,
      amount: amount,
      vat: vat,
      total: total,
      description: description,
      payment_method: paymentMethod,
      uploaded_file: uploadedFileName,
      created_by: userName,
    };

    if (accountId && accountId !== '' && accountId !== 'null') {
      insertData.account_id = parseInt(accountId);
    }
    if (costCenterId && costCenterId !== '' && costCenterId !== 'null') {
      insertData.cost_center_id = parseInt(costCenterId);
    }

    const { data, error } = await supabase.from("manual_income").insert(insertData).select();

    if (error) {
      console.error("Insert error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      operationNumber: operationNumber,
      data: data,
    });
  } catch (error) {
    console.error("Error saving income:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save income" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const company_id = formData.get("company_id") as string;
    const user_id = formData.get("user_id") as string;
    const month_reference = formData.get("month_reference") as string;
    const voucher_number = formData.get("voucher_number") as string;
    const deductions_json = formData.get("deductions_json") as string;

    if (!company_id || !month_reference || !deductions_json) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const deductions = JSON.parse(deductions_json);
    let successCount = 0;

    const { supabase } = await import('@/lib/supabase');

    for (const deduction of deductions) {
      const {
        id: rowId,
        expense_date,
        deduction_type,
        amount,
        employee_id,
        employee_name,
        employee_iqama,
        account_id,
        cost_center_id,
        description,
        status
      } = deduction;

      if (!amount || !expense_date) continue;

        let attachmentPath = null;
        const file = formData.get(`file_${rowId}`);
        if (file && file instanceof File && file.size > 0) {
          // Sanitize filename to avoid Supabase storage errors with Arabic characters
          const ext = file.name.split('.').pop() || 'file';
          const sanitizedBase = file.name
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\x00-\x7F]/g, "")
            .replace(/\s+/g, "_")
            .replace(/[^a-zA-Z0-9._-]/g, "")
            .replace(/_{2,}/g, "_")
            .replace(/^_+|_+$/g, "");
          
          const safeName = sanitizedBase || `file_${Date.now()}`;
          const fileName = `${Date.now()}_${safeName}.${ext}`;

          const { data, error } = await supabase.storage
            .from("expenses")
            .upload(`uploads/${fileName}`, file);
          
          if (!error && data) {
            attachmentPath = data.path;
          } else if (error) {
            console.error(`Storage upload error for row ${rowId}:`, error);
          }
        }

      await query(
        `INSERT INTO monthly_deductions 
        (company_id, month_reference, voucher_number, deduction_type, expense_date, 
         employee_id, employee_name, employee_iqama, amount, account_id, 
         cost_center_id, description, status, attachment) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          company_id, 
          month_reference, 
          voucher_number, 
          deduction_type, 
          expense_date, 
          employee_id || null, 
          employee_name, 
          employee_iqama, 
          amount, 
          account_id || null, 
          cost_center_id || null, 
          description, 
          status || 'pending',
          attachmentPath
        ]
      );
      successCount++;
    }

    return NextResponse.json({ 
      success: true, 
      message: `${successCount} deductions saved successfully`,
      saved_count: successCount
    });
  } catch (error) {
    console.error("Error saving deductions:", error);
    return NextResponse.json({ error: "Failed to save deductions" }, { status: 500 });
  }
}

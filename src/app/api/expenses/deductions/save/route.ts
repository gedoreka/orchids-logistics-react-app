import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      company_id, 
      user_id, 
      month_reference, 
      voucher_number, 
      deductions 
    } = body;

    if (!company_id || !month_reference || !deductions || !Array.isArray(deductions)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let successCount = 0;

    for (const deduction of deductions) {
      const {
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

      await query(
        `INSERT INTO monthly_deductions 
        (company_id, month_reference, voucher_number, deduction_type, expense_date, 
         employee_id, employee_name, employee_iqama, amount, account_id, 
         cost_center_id, description, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
          status || 'pending'
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

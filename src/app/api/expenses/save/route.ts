import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const companyId = formData.get("company_id") as string;
    const userId = formData.get("user_id") as string;

    if (!companyId) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 });
    }

    const mainTypes = formData.getAll("main_type[]") as string[];
    const expenseDates = formData.getAll("expense_date[]") as string[];
    const expenseTypes = formData.getAll("expense_type[]") as string[];
    const amounts = formData.getAll("amount[]") as string[];
    const employeeIqamas = formData.getAll("employee_iqama[]") as string[];
    const employeeNames = formData.getAll("employee_name[]") as string[];
    const employeeIds = formData.getAll("employee_id[]") as string[];
    const accountCodes = formData.getAll("account_code[]") as string[];
    const costCenterCodes = formData.getAll("cost_center_code[]") as string[];
    const descriptions = formData.getAll("description[]") as string[];
    const taxValues = formData.getAll("tax_value[]") as string[];
    const netAmounts = formData.getAll("net_amount[]") as string[];
    const attachments = formData.getAll("attachment[]") as any[];

    const count = expenseDates.length;
    let savedCount = 0;

    const { data: accounts } = await supabase
      .from("accounts")
      .select("id, account_code")
      .eq("company_id", companyId);

    const { data: costCenters } = await supabase
      .from("cost_centers")
      .select("id, center_code")
      .eq("company_id", companyId);

    const accountMap = new Map((accounts || []).map(a => [a.account_code, a.id]));
    const centerMap = new Map((costCenters || []).map(c => [c.center_code, c.id]));

    for (let i = 0; i < count; i++) {
      const mainType = mainTypes[i];
      const date = expenseDates[i];
      const type = expenseTypes[i];
      const amount = parseFloat(amounts[i] || "0");
      
      if (!date || !type || amount <= 0) continue;

      const iqama = employeeIqamas[i] || "";
      const name = employeeNames[i] || "";
      const empId = parseInt(employeeIds[i] || "0");
      const accountCode = accountCodes[i] || "";
      const centerCode = costCenterCodes[i] || "";
      const desc = descriptions[i] || "";
      const tax = parseFloat(taxValues[i] || "0");
      const net = parseFloat(netAmounts[i] || amounts[i] || "0");
      const attachment = attachments[i];

      let attachmentPath = "";
      if (attachment && attachment instanceof File && attachment.size > 0) {
        const fileName = `${Date.now()}_${attachment.name}`;
        const { data, error } = await supabase.storage
          .from("expenses")
          .upload(`uploads/${fileName}`, attachment);
        
        if (!error && data) {
          attachmentPath = data.path;
        }
      }

      const accId = accountMap.get(accountCode) || null;
      const centerId = centerMap.get(centerCode) || null;
      const monthRef = date.substring(0, 7);

      const { data: insertedExpense, error: insertError } = await supabase
        .from("monthly_expenses")
        .insert({
          company_id: parseInt(companyId),
          expense_date: date,
          expense_type: type,
          amount: amount,
          description: desc,
          employee_iqama: iqama,
          employee_name: name,
          account_code: accountCode,
          cost_center_code: centerCode,
          tax_value: tax,
          net_amount: net,
          month_reference: monthRef,
          account_id: accId,
          cost_center_id: centerId,
          attachment: attachmentPath
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error inserting expense:", insertError);
        continue;
      }

      if (insertedExpense) {
        savedCount++;

        if (accId) {
          await supabase.from("journal_entries").insert({
            entry_date: date,
            account_id: accId,
            description: desc || `Expense: ${type}`,
            debit: net,
            credit: 0,
            company_id: parseInt(companyId)
          });
        }

        if (mainType === 'iqama' && empId > 0) {
          const renewalAmounts = [162, 163, 2425];
          if (renewalAmounts.includes(Math.floor(amount))) {
            const newExpiry = new Date();
            newExpiry.setMonth(newExpiry.getMonth() + 3);
            await supabase
              .from("employees")
              .update({ iqama_expiry: newExpiry.toISOString().split('T')[0] })
              .eq("id", empId);
          }
        }

        if ((mainType === 'traffic' || type === "مخالفات مرورية") && empId > 0) {
          await supabase.from("employee_violations").insert({
            employee_id: empId,
            violation_type: 'traffic',
            violation_date: date,
            violation_amount: amount,
            deducted_amount: amount,
            remaining_amount: 0,
            status: 'deducted',
            violation_description: desc || `مخالفة مرورية - ${name}`
          });
        }

        if (mainType === 'advances' && empId > 0) {
          await supabase.from("monthly_deductions").insert({
            company_id: parseInt(companyId),
            amount: amount,
            month_reference: monthRef,
            employee_name: name,
            deduction_type: 'advance',
            expense_date: date
          });
        }
      }
    }

    return NextResponse.json({ success: true, savedCount });
  } catch (error) {
    console.error("Error saving expenses:", error);
    return NextResponse.json({ error: "Failed to save expenses" }, { status: 500 });
  }
}

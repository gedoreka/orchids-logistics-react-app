import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query, execute } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { logSubUserActivity } from "@/lib/activity";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const companyId = formData.get("company_id") as string;
    const userId = formData.get("user_id") as string;
    const month = formData.get("month") as string;

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

    // Check if sub-user for logging
    const cookieStore = await cookies();
    const authSession = cookieStore.get("auth_session")?.value;
    const session = authSession ? JSON.parse(authSession) : null;
    const isSubUser = session?.user_type === "sub_user";

    // Fetch account and cost center IDs for mapping
    const accounts = await query<{ id: number; account_code: string }>(
      "SELECT id, account_code FROM accounts WHERE company_id = ?",
      [companyId]
    );
    const costCenters = await query<{ id: number; center_code: string }>(
      "SELECT id, center_code FROM cost_centers WHERE company_id = ?",
      [companyId]
    );

    const accountMap = new Map(accounts.map(a => [a.account_code, a.id]));
    const centerMap = new Map(costCenters.map(c => [c.center_code, c.id]));

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
            // Sanitize filename strictly to ASCII to avoid Supabase/S3 storage errors
            const ext = attachment.name.split('.').pop() || 'file';
            const sanitizedBase = attachment.name
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^\x00-\x7F]/g, "")
              .replace(/\s+/g, "_")
              .replace(/[^a-zA-Z0-9._-]/g, "")
              .replace(/_{2,}/g, "_")
              .replace(/^_+|_+$/g, "");
          
          const safeName = sanitizedBase || `file_${Date.now()}`;
          const fileName = `${Date.now()}_${safeName}`;
          // Make sure extension is preserved if not already in safeName
          const finalFileName = fileName.endsWith(`.${ext}`) ? fileName : `${fileName}.${ext}`;
          
          const { data, error: uploadError } = await supabase.storage
            .from("expenses")
            .upload(`uploads/${finalFileName}`, attachment);
        
        if (uploadError) {
          console.error("Supabase upload error:", uploadError);
        }

        if (!uploadError && data) {
          attachmentPath = data.path;
        }
      }

      const accId = accountMap.get(accountCode) || null;
      const centerId = centerMap.get(centerCode) || null;
      const monthRef = date.substring(0, 7); // YYYY-MM

      // 1. Insert into monthly_expenses
      const result = await execute(
        `INSERT INTO monthly_expenses (
          company_id, expense_date, expense_type, amount, description,
          employee_iqama, employee_name, account_code, cost_center_code,
          tax_value, net_amount, month_reference, account_id, cost_center_id, attachment
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          companyId, date, type, amount, desc,
          iqama, name, accountCode, centerCode,
          tax, net, monthRef, accId, centerId, attachmentPath
        ]
      );

        if (result.insertId) {
          savedCount++;

          // --- INTEGRATED ACCOUNTING: Record Journal Entry in Supabase ---
          if (accId) {
            try {
              const { recordJournalEntry } = await import("@/lib/accounting");
              const journalLines = [
                {
                  account_id: accId,
                  cost_center_id: centerId || undefined,
                  description: desc || `Expense: ${type}`,
                  debit: net,
                  credit: 0
                },
                {
                  account_id: 1, // الصندوق (Default Credit for Expenses)
                  description: `سداد مصروف: ${type}`,
                  debit: 0,
                  credit: net
                }
              ];

              await recordJournalEntry({
                entry_date: date,
                entry_number: `EXP-${result.insertId}`,
                description: desc || `مصروف: ${type}`,
                company_id: parseInt(companyId),
                created_by: "System",
                lines: journalLines
              });
            } catch (accError) {
              console.error("Error recording accounting entry for expense:", accError);
            }
          }
          // -----------------------------------------------------------

          // 3. Business Logic based on mainType
        
        // A. Iqama Renewal Logic
        if (mainType === 'iqama' && empId > 0) {
          const renewalAmounts = [162, 163, 2425];
          if (renewalAmounts.includes(Math.floor(amount))) {
            // Renew for 3 months from current date
            await execute(
              `UPDATE employees 
               SET iqama_expiry = CURRENT_DATE + INTERVAL '3 months' 
               WHERE id = ?`,
              [empId]
            );
          }
        }

        // B. Traffic Violation Logic
        if ((mainType === 'traffic' || type === "مخالفات مرورية") && empId > 0) {
          await execute(
            `INSERT INTO employee_violations 
             (employee_id, violation_type, violation_date, violation_amount, 
              deducted_amount, remaining_amount, status, violation_description) 
             VALUES (?, 'traffic', ?, ?, ?, 0, 'deducted', ?)`,
            [empId, date, amount, amount, desc || `مخالفة مرورية - ${name}`]
          );
        }

        // C. Loan (Advances) Logic
        if (mainType === 'advances' && empId > 0) {
          await execute(
            `INSERT INTO monthly_deductions 
             (company_id, amount, month_reference, employee_name, deduction_type, deduction_date) 
             VALUES (?, ?, ?, ?, 'advance', ?)`,
            [companyId, amount, monthRef, name, date]
          );
        }
      }
    }

    if (isSubUser && savedCount > 0) {
      await logSubUserActivity({
        subUserId: parseInt(userId),
        companyId: parseInt(companyId),
        actionType: "EXPENSES_CREATED",
        actionDescription: `تم تسجيل عدد (${savedCount}) من المنصرفات/الاستقطاعات لشهر: ${month}`,
        metadata: { count: savedCount, month }
      });
    }

    return NextResponse.json({ success: true, savedCount });
  } catch (error) {
    console.error("Error saving expenses:", error);
    return NextResponse.json({ error: "Failed to save expenses" }, { status: 500 });
  }
}

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

    console.log("API: Received expense data - companyId:", companyId, "month:", month);

    if (!companyId) {
      return NextResponse.json({ success: false, error: "Company ID required" }, { status: 400 });
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
    console.log("API: Processing", count, "expense rows");
    
    if (count === 0) {
      return NextResponse.json({ success: false, error: "No expenses to save" }, { status: 400 });
    }

    let savedCount = 0;

    // Check if sub-user for logging
    const cookieStore = await cookies();
    const authSession = cookieStore.get("auth_session")?.value;
    const session = authSession ? JSON.parse(authSession) : null;
    const isSubUser = session?.user_type === "sub_user";

    // Fetch account and cost center data for mapping
    // NOTE: The form's HierarchicalSearchableSelect sends item.id (database ID),
    // so we build maps from ID → record to resolve the actual codes
    let accountByIdMap = new Map<string, { id: number; account_code: string }>();
    let accountByCodeMap = new Map<string, { id: number; account_code: string }>();
    let centerByIdMap = new Map<string, { id: number; center_code: string }>();
    let centerByCodeMap = new Map<string, { id: number; center_code: string }>();
    
    try {
      const accounts = await query<{ id: number; account_code: string }>(
        "SELECT id, account_code FROM accounts WHERE company_id = ?",
        [companyId]
      );
      accounts.forEach(a => {
        accountByIdMap.set(String(a.id), a);
        accountByCodeMap.set(a.account_code, a);
      });
      console.log("API: Loaded", accounts.length, "accounts");
    } catch (accError) {
      console.warn("Warning: Could not load accounts", accError);
    }

    try {
      const costCenters = await query<{ id: number; center_code: string }>(
        "SELECT id, center_code FROM cost_centers WHERE company_id = ?",
        [companyId]
      );
      costCenters.forEach(c => {
        centerByIdMap.set(String(c.id), c);
        centerByCodeMap.set(c.center_code, c);
      });
      console.log("API: Loaded", costCenters.length, "cost centers");
    } catch (ccError) {
      console.warn("Warning: Could not load cost centers", ccError);
    }

    for (let i = 0; i < count; i++) {
      try {
        const mainType = mainTypes[i];
        const date = expenseDates[i];
        const type = expenseTypes[i];
        const amount = parseFloat(amounts[i] || "0");
        
        if (!date || !type || amount <= 0) {
          console.log("API: Skipping row", i, "- invalid data");
          continue;
        }

        const iqama = employeeIqamas[i] || "";
        const name = employeeNames[i] || "";
        const empId = parseInt(employeeIds[i] || "0");
        const rawAccountVal = accountCodes[i] || "";
        const rawCenterVal = costCenterCodes[i] || "";
        const desc = descriptions[i] || "";
        const tax = parseFloat(taxValues[i] || "0");
        const net = parseFloat(netAmounts[i] || amounts[i] || "0");
        const attachment = attachments[i];

        // Resolve account: the form sends database ID, we need to find the actual code
        let resolvedAccount = accountByIdMap.get(rawAccountVal) || accountByCodeMap.get(rawAccountVal);
        const accountCode = resolvedAccount?.account_code || rawAccountVal;
        
        // Resolve cost center: the form sends database ID, we need to find the actual code
        let resolvedCenter = centerByIdMap.get(rawCenterVal) || centerByCodeMap.get(rawCenterVal);
        const centerCode = resolvedCenter?.center_code || rawCenterVal;

        let attachmentPath = "";
        if (attachment && attachment instanceof File && attachment.size > 0) {
          try {
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
            const finalFileName = fileName.endsWith(`.${ext}`) ? fileName : `${fileName}.${ext}`;
            
            const { data, error: uploadError } = await supabase.storage
              .from("expenses")
              .upload(`uploads/${finalFileName}`, attachment);
            
            if (uploadError) {
              console.warn("Supabase upload warning:", uploadError);
            } else if (data) {
              attachmentPath = data.path;
            }
          } catch (uploadErr) {
            console.warn("File upload error:", uploadErr);
          }
        }

        const accId = resolvedAccount?.id || null;
        const centerId = resolvedCenter?.id || null;
        const monthRef = date.substring(0, 7);

        // Insert into monthly_expenses with attachment path
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
            console.log("API: Saved expense row", i + 1, "with ID", result.insertId, attachmentPath ? "with attachment" : "no attachment");

            // --- Auto Journal Entry ---
            try {
              const { recordJournalEntry, generateNextEntryNumber, getDefaultAccounts, resolvePaymentAccount } = await import("@/lib/accounting");
              const defaults = await getDefaultAccounts(parseInt(companyId));
              const expenseAccountId = accId || defaults.admin_expenses;
              const cashAccountId = resolvePaymentAccount(defaults);

              if (expenseAccountId && cashAccountId) {
                const entryNumber = await generateNextEntryNumber(parseInt(companyId), "EXP");
                const lines = [
                  { account_id: expenseAccountId, debit: net, credit: 0, description: `مصروف: ${type} - ${desc}`, cost_center_id: centerId || undefined },
                  { account_id: cashAccountId, debit: 0, credit: net, description: `مصروف: ${type} - ${desc}` }
                ];

                if (tax > 0 && defaults.vat) {
                  lines[1].credit = amount;
                  lines.push({ account_id: defaults.vat, debit: tax, credit: 0, description: `ضريبة مدخلات - ${type}`, cost_center_id: undefined });
                }

                await recordJournalEntry({
                  entry_date: date,
                  entry_number: entryNumber,
                  description: `مصروف: ${type} - ${desc}`,
                  company_id: parseInt(companyId),
                  created_by: userId || "System",
                  source_type: "monthly_expense",
                  source_id: String(result.insertId),
                  lines
                });
              }
            } catch (accError) {
              console.error("Error creating auto journal entry for expense:", accError);
            }
          }
        } catch (rowError) {
          console.error("API: Error processing row", i, ":", rowError);
          // Continue processing other rows
        }
      }

    if (isSubUser && savedCount > 0) {
      try {
        await logSubUserActivity({
          subUserId: parseInt(userId),
          companyId: parseInt(companyId),
          actionType: "EXPENSES_CREATED",
          actionDescription: `تم تسجيل عدد (${savedCount}) من المنصرفات/الاستقطاعات لشهر: ${month}`,
          metadata: { count: savedCount, month }
        });
      } catch (activityError) {
        console.warn("Warning: Could not log activity", activityError);
      }
    }

    console.log("API: Saved total of", savedCount, "expenses");
    return NextResponse.json({ success: true, savedCount, message: `تم حفظ ${savedCount} منصروف بنجاح` });
  } catch (error) {
    console.error("Error saving expenses:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Full error details:", JSON.stringify(error));
    return NextResponse.json({ 
      success: false,
      error: "Failed to save expenses",
      message: `خطأ: ${errorMessage}`,
      details: errorMessage
    }, { status: 500 });
  }
}

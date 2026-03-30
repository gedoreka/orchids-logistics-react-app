import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { supabase } from "@/lib/supabase-client";

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

      // --- Auto Journal Entry for Payment Voucher ---
      const voucherId = id || result.id;
      const totalAmt = parseFloat(total_amount) || 0;
      if (totalAmt > 0) {
        try {
          const { recordJournalEntry, generateNextEntryNumber, getDefaultAccounts, deleteJournalEntriesBySource } = await import("@/lib/accounting");
          
          // Delete old entries if updating
          if (id) {
            await deleteJournalEntriesBySource(company_id, "payment_voucher", String(voucherId));
          }

          const defaults = await getDefaultAccounts(company_id);

          // Resolve debit account (expense)
          let debitAccountId: number | null = null;
          if (account_code) {
            const { data: accData } = await supabase.from("accounts").select("id").eq("company_id", company_id).eq("account_code", account_code).limit(1).single();
            if (accData) debitAccountId = accData.id;
          }
          if (!debitAccountId) debitAccountId = defaults.admin_expenses || null;

          // Resolve credit account (cash/bank)
          let creditAccountId: number | null = null;
          if (credit_account_code) {
            const { data: crData } = await supabase.from("accounts").select("id").eq("company_id", company_id).eq("account_code", credit_account_code).limit(1).single();
            if (crData) creditAccountId = crData.id;
          }
          if (!creditAccountId) {
            const method = (payment_method || "").toLowerCase();
            creditAccountId = (method.includes("بنك") || method.includes("تحويل")) ? defaults.bank : defaults.cash;
          }

          // Resolve cost centers
          let debitCostCenterId: number | undefined;
          if (debit_cost_center_code) {
            const { data: ccData } = await supabase.from("cost_centers").select("id").eq("company_id", company_id).eq("center_code", debit_cost_center_code).limit(1).single();
            if (ccData) debitCostCenterId = ccData.id;
          }

          if (debitAccountId && creditAccountId) {
            const entryNumber = await generateNextEntryNumber(company_id, "PV");
            const amt = parseFloat(amount) || 0;
            const taxAmt = parseFloat(tax_value) || 0;
            const lines: any[] = [
              { account_id: debitAccountId, debit: amt, credit: 0, description: `سند صرف ${voucher_number} - ${description || payee_name}`, cost_center_id: debitCostCenterId },
              { account_id: creditAccountId, debit: 0, credit: totalAmt, description: `سند صرف ${voucher_number} - ${description || payee_name}` }
            ];

            if (taxAmt > 0 && defaults.vat) {
              lines.push({ account_id: defaults.vat, debit: taxAmt, credit: 0, description: `ضريبة مدخلات سند صرف ${voucher_number}` });
            }

            await recordJournalEntry({
              entry_date: voucher_date || new Date().toISOString().split('T')[0],
              entry_number: entryNumber,
              description: `سند صرف ${voucher_number} - ${description || payee_name}`,
              company_id,
              created_by: "System",
              source_type: "payment_voucher",
              source_id: String(voucherId),
              lines
            });
          }
        } catch (accError) {
          console.error("Error creating auto journal entry for payment voucher:", accError);
        }
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

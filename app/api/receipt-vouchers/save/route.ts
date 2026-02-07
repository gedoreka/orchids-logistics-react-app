import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { supabase } from "@/lib/supabase-client";

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
      tax_rate,
      tax_value,
      total_amount,
      document_number,
      bank_name,
      document_date,
      description,
      notes,
    } = body;

    if (!company_id || !receipt_number) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let result;

    if (id) {
      await query(
        `UPDATE receipt_vouchers SET
          receipt_number = ?,
          receipt_date = ?,
          received_from = ?,
          branch_code = ?,
          branch_name = ?,
          payment_method = ?,
          account_name = ?,
          account_code = ?,
          debit_cost_center_name = ?,
          debit_cost_center_code = ?,
          credit_account_name = ?,
          credit_account_code = ?,
          credit_cost_center_name = ?,
          credit_cost_center_code = ?,
          amount = ?,
          tax_label = ?,
          tax_percent = ?,
          tax_value = ?,
          total_amount = ?,
          document_number = ?,
          bank_name = ?,
          document_date = ?,
          description = ?,
          notes = ?
        WHERE id = ? AND company_id = ?`,
        [
          receipt_number,
          receipt_date || new Date().toISOString().split("T")[0],
          received_from || "",
          branch_code || "",
          branch_name || "",
          payment_method || "نقدي",
          account_name || "",
          debit_account_code || "",
          debit_cost_center || "",
          debit_cost_center || "",
          "",
          credit_account_code || "",
          credit_cost_center || "",
          credit_cost_center || "",
          parseFloat(amount) || 0,
          "",
          parseFloat(tax_rate) || 0,
          parseFloat(tax_value) || 0,
          parseFloat(total_amount) || 0,
          document_number || "",
          bank_name || "",
          document_date || null,
          description || "",
          notes || "",
          id,
          company_id,
        ]
      );
      result = { id };
    } else {
      const insertResult = await query<any>(
        `INSERT INTO receipt_vouchers (
          company_id,
          receipt_number,
          receipt_date,
          received_from,
          branch_code,
          branch_name,
          payment_method,
          account_name,
          account_code,
          debit_cost_center_name,
          debit_cost_center_code,
          credit_account_name,
          credit_account_code,
          credit_cost_center_name,
          credit_cost_center_code,
          amount,
          tax_label,
          tax_percent,
          tax_value,
          total_amount,
          document_number,
          bank_name,
          document_date,
          description,
          notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          company_id,
          receipt_number,
          receipt_date || new Date().toISOString().split("T")[0],
          received_from || "",
          branch_code || "",
          branch_name || "",
          payment_method || "نقدي",
          account_name || "",
          debit_account_code || "",
          debit_cost_center || "",
          debit_cost_center || "",
          "",
          credit_account_code || "",
          credit_cost_center || "",
          credit_cost_center || "",
          parseFloat(amount) || 0,
          "",
          parseFloat(tax_rate) || 0,
          parseFloat(tax_value) || 0,
          parseFloat(total_amount) || 0,
          document_number || "",
          bank_name || "",
          document_date || null,
          description || "",
          notes || "",
        ]
      );
      result = { id: insertResult.insertId };
      }

      // --- Auto Journal Entry for Receipt Voucher ---
      const voucherId = id || result.id;
      const totalAmt = parseFloat(total_amount) || 0;
      if (totalAmt > 0) {
        try {
          const { recordJournalEntry, generateNextEntryNumber, getDefaultAccounts, deleteJournalEntriesBySource } = await import("@/lib/accounting");
          
          if (id) {
            await deleteJournalEntriesBySource(company_id, "receipt_voucher", String(voucherId));
          }

          const defaults = await getDefaultAccounts(company_id);

          // Debit: cash/bank (receiving money)
          let debitAccountId: number | null = null;
          if (debit_account_code) {
            const { data: accData } = await supabase.from("accounts").select("id").eq("company_id", company_id).eq("account_code", debit_account_code).limit(1).single();
            if (accData) debitAccountId = accData.id;
          }
          if (!debitAccountId) {
            const method = (payment_method || "").toLowerCase();
            debitAccountId = (method.includes("بنك") || method.includes("تحويل")) ? defaults.bank : defaults.cash;
          }

          // Credit: revenue/customer account
          let creditAccountId: number | null = null;
          if (credit_account_code) {
            const { data: crData } = await supabase.from("accounts").select("id").eq("company_id", company_id).eq("account_code", credit_account_code).limit(1).single();
            if (crData) creditAccountId = crData.id;
          }
          if (!creditAccountId) creditAccountId = defaults.other_revenue || defaults.customers || null;

          if (debitAccountId && creditAccountId) {
            const entryNumber = await generateNextEntryNumber(company_id, "RV");
            const amt = parseFloat(amount) || 0;
            const taxAmt = parseFloat(tax_value) || 0;
            const lines: any[] = [
              { account_id: debitAccountId, debit: totalAmt, credit: 0, description: `سند قبض ${receipt_number} - ${description || received_from}` },
              { account_id: creditAccountId, debit: 0, credit: amt, description: `سند قبض ${receipt_number} - ${description || received_from}` }
            ];

            if (taxAmt > 0 && defaults.vat) {
              lines.push({ account_id: defaults.vat, debit: 0, credit: taxAmt, description: `ضريبة مخرجات سند قبض ${receipt_number}` });
            }

            await recordJournalEntry({
              entry_date: receipt_date || new Date().toISOString().split('T')[0],
              entry_number: entryNumber,
              description: `سند قبض ${receipt_number} - ${description || received_from}`,
              company_id,
              created_by: "System",
              source_type: "receipt_voucher",
              source_id: String(voucherId),
              lines
            });
          }
        } catch (accError) {
          console.error("Error creating auto journal entry for receipt voucher:", accError);
        }
      }

      return NextResponse.json({
      success: true,
      data: result,
      message: id ? "تم تحديث السند بنجاح" : "تم حفظ السند بنجاح",
    });
  } catch (error) {
    console.error("Error saving receipt voucher:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save receipt voucher" },
      { status: 500 }
    );
  }
}

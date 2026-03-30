import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { supabase } from "@/lib/supabase-client";
import { recordJournalEntry, generateNextEntryNumber, getDefaultAccounts, resolvePaymentAccount } from "@/lib/accounting";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("auth_session");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const companyId = session.company_id;

    if (!companyId) {
      return NextResponse.json({ error: "Company ID not found" }, { status: 400 });
    }

    const defaults = await getDefaultAccounts(companyId);
    if (!defaults.cash) {
      return NextResponse.json({ error: "Default accounts not configured. Go to Settings > Default Accounts first." }, { status: 400 });
    }

    const results = {
      expenses: { migrated: 0, skipped: 0, errors: 0 },
      payrolls: { migrated: 0, skipped: 0, errors: 0 },
      invoices: { migrated: 0, skipped: 0, errors: 0 },
      income: { migrated: 0, skipped: 0, errors: 0 },
      payment_vouchers: { migrated: 0, skipped: 0, errors: 0 },
      receipt_vouchers: { migrated: 0, skipped: 0, errors: 0 },
      credit_notes: { migrated: 0, skipped: 0, errors: 0 },
    };

    // --- 1. Migrate Monthly Expenses ---
    try {
      const expenses = await query<any>(
        "SELECT id, expense_date, expense_type, amount, description, net_amount, tax_value, account_id, cost_center_id FROM monthly_expenses WHERE company_id = ?",
        [companyId]
      );

      for (const exp of expenses) {
        // Check if already migrated
        const { data: existing } = await supabase
          .from("journal_entries")
          .select("id")
          .eq("company_id", companyId)
          .eq("source_type", "monthly_expense")
          .eq("source_id", String(exp.id))
          .limit(1);

        if (existing && existing.length > 0) {
          results.expenses.skipped++;
          continue;
        }

        try {
          const net = parseFloat(exp.net_amount) || parseFloat(exp.amount) || 0;
          const tax = parseFloat(exp.tax_value) || 0;
          const expAccountId = exp.account_id || defaults.admin_expenses;
          const cashAccountId = defaults.cash;

          if (net <= 0 || !expAccountId || !cashAccountId) {
            results.expenses.skipped++;
            continue;
          }

          const entryNumber = await generateNextEntryNumber(companyId, "EXP");
          const lines: any[] = [
            { account_id: expAccountId, debit: net, credit: 0, description: `مصروف: ${exp.expense_type} - ${exp.description || ""}`, cost_center_id: exp.cost_center_id || undefined },
            { account_id: cashAccountId, debit: 0, credit: net, description: `مصروف: ${exp.expense_type}` }
          ];

          if (tax > 0 && defaults.vat) {
            lines[1].credit = parseFloat(exp.amount) || net;
            lines.push({ account_id: defaults.vat, debit: tax, credit: 0, description: `ضريبة مدخلات - ${exp.expense_type}` });
          }

          await recordJournalEntry({
            entry_date: exp.expense_date,
            entry_number: entryNumber,
            description: `مصروف: ${exp.expense_type} - ${exp.description || ""}`,
            company_id: companyId,
            created_by: "Migration",
            source_type: "monthly_expense",
            source_id: String(exp.id),
            lines
          });
          results.expenses.migrated++;
        } catch {
          results.expenses.errors++;
        }
      }
    } catch (e) {
      console.error("Error migrating expenses:", e);
    }

    // --- 2. Migrate Payrolls ---
    try {
      const payrolls = await query<any>(
        "SELECT id, payroll_month, total_amount, saved_by FROM salary_payrolls WHERE company_id = ? AND is_draft = 0 AND total_amount > 0",
        [companyId]
      );

      for (const p of payrolls) {
        const { data: existing } = await supabase
          .from("journal_entries")
          .select("id")
          .eq("company_id", companyId)
          .eq("source_type", "payroll")
          .eq("source_id", String(p.id))
          .limit(1);

        if (existing && existing.length > 0) {
          results.payrolls.skipped++;
          continue;
        }

        try {
          const salaryAccountId = defaults.salaries;
          const cashAccountId = defaults.cash;
          if (!salaryAccountId || !cashAccountId) { results.payrolls.skipped++; continue; }

          const entryNumber = await generateNextEntryNumber(companyId, "PAY");
          await recordJournalEntry({
            entry_date: `${p.payroll_month}-01`,
            entry_number: entryNumber,
            description: `رواتب شهر ${p.payroll_month}`,
            company_id: companyId,
            created_by: "Migration",
            source_type: "payroll",
            source_id: String(p.id),
            lines: [
              { account_id: salaryAccountId, debit: parseFloat(p.total_amount), credit: 0, description: `رواتب شهر ${p.payroll_month}` },
              { account_id: cashAccountId, debit: 0, credit: parseFloat(p.total_amount), description: `صرف رواتب شهر ${p.payroll_month}` }
            ]
          });
          results.payrolls.migrated++;
        } catch {
          results.payrolls.errors++;
        }
      }
    } catch (e) {
      console.error("Error migrating payrolls:", e);
    }

    // --- 3. Migrate Sales Invoices ---
    try {
      const invoices = await query<any>(
        "SELECT id, invoice_number, issue_date, total_amount, tax_amount, client_name FROM sales_invoices WHERE company_id = ?",
        [companyId]
      );

      for (const inv of invoices) {
        const { data: existing } = await supabase
          .from("journal_entries")
          .select("id")
          .eq("company_id", companyId)
          .eq("source_type", "sales_invoice")
          .eq("source_id", String(inv.id))
          .limit(1);

        if (existing && existing.length > 0) {
          results.invoices.skipped++;
          continue;
        }

        try {
          const totalWithVat = parseFloat(inv.total_amount) || 0;
          const totalVat = parseFloat(inv.tax_amount) || 0;
          if (totalWithVat <= 0) { results.invoices.skipped++; continue; }

          const customersAccId = defaults.customers || 3;
          const salesAccId = defaults.sales_revenue || 6;
          const vatAccId = defaults.vat || 25;

          const lines: any[] = [
            { account_id: customersAccId, debit: totalWithVat, credit: 0, description: `فاتورة مبيعات ${inv.invoice_number} - ${inv.client_name}` },
            { account_id: salesAccId, debit: 0, credit: totalWithVat - totalVat, description: `إيراد مبيعات فاتورة ${inv.invoice_number}` }
          ];

          if (totalVat > 0) {
            lines.push({ account_id: vatAccId, debit: 0, credit: totalVat, description: `ضريبة مخرجات فاتورة ${inv.invoice_number}` });
          }

          await recordJournalEntry({
            entry_date: inv.issue_date,
            entry_number: `INV-${inv.invoice_number}`,
            description: `فاتورة مبيعات رقم ${inv.invoice_number}`,
            company_id: companyId,
            created_by: "Migration",
            source_type: "sales_invoice",
            source_id: String(inv.id),
            lines
          });
          results.invoices.migrated++;
        } catch {
          results.invoices.errors++;
        }
      }
    } catch (e) {
      console.error("Error migrating invoices:", e);
    }

    // --- 4. Migrate Manual Income ---
    try {
      const { data: incomes } = await supabase
        .from("manual_income")
        .select("*")
        .eq("company_id", companyId);

      for (const inc of (incomes || [])) {
        const { data: existing } = await supabase
          .from("journal_entries")
          .select("id")
          .eq("company_id", companyId)
          .eq("source_type", "manual_income")
          .eq("source_id", inc.operation_number)
          .limit(1);

        if (existing && existing.length > 0) {
          results.income.skipped++;
          continue;
        }

        try {
          const total = parseFloat(inc.total) || 0;
          const amount = parseFloat(inc.amount) || 0;
          const vat = parseFloat(inc.vat) || 0;
          if (total <= 0) { results.income.skipped++; continue; }

          const revenueAccId = inc.account_id || defaults.other_revenue;
          const cashAccId = resolvePaymentAccount(defaults, inc.payment_method);
          if (!revenueAccId || !cashAccId) { results.income.skipped++; continue; }

          const entryNumber = await generateNextEntryNumber(companyId, "INC");
          const lines: any[] = [
            { account_id: cashAccId, debit: total, credit: 0, description: `إيراد: ${inc.income_type} - ${inc.description || ""}` },
            { account_id: revenueAccId, debit: 0, credit: amount, description: `إيراد: ${inc.income_type}`, cost_center_id: inc.cost_center_id || undefined }
          ];

          if (vat > 0 && defaults.vat) {
            lines.push({ account_id: defaults.vat, debit: 0, credit: vat, description: `ضريبة مخرجات - ${inc.income_type}` });
          }

          await recordJournalEntry({
            entry_date: inc.income_date,
            entry_number: entryNumber,
            description: `إيراد: ${inc.income_type} - ${inc.description || ""}`,
            company_id: companyId,
            created_by: "Migration",
            source_type: "manual_income",
            source_id: inc.operation_number,
            lines
          });
          results.income.migrated++;
        } catch {
          results.income.errors++;
        }
      }
    } catch (e) {
      console.error("Error migrating income:", e);
    }

    // --- 5. Migrate Payment Vouchers ---
    try {
      const pvs = await query<any>(
        "SELECT id, voucher_number, voucher_date, payee_name, amount, tax_value, total_amount, account_code, credit_account_code, payment_method, description FROM payment_vouchers WHERE company_id = ?",
        [companyId]
      );

      for (const pv of pvs) {
        const { data: existing } = await supabase
          .from("journal_entries")
          .select("id")
          .eq("company_id", companyId)
          .eq("source_type", "payment_voucher")
          .eq("source_id", String(pv.id))
          .limit(1);

        if (existing && existing.length > 0) {
          results.payment_vouchers.skipped++;
          continue;
        }

        try {
          const totalAmt = parseFloat(pv.total_amount) || 0;
          const amt = parseFloat(pv.amount) || 0;
          const taxAmt = parseFloat(pv.tax_value) || 0;
          if (totalAmt <= 0) { results.payment_vouchers.skipped++; continue; }

          let debitAccountId: number | null = null;
          if (pv.account_code) {
            const { data: accData } = await supabase.from("accounts").select("id").eq("company_id", companyId).eq("account_code", pv.account_code).limit(1).single();
            if (accData) debitAccountId = accData.id;
          }
          if (!debitAccountId) debitAccountId = defaults.admin_expenses || null;

          let creditAccountId: number | null = null;
          if (pv.credit_account_code) {
            const { data: crData } = await supabase.from("accounts").select("id").eq("company_id", companyId).eq("account_code", pv.credit_account_code).limit(1).single();
            if (crData) creditAccountId = crData.id;
          }
          if (!creditAccountId) {
            const method = (pv.payment_method || "").toLowerCase();
            creditAccountId = (method.includes("بنك") || method.includes("تحويل")) ? defaults.bank : defaults.cash;
          }

          if (!debitAccountId || !creditAccountId) { results.payment_vouchers.skipped++; continue; }

          const entryNumber = await generateNextEntryNumber(companyId, "PV");
          const lines: any[] = [
            { account_id: debitAccountId, debit: amt, credit: 0, description: `سند صرف ${pv.voucher_number} - ${pv.description || pv.payee_name}` },
            { account_id: creditAccountId, debit: 0, credit: totalAmt, description: `سند صرف ${pv.voucher_number}` }
          ];

          if (taxAmt > 0 && defaults.vat) {
            lines.push({ account_id: defaults.vat, debit: taxAmt, credit: 0, description: `ضريبة مدخلات سند صرف ${pv.voucher_number}` });
          }

          await recordJournalEntry({
            entry_date: pv.voucher_date || new Date().toISOString().split('T')[0],
            entry_number: entryNumber,
            description: `سند صرف ${pv.voucher_number} - ${pv.description || pv.payee_name}`,
            company_id: companyId,
            created_by: "Migration",
            source_type: "payment_voucher",
            source_id: String(pv.id),
            lines
          });
          results.payment_vouchers.migrated++;
        } catch {
          results.payment_vouchers.errors++;
        }
      }
    } catch (e) {
      console.error("Error migrating payment vouchers:", e);
    }

    // --- 6. Migrate Receipt Vouchers ---
    try {
      const rvs = await query<any>(
        "SELECT id, receipt_number, receipt_date, received_from, amount, tax_value, total_amount, account_code, credit_account_code, payment_method, description FROM receipt_vouchers WHERE company_id = ?",
        [companyId]
      );

      for (const rv of rvs) {
        const { data: existing } = await supabase
          .from("journal_entries")
          .select("id")
          .eq("company_id", companyId)
          .eq("source_type", "receipt_voucher")
          .eq("source_id", String(rv.id))
          .limit(1);

        if (existing && existing.length > 0) {
          results.receipt_vouchers.skipped++;
          continue;
        }

        try {
          const totalAmt = parseFloat(rv.total_amount) || 0;
          const amt = parseFloat(rv.amount) || 0;
          const taxAmt = parseFloat(rv.tax_value) || 0;
          if (totalAmt <= 0) { results.receipt_vouchers.skipped++; continue; }

          let debitAccountId: number | null = null;
          const method = (rv.payment_method || "").toLowerCase();
          if (rv.account_code) {
            const { data: accData } = await supabase.from("accounts").select("id").eq("company_id", companyId).eq("account_code", rv.account_code).limit(1).single();
            if (accData) debitAccountId = accData.id;
          }
          if (!debitAccountId) {
            debitAccountId = (method.includes("بنك") || method.includes("تحويل")) ? defaults.bank : defaults.cash;
          }

          let creditAccountId: number | null = null;
          if (rv.credit_account_code) {
            const { data: crData } = await supabase.from("accounts").select("id").eq("company_id", companyId).eq("account_code", rv.credit_account_code).limit(1).single();
            if (crData) creditAccountId = crData.id;
          }
          if (!creditAccountId) creditAccountId = defaults.other_revenue || defaults.customers || null;

          if (!debitAccountId || !creditAccountId) { results.receipt_vouchers.skipped++; continue; }

          const entryNumber = await generateNextEntryNumber(companyId, "RV");
          const lines: any[] = [
            { account_id: debitAccountId, debit: totalAmt, credit: 0, description: `سند قبض ${rv.receipt_number} - ${rv.description || rv.received_from}` },
            { account_id: creditAccountId, debit: 0, credit: amt, description: `سند قبض ${rv.receipt_number}` }
          ];

          if (taxAmt > 0 && defaults.vat) {
            lines.push({ account_id: defaults.vat, debit: 0, credit: taxAmt, description: `ضريبة مخرجات سند قبض ${rv.receipt_number}` });
          }

          await recordJournalEntry({
            entry_date: rv.receipt_date || new Date().toISOString().split('T')[0],
            entry_number: entryNumber,
            description: `سند قبض ${rv.receipt_number} - ${rv.description || rv.received_from}`,
            company_id: companyId,
            created_by: "Migration",
            source_type: "receipt_voucher",
            source_id: String(rv.id),
            lines
          });
          results.receipt_vouchers.migrated++;
        } catch {
          results.receipt_vouchers.errors++;
        }
      }
    } catch (e) {
      console.error("Error migrating receipt vouchers:", e);
    }

    // --- 7. Migrate Credit Notes ---
    try {
      const cns = await query<any>(
        "SELECT id, credit_note_number, invoice_number, total_before_vat, vat_amount, total_amount, created_at FROM credit_notes WHERE company_id = ? AND status = 'active'",
        [companyId]
      );

      for (const cn of cns) {
        const { data: existing } = await supabase
          .from("journal_entries")
          .select("id")
          .eq("company_id", companyId)
          .eq("source_type", "credit_note")
          .eq("source_id", String(cn.id))
          .limit(1);

        if (existing && existing.length > 0) {
          results.credit_notes.skipped++;
          continue;
        }

        try {
          const totalWithVat = parseFloat(cn.total_amount) || 0;
          const totalBeforeVat = parseFloat(cn.total_before_vat) || 0;
          const vatAmount = parseFloat(cn.vat_amount) || 0;
          if (totalWithVat <= 0) { results.credit_notes.skipped++; continue; }

          const customersAccId = defaults.customers || 3;
          const salesAccId = defaults.sales_revenue || 6;
          const vatAccId = defaults.vat || 25;

          const lines: any[] = [
            { account_id: salesAccId, debit: totalBeforeVat, credit: 0, description: `إشعار دائن ${cn.credit_note_number}` },
            { account_id: customersAccId, debit: 0, credit: totalWithVat, description: `إشعار دائن ${cn.credit_note_number}` }
          ];

          if (vatAmount > 0) {
            lines.push({ account_id: vatAccId, debit: vatAmount, credit: 0, description: `إلغاء ضريبة إشعار دائن ${cn.credit_note_number}` });
          }

          const entryDate = cn.created_at ? new Date(cn.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
          await recordJournalEntry({
            entry_date: entryDate,
            entry_number: `CRN-${cn.credit_note_number}`,
            description: `إشعار دائن ${cn.credit_note_number} للفاتورة ${cn.invoice_number}`,
            company_id: companyId,
            created_by: "Migration",
            source_type: "credit_note",
            source_id: String(cn.id),
            lines
          });
          results.credit_notes.migrated++;
        } catch {
          results.credit_notes.errors++;
        }
      }
    } catch (e) {
      console.error("Error migrating credit notes:", e);
    }

    return NextResponse.json({
      success: true,
      message: "تمت عملية الترحيل بنجاح",
      results
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json({ error: "Migration failed" }, { status: 500 });
  }
}

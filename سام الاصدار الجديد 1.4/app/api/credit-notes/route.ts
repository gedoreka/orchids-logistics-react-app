import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query, execute } from "@/lib/db";

async function getCompanyId(userId: number) {
  const users = await query<any>("SELECT company_id FROM users WHERE id = ?", [userId]);
  return users[0]?.company_id;
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("auth_session");
    
    if (!sessionCookie) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }
    
    const session = JSON.parse(sessionCookie.value);
    let companyId = session.company_id;
    
    if (!companyId && session.user_id) {
      companyId = await getCompanyId(session.user_id);
    }

    if (!companyId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const creditNotes = await query<any>(`
      SELECT 
        cn.*,
        si.status as invoice_status
      FROM credit_notes cn
      LEFT JOIN sales_invoices si ON cn.invoice_id = si.id
      WHERE cn.company_id = ?
      ORDER BY cn.id DESC
    `, [companyId]);

    return NextResponse.json({ credit_notes: creditNotes });
  } catch (error: any) {
    console.error("Error fetching credit notes:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("auth_session");
    
    if (!sessionCookie) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }
    
    const session = JSON.parse(sessionCookie.value);
    let companyId = session.company_id;
    const userId = session.user_id;
    
    if (!companyId && userId) {
      companyId = await getCompanyId(userId);
    }

    if (!companyId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await request.json();
    const {
      invoice_id,
      reason,
      total_with_vat
    } = body;

    if (!invoice_id || !reason || !total_with_vat) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    // Fetch invoice details
    const invoices = await query<any>(`
      SELECT *
      FROM sales_invoices
      WHERE id = ? AND company_id = ?
    `, [invoice_id, companyId]);

    const invoice = invoices[0];
    if (!invoice) {
      return NextResponse.json({ error: "الفاتورة غير موجودة" }, { status: 404 });
    }

    // Check available amount for credit note
    const issuedCreditNotes = await query<any>(`
      SELECT SUM(total_amount) as total_issued
      FROM credit_notes
      WHERE invoice_id = ? AND status = 'active'
    `, [invoice_id]);

    const totalIssued = parseFloat(issuedCreditNotes[0]?.total_issued || "0");
    const invoiceTotal = parseFloat(invoice.total_amount);
    const available = invoiceTotal - totalIssued;

    if (total_with_vat > available) {
      return NextResponse.json({ error: `المبلغ يتجاوز الحد المسموح. الحد الأقصى: ${available.toFixed(2)} ريال` }, { status: 400 });
    }

    // Generate credit note number
    const lastNotes = await query<any>(`
      SELECT credit_note_number 
      FROM credit_notes 
      WHERE company_id = ? AND credit_note_number LIKE 'CRN%'
      ORDER BY id DESC
      LIMIT 1
    `, [companyId]);

    let nextNumber = 1;
    if (lastNotes.length > 0) {
      const lastNum = lastNotes[0].credit_note_number.match(/\d+$/);
      if (lastNum) {
        nextNumber = parseInt(lastNum[0]) + 1;
      }
    }

    let creditNoteNumber = `CRN${nextNumber.toString().padStart(6, '0')}`;
    
    // Final check for uniqueness with a loop to find the next available number
    let isUnique = false;
    while (!isUnique) {
      const existing = await query<any>("SELECT id FROM credit_notes WHERE credit_note_number = ?", [creditNoteNumber]);
      if (existing.length === 0) {
        isUnique = true;
      } else {
        nextNumber++;
        creditNoteNumber = `CRN${nextNumber.toString().padStart(6, '0')}`;
      }
    }

    const vatAmount = total_with_vat * 0.15;
    const totalBeforeVat = total_with_vat - vatAmount;

    const result = await execute(`
      INSERT INTO credit_notes (
        credit_note_number, invoice_id, invoice_number, client_id, client_name, 
        client_vat, client_address, reason, total_before_vat, vat_amount, 
        total_amount, company_id, created_by, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())
    `, [
      creditNoteNumber,
      invoice_id,
      invoice.invoice_number,
      invoice.client_id,
      invoice.client_name,
      invoice.client_vat,
      invoice.client_address,
      reason,
      totalBeforeVat,
      vatAmount,
      total_with_vat,
      companyId,
      userId
    ]);

    // --- Auto Journal Entry for Credit Note ---
    // Credit note reverses the invoice: debit sales/vat, credit customers
    try {
      const { recordJournalEntry, getDefaultAccounts } = await import("@/lib/accounting");
      const defaults = await getDefaultAccounts(parseInt(companyId));

      const customersAccId = defaults.customers || 3;
      const salesAccId = defaults.sales_revenue || 6;
      const vatAccId = defaults.vat || 25;

      const lines: any[] = [
        { account_id: salesAccId, debit: totalBeforeVat, credit: 0, description: `إشعار دائن ${creditNoteNumber} - إلغاء جزئي فاتورة ${invoice.invoice_number}` },
        { account_id: customersAccId, debit: 0, credit: total_with_vat, description: `إشعار دائن ${creditNoteNumber} - تخفيض ذمة عميل` }
      ];

      if (vatAmount > 0) {
        lines.push({ account_id: vatAccId, debit: vatAmount, credit: 0, description: `إلغاء ضريبة إشعار دائن ${creditNoteNumber}` });
      }

      await recordJournalEntry({
        entry_date: new Date().toISOString().split('T')[0],
        entry_number: `CRN-${creditNoteNumber}`,
        description: `إشعار دائن ${creditNoteNumber} للفاتورة ${invoice.invoice_number}`,
        company_id: parseInt(companyId),
        created_by: "System",
        source_type: "credit_note",
        source_id: String(result.insertId),
        lines
      });
    } catch (accError) {
      console.error("Error creating auto journal entry for credit note:", accError);
    }

    return NextResponse.json({ 
      success: true, 
      message: "تم إنشاء إشعار الدائن بنجاح",
      credit_note_id: result.insertId,
      credit_note_number: creditNoteNumber
    });
  } catch (error: any) {
    console.error("Error creating credit note:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

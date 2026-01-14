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
      WHERE credit_note_number LIKE 'CRN%'
      ORDER BY id DESC
      LIMIT 10
    `);

    let nextNumber = 1;
    if (lastNotes.length > 0) {
      // Find the maximum number among the last 10 notes to be safer
      const numbers = lastNotes
        .map((n: any) => {
          const match = n.credit_note_number.match(/\d+$/);
          return match ? parseInt(match[0]) : 0;
        })
        .filter((num: number) => !isNaN(num));
      
      if (numbers.length > 0) {
        nextNumber = Math.max(...numbers) + 1;
      }
    }

    let creditNoteNumber = `CRN${nextNumber.toString().padStart(6, '0')}`;
    
    // Final check for uniqueness (just in case)
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      const existing = await query<any>("SELECT id FROM credit_notes WHERE credit_note_number = ?", [creditNoteNumber]);
      if (existing.length === 0) {
        isUnique = true;
      } else {
        nextNumber++;
        creditNoteNumber = `CRN${nextNumber.toString().padStart(6, '0')}`;
        attempts++;
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

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query, execute } from "@/lib/db";
import { logSubUserActivity } from "@/lib/activity";

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

    const invoices = await query<any>(`
      SELECT 
        si.*,
        COALESCE((SELECT SUM(total_before_vat) FROM invoice_items WHERE invoice_id = si.id), 0) as subtotal,
        COALESCE((SELECT SUM(vat_amount) FROM invoice_items WHERE invoice_id = si.id), 0) as tax_amount,
        COALESCE((SELECT status FROM invoice_items WHERE invoice_id = si.id LIMIT 1), 'due') as invoice_status
      FROM sales_invoices si
      WHERE si.company_id = ?
      ORDER BY si.id DESC
    `, [companyId]);

    return NextResponse.json({ invoices });
  } catch (error: any) {
    console.error("Error fetching invoices:", error);
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
      invoice_number,
      invoice_month,
      client_id,
      issue_date,
      due_date,
      status = 'due',
      items = [],
      adjustments = [],
      account_id = null,
      cost_center_id = null
    } = body;

    const customers = await query<any>(
      "SELECT * FROM customers WHERE id = ? AND company_id = ?",
      [client_id, companyId]
    );
    const client = customers[0];
    
    if (!client) {
      return NextResponse.json({ error: "العميل غير موجود" }, { status: 400 });
    }

    let totalBeforeVat = 0;
    let totalVat = 0;
    let totalWithVat = 0;

    for (const item of items) {
      const itemTotal = parseFloat(item.total_with_vat) || 0;
      const beforeVat = itemTotal / 1.15;
      const vat = itemTotal - beforeVat;
      totalBeforeVat += beforeVat;
      totalVat += vat;
      totalWithVat += itemTotal;
    }

    let adjustmentAmount = 0;
    let adjustmentVat = 0;
    let adjustmentTotalWithVat = 0;
    let adjustmentTitles: string[] = [];
    let adjustmentType = '';

    for (const adj of adjustments) {
      const amount = parseFloat(adj.amount) || 0;
      const isTaxable = adj.is_taxable;
      const isInclusive = adj.is_inclusive;
      
      let vatAmount = 0;
      let total = amount;

      if (isTaxable) {
        if (isInclusive) {
          const beforeVat = amount / 1.15;
          vatAmount = amount - beforeVat;
          total = amount;
        } else {
          vatAmount = amount * 0.15;
          total = amount + vatAmount;
        }
      }

      if (adj.type === 'addition') {
        adjustmentAmount += (total - vatAmount);
        adjustmentVat += vatAmount;
        adjustmentTotalWithVat += total;
        totalVat += vatAmount;
        totalWithVat += total;
      } else {
        adjustmentAmount -= (total - vatAmount);
        adjustmentVat -= vatAmount;
        adjustmentTotalWithVat -= total;
        totalVat -= vatAmount;
        totalWithVat -= total;
      }

      adjustmentTitles.push(adj.title);
      adjustmentType = adj.type;
    }

    const result = await execute(`
      INSERT INTO sales_invoices (
        invoice_number, invoice_month, client_id, client_name, client_vat, client_address,
        issue_date, due_date, total_amount, tax_amount, discount, status, company_id, created_by,
        adjustment_title, adjustment_type, adjustment_amount, adjustment_vat, adjustment_total_with_vat,
        account_id, cost_center_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      invoice_number,
      invoice_month,
      client_id,
      client.company_name || client.customer_name || client.name,
      client.vat_number,
      client.address,
      issue_date,
      due_date,
      totalWithVat,
      totalVat,
      0,
      status,
      companyId,
      userId,
      adjustmentTitles.join(' - '),
      adjustmentType,
      adjustmentAmount,
      adjustmentVat,
      adjustmentTotalWithVat,
      account_id || null,
      cost_center_id || null
    ]);

    const invoiceId = result.insertId;

    // --- INTEGRATED ACCOUNTING: Record Journal Entry ---
      try {
        const { recordJournalEntry, getDefaultAccounts } = await import("@/lib/accounting");
        const defaults = await getDefaultAccounts(parseInt(companyId));

        const customersAccId = defaults.customers || 3;
          // Use user-selected account for revenue, or fall back to default
          const salesAccId = account_id || defaults.sales_revenue || 6;
          const vatAccId = defaults.vat || 25;
        
        const journalLines = [
          {
            account_id: customersAccId,
            cost_center_id: cost_center_id || undefined,
            description: `فاتورة مبيعات رقم ${invoice_number} - ${client.company_name || client.customer_name}`,
            debit: totalWithVat,
            credit: 0
          },
          {
            account_id: salesAccId,
            cost_center_id: cost_center_id || undefined,
            description: `إيراد مبيعات فاتورة ${invoice_number}`,
            debit: 0,
            credit: totalWithVat - totalVat
          }
        ];

        if (totalVat > 0) {
          journalLines.push({
            account_id: vatAccId,
            cost_center_id: cost_center_id || undefined,
            description: `ضريبة مخرجات فاتورة ${invoice_number}`,
            debit: 0,
            credit: totalVat
          });
        }

        await recordJournalEntry({
          entry_date: issue_date,
          entry_number: `INV-${invoice_number}`,
          description: `فاتورة مبيعات رقم ${invoice_number}`,
          company_id: parseInt(companyId),
          created_by: "System",
          source_type: "sales_invoice",
          source_id: String(invoiceId),
          lines: journalLines
        });
      } catch (accError) {
        console.error("Error recording accounting entry for invoice:", accError);
      }
      // --------------------------------------------------

    // Log activity if sub-user
    if (session.user_type === "sub_user") {
      await logSubUserActivity({
        subUserId: userId,
        companyId: companyId,
        actionType: "INVOICE_CREATED",
        actionDescription: `تم إنشاء فاتورة ضريبية جديدة رقم: ${invoice_number} بمبلغ: ${totalWithVat}`,
        metadata: { invoice_id: invoiceId, invoice_number, amount: totalWithVat }
      });
    }

    for (const item of items) {
      const totalWithVatItem = parseFloat(item.total_with_vat) || 0;
      const quantity = parseFloat(item.quantity) || 0;
      const beforeVat = totalWithVatItem / 1.15;
      const vatAmount = totalWithVatItem - beforeVat;
      const unitPrice = quantity > 0 ? beforeVat / quantity : 0;

      await execute(`
        INSERT INTO invoice_items (
          invoice_id, product_name, period_from, period_to, quantity, unit_price,
          vat_rate, total_before_vat, vat_amount, total_with_vat, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        invoiceId,
        item.product_name,
        item.period_from || null,
        item.period_to || null,
        quantity,
        unitPrice,
        15,
        beforeVat,
        vatAmount,
        totalWithVatItem,
        status
      ]);
    }

    for (const adj of adjustments) {
      const amount = parseFloat(adj.amount) || 0;
      const isTaxable = adj.is_taxable ? 1 : 0;
      const isInclusive = adj.is_inclusive ? 1 : 0;
      
      let vatAmount = 0;
      let total = amount;

      if (adj.is_taxable) {
        if (adj.is_inclusive) {
          const beforeVat = amount / 1.15;
          vatAmount = amount - beforeVat;
          total = amount;
        } else {
          vatAmount = amount * 0.15;
          total = amount + vatAmount;
        }
      }

      await execute(`
        INSERT INTO invoice_adjustments (
          invoice_id, title, type, amount, vat_amount, total_with_vat, is_taxable, is_inclusive
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        invoiceId,
        adj.title,
        adj.type,
        amount,
        vatAmount,
        total,
        isTaxable,
        isInclusive
      ]);
    }

    return NextResponse.json({ 
      success: true, 
      message: "تم حفظ الفاتورة بنجاح",
      invoice_id: invoiceId,
      invoice_number 
    });
  } catch (error: any) {
    console.error("Error creating invoice:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

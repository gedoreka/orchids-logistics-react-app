import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query, execute } from "@/lib/db";

async function getCompanyId(userId: number) {
  const users = await query<any>("SELECT company_id FROM users WHERE id = ?", [userId]);
  return users[0]?.company_id;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const invoices = await query<any>(
      "SELECT * FROM sales_invoices WHERE id = ? AND company_id = ?",
      [id, companyId]
    );

    if (invoices.length === 0) {
      return NextResponse.json({ error: "الفاتورة غير موجودة" }, { status: 404 });
    }

    const invoice = invoices[0];

    const items = await query<any>(
      "SELECT * FROM invoice_items WHERE invoice_id = ?",
      [id]
    );

    const adjustments = await query<any>(
      "SELECT * FROM invoice_adjustments WHERE invoice_id = ?",
      [id]
    );

    const companies = await query<any>(
      "SELECT * FROM companies WHERE id = ?",
      [companyId]
    );

    const bankAccounts = await query<any>(
      "SELECT * FROM company_bank_accounts WHERE company_id = ? ORDER BY id DESC",
      [companyId]
    );

    let customer = null;
    if (invoice.client_id) {
      const customers = await query<any>(
        "SELECT * FROM customers WHERE id = ?",
        [invoice.client_id]
      );
      customer = customers[0];
    }

    return NextResponse.json({
      invoice,
      items,
      adjustments,
      company: companies[0],
      bankAccounts,
      customer
    });
  } catch (error: any) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const body = await request.json();
    const { action } = body;

    if (action === 'toggle_payment') {
      const currentItems = await query<any>(
        "SELECT status FROM invoice_items WHERE invoice_id = ? LIMIT 1",
        [id]
      );
      
      const currentStatus = currentItems[0]?.status || 'due';
      const newStatus = currentStatus === 'due' ? 'paid' : 'due';

      await execute(
        "UPDATE invoice_items SET status = ? WHERE invoice_id = ?",
        [newStatus, id]
      );

      await execute(
        "UPDATE sales_invoices SET status = ? WHERE id = ?",
        [newStatus, id]
      );

      return NextResponse.json({
        success: true,
        message: newStatus === 'paid' ? 'تم سداد الضريبة بنجاح' : 'تمت إعادة الفاتورة كمستحقة',
        new_status: newStatus
      });
    }

    return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
  } catch (error: any) {
    console.error("Error updating invoice:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const invoices = await query<any>(
      "SELECT status FROM sales_invoices WHERE id = ? AND company_id = ?",
      [id, companyId]
    );

    if (invoices.length === 0) {
      return NextResponse.json({ error: "الفاتورة غير موجودة" }, { status: 404 });
    }

    if (invoices[0].status !== 'draft') {
      return NextResponse.json({ error: "لا يمكن حذف الفاتورة إلا إذا كانت مسودة" }, { status: 400 });
    }

    await execute("DELETE FROM invoice_items WHERE invoice_id = ?", [id]);
    await execute("DELETE FROM invoice_adjustments WHERE invoice_id = ?", [id]);
    await execute("DELETE FROM sales_invoices WHERE id = ? AND company_id = ?", [id, companyId]);

    return NextResponse.json({ success: true, message: "تم حذف الفاتورة بنجاح" });
  } catch (error: any) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

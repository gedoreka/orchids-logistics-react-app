import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query, execute } from "@/lib/db";

async function getCompanyId(userId: number) {
  const users = await query<any>("SELECT company_id FROM users WHERE id = ?", [userId]);
  return users[0]?.company_id;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const creditNotes = await query<any>(`
      SELECT 
        cn.*,
        si.issue_date as invoice_date,
        si.total_amount as invoice_total_amount,
        c.email as client_email,
          c.phone as client_phone,
          comp.name as company_name,
          comp.vat_number as company_vat,
          CONCAT(COALESCE(comp.street, ''), ' ', COALESCE(comp.district, ''), ' ', COALESCE(comp.region, '')) as company_address,
          comp.phone as company_phone,
          comp.logo_path as company_logo
        FROM credit_notes cn
        JOIN sales_invoices si ON cn.invoice_id = si.id
        LEFT JOIN customers c ON cn.client_id = c.id
        JOIN companies comp ON cn.company_id = comp.id
        WHERE cn.id = ? AND cn.company_id = ?
      `, [id, companyId]);

    if (creditNotes.length === 0) {
      return NextResponse.json({ error: "إشعار الدائن غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ credit_note: creditNotes[0] });
  } catch (error: any) {
    console.error("Error fetching credit note details:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Cancel credit note: update status and set cancelled_at
    const result = await execute(`
      UPDATE credit_notes 
      SET status = 'cancelled', cancelled_at = NOW() 
      WHERE id = ? AND company_id = ? AND status = 'active'
    `, [id, companyId]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "إشعار الدائن غير موجود أو ملغي مسبقاً" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "تم إلغاء إشعار الدائن بنجاح" });
  } catch (error: any) {
    console.error("Error cancelling credit note:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

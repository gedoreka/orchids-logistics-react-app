import { NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const includeAll = searchParams.get("include_all") === "true";

    // Get company_id from session to filter notifications
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("auth_session");
    let companyId: number | null = null;
    let isAdmin = false;
    if (sessionCookie) {
      const session = JSON.parse(sessionCookie.value);
      companyId = session.company_id || null;
      isAdmin = session.role === 'admin';
    }

    let sql: string;
    let params: any[];

    if (includeAll) {
      // Admin panel: show all
      sql = "SELECT * FROM admin_notifications ORDER BY created_at DESC LIMIT ?";
      params = [limit];
    } else if (isAdmin) {
      // Admin users see all non-frozen notifications
      sql = "SELECT * FROM admin_notifications WHERE is_frozen = 0 ORDER BY created_at DESC LIMIT ?";
      params = [limit];
    } else if (companyId) {
      // Company users: only see sent_to_all=1 OR their company_id in sent_to_companies
      sql = `SELECT * FROM admin_notifications 
             WHERE is_frozen = 0 
             AND (sent_to_all = 1 OR sent_to_companies LIKE ?) 
             ORDER BY created_at DESC LIMIT ?`;
      params = [`%${companyId}%`, limit];
    } else {
      // No company: only global notifications
      sql = "SELECT * FROM admin_notifications WHERE is_frozen = 0 AND sent_to_all = 1 ORDER BY created_at DESC LIMIT ?";
      params = [limit];
    }

    const notifications = await query<any>(sql, params);

    return NextResponse.json({ success: true, notifications });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Update notification
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, message, image_path } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "معرف الإشعار مطلوب" }, { status: 400 });
    }

    await execute(
      "UPDATE admin_notifications SET title = ?, message = ?, image_path = ?, updated_at = NOW() WHERE id = ?",
      [title, message, image_path || null, id]
    );

    return NextResponse.json({ success: true, message: "تم تحديث الإشعار بنجاح" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Delete notification
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "معرف الإشعار مطلوب" }, { status: 400 });
    }

    await execute("DELETE FROM admin_notifications WHERE id = ?", [id]);

    return NextResponse.json({ success: true, message: "تم حذف الإشعار بنجاح" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Freeze/Unfreeze notification
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, is_frozen } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "معرف الإشعار مطلوب" }, { status: 400 });
    }

    await execute(
      "UPDATE admin_notifications SET is_frozen = ?, updated_at = NOW() WHERE id = ?",
      [is_frozen ? 1 : 0, id]
    );

    return NextResponse.json({ 
      success: true, 
      message: is_frozen ? "تم تجميد الإشعار" : "تم إلغاء تجميد الإشعار" 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

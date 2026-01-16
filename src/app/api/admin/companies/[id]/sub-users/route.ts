import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query, execute } from "@/lib/db";

async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get("auth_session")?.value;
  if (!session) return false;
  try {
    const data = JSON.parse(session);
    return data.role === "admin";
  } catch {
    return false;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { id } = await params;

    const subUsers = await query(`
      SELECT 
        su.id, su.name, su.email, su.profile_image, su.status, 
        su.created_at, su.last_login_at, su.max_sessions,
        (SELECT COUNT(*) FROM sub_user_sessions WHERE sub_user_id = su.id AND is_active = true) as active_sessions
      FROM company_sub_users su
      WHERE su.company_id = ?
      ORDER BY su.created_at DESC
    `, [id]);

    return NextResponse.json({ subUsers });
  } catch (error) {
    console.error("Error fetching company sub-users:", error);
    return NextResponse.json({ error: "خطأ في جلب المستخدمين" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await request.json();
    const { sub_user_id, status } = body;

    if (!sub_user_id || !status) {
      return NextResponse.json({ error: "البيانات مطلوبة" }, { status: 400 });
    }

    await execute(
      "UPDATE company_sub_users SET status = ?, updated_at = NOW() WHERE id = ?",
      [status, sub_user_id]
    );

    if (status === "suspended") {
      await execute(
        "UPDATE sub_user_sessions SET is_active = false WHERE sub_user_id = ?",
        [sub_user_id]
      );
    }

    return NextResponse.json({ success: true, message: "تم تحديث حالة المستخدم" });
  } catch (error) {
    console.error("Error updating sub-user status:", error);
    return NextResponse.json({ error: "خطأ في تحديث الحالة" }, { status: 500 });
  }
}

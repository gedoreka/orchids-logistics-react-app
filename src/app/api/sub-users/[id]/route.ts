import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query, execute } from "@/lib/db";
import bcrypt from "bcryptjs";

interface SessionData {
  user_id: number;
  company_id: number;
  role: string;
  user_type: string;
}

async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("auth_session")?.value;
  if (!session) return null;
  try {
    return JSON.parse(session);
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { id } = await params;

    const subUsers = await query(`
      SELECT 
        su.id, su.name, su.email, su.profile_image, su.status, 
        su.created_at, su.last_login_at, su.max_sessions
      FROM company_sub_users su
      WHERE su.id = ? AND su.company_id = ?
    `, [id, session.company_id]);

    if ((subUsers as Array<Record<string, unknown>>).length === 0) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    const subUser = (subUsers as Array<Record<string, unknown>>)[0];

    const perms = await query<{ permission_key: string }>(
      "SELECT permission_key FROM sub_user_permissions WHERE sub_user_id = ?",
      [id]
    );
    (subUser as { permissions?: string[] }).permissions = perms.map(p => p.permission_key);

    const sessions = await query(`
      SELECT id, session_id, ip_address, user_agent, login_at, last_activity, is_active
      FROM sub_user_sessions
      WHERE sub_user_id = ?
      ORDER BY login_at DESC
      LIMIT 20
    `, [id]);

    const activityLogs = await query(`
      SELECT id, action_type, action_description, ip_address, created_at
      FROM sub_user_activity_logs
      WHERE sub_user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `, [id]);

    return NextResponse.json({ 
      subUser,
      sessions,
      activityLogs
    });
  } catch (error) {
    console.error("Error fetching sub-user:", error);
    return NextResponse.json({ error: "خطأ في جلب بيانات المستخدم" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    if (session.user_type === "sub_user") {
      return NextResponse.json({ error: "غير مصرح للمستخدمين الفرعيين" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, email, password, permissions, status, profile_image } = body;

    const existing = await query(
      "SELECT id FROM company_sub_users WHERE id = ? AND company_id = ?",
      [id, session.company_id]
    );

    if ((existing as Array<{ id: number }>).length === 0) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    if (email) {
      const emailCheck = await query(
        "SELECT id FROM users WHERE email = ?",
        [email.toLowerCase()]
      );
      if ((emailCheck as Array<{ id: number }>).length > 0) {
        return NextResponse.json({ error: "البريد الإلكتروني مستخدم" }, { status: 400 });
      }

      const subEmailCheck = await query(
        "SELECT id FROM company_sub_users WHERE email = ? AND id != ?",
        [email.toLowerCase(), id]
      );
      if ((subEmailCheck as Array<{ id: number }>).length > 0) {
        return NextResponse.json({ error: "البريد الإلكتروني مستخدم" }, { status: 400 });
      }
    }

    let updateQuery = "UPDATE company_sub_users SET updated_at = NOW()";
    const updateParams: (string | number | null)[] = [];

    if (name) {
      updateQuery += ", name = ?";
      updateParams.push(name);
    }
    if (email) {
      updateQuery += ", email = ?";
      updateParams.push(email.toLowerCase());
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ", password = ?";
      updateParams.push(hashedPassword);
    }
    if (status) {
      updateQuery += ", status = ?";
      updateParams.push(status);
    }
    if (profile_image !== undefined) {
      updateQuery += ", profile_image = ?";
      updateParams.push(profile_image);
    }

    updateQuery += " WHERE id = ? AND company_id = ?";
    updateParams.push(id, session.company_id);

    await execute(updateQuery, updateParams);

    if (permissions !== undefined) {
      await execute("DELETE FROM sub_user_permissions WHERE sub_user_id = ?", [id]);
      
      if (permissions.length > 0) {
        for (const perm of permissions) {
          await execute(
            "INSERT INTO sub_user_permissions (sub_user_id, permission_key, granted_by, granted_at) VALUES (?, ?, ?, NOW())",
            [id, perm, session.user_id]
          );
        }
      }
    }

    return NextResponse.json({ success: true, message: "تم تحديث المستخدم بنجاح" });
  } catch (error) {
    console.error("Error updating sub-user:", error);
    return NextResponse.json({ error: "خطأ في تحديث المستخدم" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    if (session.user_type === "sub_user") {
      return NextResponse.json({ error: "غير مصرح للمستخدمين الفرعيين" }, { status: 403 });
    }

    const { id } = await params;

    await execute(
      "UPDATE company_sub_users SET status = 'deleted', updated_at = NOW() WHERE id = ? AND company_id = ?",
      [id, session.company_id]
    );

    await execute(
      "UPDATE sub_user_sessions SET is_active = false WHERE sub_user_id = ?",
      [id]
    );

    return NextResponse.json({ success: true, message: "تم حذف المستخدم بنجاح" });
  } catch (error) {
    console.error("Error deleting sub-user:", error);
    return NextResponse.json({ error: "خطأ في حذف المستخدم" }, { status: 500 });
  }
}

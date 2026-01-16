import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query, execute } from "@/lib/db";
import bcrypt from "bcryptjs";
import { sendWelcomeSubUserEmail } from "@/lib/mail";

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

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    if (session.user_type === "sub_user") {
      return NextResponse.json({ error: "غير مصرح للمستخدمين الفرعيين" }, { status: 403 });
    }

    const subUsers = await query(`
      SELECT 
        su.id, su.name, su.email, su.profile_image, su.status, 
        su.created_at, su.last_login_at, su.max_sessions,
        (SELECT COUNT(*) FROM sub_user_sessions WHERE sub_user_id = su.id AND is_active = true) as active_sessions
      FROM company_sub_users su
      WHERE su.company_id = ? AND su.status != 'deleted'
      ORDER BY su.created_at DESC
    `, [session.company_id]);

    for (const user of subUsers as Array<{ id: number; permissions?: string[] }>) {
      const perms = await query<{ permission_key: string }>(
        "SELECT permission_key FROM sub_user_permissions WHERE sub_user_id = ?",
        [user.id]
      );
      user.permissions = perms.map(p => p.permission_key);
    }

    return NextResponse.json({ subUsers });
  } catch (error) {
    console.error("Error fetching sub-users:", error);
    return NextResponse.json({ error: "خطأ في جلب المستخدمين" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    if (session.user_type === "sub_user") {
      return NextResponse.json({ error: "غير مصرح للمستخدمين الفرعيين" }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, permissions, profile_image } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    const existingUsers = await query(
      "SELECT id FROM users WHERE email = ?",
      [email.toLowerCase()]
    );
    if ((existingUsers as Array<{ id: number }>).length > 0) {
      return NextResponse.json({ error: "البريد الإلكتروني مستخدم مسبقًا" }, { status: 400 });
    }

    const existingSubUsers = await query(
      "SELECT id FROM company_sub_users WHERE email = ?",
      [email.toLowerCase()]
    );
    if ((existingSubUsers as Array<{ id: number }>).length > 0) {
      return NextResponse.json({ error: "البريد الإلكتروني مستخدم مسبقًا" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await execute(
      `INSERT INTO company_sub_users 
        (company_id, name, email, password, profile_image, status, created_by, created_at) 
       VALUES (?, ?, ?, ?, ?, 'active', ?, NOW())`,
      [session.company_id, name, email.toLowerCase(), hashedPassword, profile_image || null, session.user_id]
    );

    const subUserId = result.insertId;

    if (permissions && permissions.length > 0) {
      for (const perm of permissions) {
        await execute(
          "INSERT INTO sub_user_permissions (sub_user_id, permission_key, granted_by, granted_at) VALUES (?, ?, ?, NOW())",
          [subUserId, perm, session.user_id]
        );
      }
    }

    sendWelcomeSubUserEmail(email, name, password).catch(console.error);

    return NextResponse.json({ 
      success: true, 
      message: "تم إنشاء المستخدم بنجاح",
      subUserId 
    });
  } catch (error) {
    console.error("Error creating sub-user:", error);
    return NextResponse.json({ error: "خطأ في إنشاء المستخدم" }, { status: 500 });
  }
}

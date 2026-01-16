import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { supabase } from "@/lib/supabase-client";
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

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    if (session.user_type === "sub_user") {
      return NextResponse.json({ error: "غير مصرح للمستخدمين الفرعيين" }, { status: 403 });
    }

    const { data: subUsers, error } = await supabase
      .from("company_sub_users")
      .select("id, name, email, profile_image, status, created_at, last_login_at, max_sessions")
      .eq("company_id", session.company_id)
      .neq("status", "deleted")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "خطأ في جلب المستخدمين" }, { status: 500 });
    }

    for (const user of subUsers || []) {
      const { data: perms } = await supabase
        .from("sub_user_permissions")
        .select("permission_key")
        .eq("sub_user_id", user.id);
      
      (user as { permissions?: string[] }).permissions = (perms || []).map((p: { permission_key: string }) => p.permission_key);

      const { count } = await supabase
        .from("sub_user_sessions")
        .select("*", { count: "exact", head: true })
        .eq("sub_user_id", user.id)
        .eq("is_active", true);
      
      (user as { active_sessions?: number }).active_sessions = count || 0;
    }

    return NextResponse.json({ subUsers: subUsers || [] });
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

    const { data: existingSubUsers } = await supabase
      .from("company_sub_users")
      .select("id")
      .eq("email", email.toLowerCase());
    
    if (existingSubUsers && existingSubUsers.length > 0) {
      return NextResponse.json({ error: "البريد الإلكتروني مستخدم مسبقًا" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: newUser, error: insertError } = await supabase
      .from("company_sub_users")
      .insert({
        company_id: session.company_id,
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        profile_image: profile_image || null,
        status: "active",
        created_by: session.user_id,
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json({ error: "خطأ في إنشاء المستخدم" }, { status: 500 });
    }

    const subUserId = newUser.id;

    if (permissions && permissions.length > 0) {
      const permissionsToInsert = permissions.map((perm: string) => ({
        sub_user_id: subUserId,
        permission_key: perm,
        granted_by: session.user_id,
        granted_at: new Date().toISOString(),
      }));

      await supabase.from("sub_user_permissions").insert(permissionsToInsert);
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

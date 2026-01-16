import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase-client";

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

    const { data: subUsers, error } = await supabase
      .from("company_sub_users")
      .select("id, name, email, profile_image, status, created_at, last_login_at, max_sessions")
      .eq("company_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "خطأ في جلب المستخدمين" }, { status: 500 });
    }

    for (const user of subUsers || []) {
      const { count } = await supabase
        .from("sub_user_sessions")
        .select("*", { count: "exact", head: true })
        .eq("sub_user_id", user.id)
        .eq("is_active", true);
      
      (user as { active_sessions?: number }).active_sessions = count || 0;
    }

    return NextResponse.json({ subUsers: subUsers || [] });
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

    await supabase
      .from("company_sub_users")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", sub_user_id);

    if (status === "suspended") {
      await supabase
        .from("sub_user_sessions")
        .update({ is_active: false })
        .eq("sub_user_id", sub_user_id);
    }

    return NextResponse.json({ success: true, message: "تم تحديث حالة المستخدم" });
  } catch (error) {
    console.error("Error updating sub-user status:", error);
    return NextResponse.json({ error: "خطأ في تحديث الحالة" }, { status: 500 });
  }
}

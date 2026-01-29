import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase-client";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";
import { sendSubUserStatusEmail, sendSubUserDeletionEmail } from "@/lib/mail";
import { logSubUserActivity } from "@/lib/activity";

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

    const { data: subUsers, error } = await supabase
      .from("company_sub_users")
      .select("id, name, email, profile_image, status, created_at, last_login_at, max_sessions")
      .eq("id", id)
      .eq("company_id", session.company_id);

    if (error || !subUsers || subUsers.length === 0) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    const subUser = subUsers[0];

    const { data: perms } = await supabase
      .from("sub_user_permissions")
      .select("permission_key")
      .eq("sub_user_id", id);
    
    (subUser as { permissions?: string[] }).permissions = (perms || []).map((p: { permission_key: string }) => p.permission_key);

    const { data: sessions } = await supabase
      .from("sub_user_sessions")
      .select("id, session_id, ip_address, user_agent, login_at, last_activity, is_active")
      .eq("sub_user_id", id)
      .order("login_at", { ascending: false })
      .limit(20);

    const { data: activityLogs } = await supabase
      .from("sub_user_activity_logs")
      .select("id, action_type, action_description, ip_address, created_at")
      .eq("sub_user_id", id)
      .order("created_at", { ascending: false })
      .limit(50);

    return NextResponse.json({ 
      subUser,
      sessions: sessions || [],
      activityLogs: activityLogs || []
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

    // Fetch company name
    const { data: companyData } = await supabase
      .from("companies")
      .select("name")
      .eq("id", session.company_id)
      .single();
    const companyName = companyData?.name || "شركتنا";

    // Fetch user current data for comparison
    const { data: currentUser } = await supabase
      .from("company_sub_users")
      .select("*")
      .eq("id", id)
      .single();

    if (!currentUser) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    const updateData: Record<string, string | null> = {
      updated_at: new Date().toISOString()
    };

    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (password) updateData.password = await bcrypt.hash(password, 10);
    if (status) updateData.status = status;
    if (profile_image !== undefined) updateData.profile_image = profile_image;

    await supabase
      .from("company_sub_users")
      .update(updateData)
      .eq("id", id)
      .eq("company_id", session.company_id);

    // Log the activity
    let actionType = "USER_UPDATED";
    let actionDesc = `تم تحديث بيانات المستخدم: ${currentUser.name}`;

    if (status && status !== currentUser.status) {
      actionType = status === "active" ? "USER_ACTIVATED" : "USER_SUSPENDED";
      actionDesc = status === "active" ? `تم تنشيط حساب المستخدم: ${currentUser.name}` : `تم تعليق حساب المستخدم: ${currentUser.name}`;
      
      // Send status change email
      sendSubUserStatusEmail(currentUser.email, currentUser.name, status as "active" | "suspended", companyName).catch(console.error);
    }

    await logSubUserActivity({
      subUserId: parseInt(id),
      companyId: session.company_id,
      actionType,
      actionDescription: actionDesc,
      metadata: { updated_by: session.user_id, status }
    });

    if (permissions !== undefined) {
      await supabase
        .from("sub_user_permissions")
        .delete()
        .eq("sub_user_id", id);
      
      if (permissions.length > 0) {
        const permissionsToInsert = permissions.map((perm: string) => ({
          sub_user_id: parseInt(id),
          permission_key: perm,
          granted_by: session.user_id,
          granted_at: new Date().toISOString(),
        }));

        await supabase.from("sub_user_permissions").insert(permissionsToInsert);
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

    // Fetch user current data for email and logging
    const { data: currentUser } = await supabase
      .from("company_sub_users")
      .select("*")
      .eq("id", id)
      .single();

    if (!currentUser) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    // Fetch company name
    const { data: companyData } = await supabase
      .from("companies")
      .select("name")
      .eq("id", session.company_id)
      .single();
    const companyName = companyData?.name || "شركتنا";

    // Delete related data first to avoid foreign key violations
    await supabase.from("sub_user_permissions").delete().eq("sub_user_id", id);
    await supabase.from("sub_user_sessions").delete().eq("sub_user_id", id);
    await supabase.from("sub_user_activity_logs").delete().eq("sub_user_id", id);

    // Finally delete the user completely from the database
    const { error: deleteError } = await supabase
      .from("company_sub_users")
      .delete()
      .eq("id", id)
      .eq("company_id", session.company_id);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return NextResponse.json({ error: "خطأ في حذف المستخدم من القاعدة" }, { status: 500 });
    }

    // Send deletion email
    sendSubUserDeletionEmail(currentUser.email, currentUser.name, companyName).catch(console.error);

    return NextResponse.json({ success: true, message: "تم حذف المستخدم نهائياً بنجاح" });
  } catch (error) {
    console.error("Error deleting sub-user:", error);
    return NextResponse.json({ error: "خطأ في حذف المستخدم" }, { status: 500 });
  }
}

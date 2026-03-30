import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'
  );
}

async function verifyAdmin() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  if (!sessionCookie) return false;
  try {
    const session = JSON.parse(sessionCookie.value);
    return session.role === "admin";
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("system_settings")
      .select("*")
      .order("setting_category")
      .order("id");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ settings: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    for (const setting of settings) {
      const { error } = await supabase
        .from("system_settings")
        .update({
          setting_value: setting.setting_value,
          updated_at: new Date().toISOString(),
        })
        .eq("setting_key", setting.setting_key);

      if (error) {
        return NextResponse.json(
          { error: `خطأ في تحديث ${setting.setting_key}: ${error.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true, message: "تم حفظ الإعدادات بنجاح" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await request.json();
    const { setting_key, setting_value, setting_category, setting_label, setting_type, is_secret, description } = body;

    if (!setting_key || !setting_category) {
      return NextResponse.json({ error: "بيانات غير مكتملة" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("system_settings").upsert(
      {
        setting_key,
        setting_value: setting_value || "",
        setting_category,
        setting_label: setting_label || setting_key,
        setting_type: setting_type || "text",
        is_secret: is_secret || false,
        description: description || "",
      },
      { onConflict: "setting_key" }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "تمت إضافة المفتاح بنجاح" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ error: "مفتاح غير محدد" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("system_settings")
      .delete()
      .eq("setting_key", key);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "تم حذف المفتاح بنجاح" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

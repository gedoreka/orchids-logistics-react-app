import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { query } from "@/lib/db";
import { cookies } from "next/headers";

function getSupabaseAdmin() {
  return createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'
  );
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("auth_session");
    if (!sessionCookie) {
      return NextResponse.json({ needsPhone: false });
    }

    const session = JSON.parse(sessionCookie.value);
    const companyId = session.company_id;
    if (!companyId) {
      return NextResponse.json({ needsPhone: false });
    }

    // Check if WhatsApp OTP is enabled
    const supabase = getSupabaseAdmin();
    const { data: settings } = await supabase
      .from("system_settings")
      .select("setting_key, setting_value")
      .eq("setting_key", "OTP_WHATSAPP_ENABLED")
      .single();

    if (settings?.setting_value !== "true") {
      return NextResponse.json({ needsPhone: false });
    }

    // Check company phone
    const companies = await query<{ phone: string }>(
      "SELECT phone FROM companies WHERE id = ? LIMIT 1",
      [companyId]
    );

    const phone = companies?.[0]?.phone || "";
    const needsPhone = !phone || phone.trim() === "";

    return NextResponse.json({ needsPhone });
  } catch {
    return NextResponse.json({ needsPhone: false });
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("system_settings")
      .select("setting_key, setting_value")
      .in("setting_key", ["OTP_WHATSAPP_ENABLED", "OTP_EMAIL_ENABLED"]);

    const settings: Record<string, string> = {};
    (data || []).forEach((s: any) => {
      settings[s.setting_key] = s.setting_value;
    });

    return NextResponse.json({
      whatsappEnabled: settings["OTP_WHATSAPP_ENABLED"] === "true",
      emailEnabled: settings["OTP_EMAIL_ENABLED"] === "true",
      otpRequired: settings["OTP_WHATSAPP_ENABLED"] === "true" || settings["OTP_EMAIL_ENABLED"] === "true",
    });
  } catch (err: any) {
    return NextResponse.json({ whatsappEnabled: false, emailEnabled: false, otpRequired: false });
  }
}

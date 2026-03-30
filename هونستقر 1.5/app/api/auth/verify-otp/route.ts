import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'
  );
}

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "البريد الإلكتروني والرمز مطلوبان" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("login_otp")
      .select("*")
      .eq("email", email)
      .eq("otp_code", otp.trim())
      .eq("verified", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "رمز التحقق غير صحيح أو منتهي الصلاحية" }, { status: 400 });
    }

    // Mark as verified
    await supabase.from("login_otp").update({ verified: true }).eq("id", data.id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Verify OTP error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

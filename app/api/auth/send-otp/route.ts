import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { query } from "@/lib/db";
import nodemailer from "nodemailer";

function getSupabaseAdmin() {
  return createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'
  );
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function getSystemSetting(supabase: ReturnType<typeof getSupabaseAdmin>, key: string): Promise<string> {
  const { data } = await supabase
    .from("system_settings")
    .select("setting_value")
    .eq("setting_key", key)
    .single();
  return data?.setting_value || "";
}

async function sendOTPEmail(email: string, otp: string, name: string, companyName: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>رمز التحقق - تسجيل الدخول</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e40af,#7c3aed);border-radius:20px 20px 0 0;padding:40px 40px 30px;text-align:center;">
              <div style="width:70px;height:70px;background:rgba(255,255,255,0.15);border-radius:18px;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(10px);">
                <span style="font-size:36px;">🔐</span>
              </div>
              <h1 style="color:#ffffff;font-size:26px;font-weight:900;margin:0 0 8px;">رمز التحقق</h1>
              <p style="color:rgba(255,255,255,0.7);font-size:14px;margin:0;">تسجيل الدخول الآمن - Logistics Hub</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="background:#1e293b;padding:40px;border-left:1px solid rgba(255,255,255,0.05);border-right:1px solid rgba(255,255,255,0.05);">
              
              <p style="color:#94a3b8;font-size:16px;margin:0 0 24px;line-height:1.6;">
                مرحباً <strong style="color:#e2e8f0;">${name}</strong>،
              </p>
              
              <p style="color:#94a3b8;font-size:15px;margin:0 0 32px;line-height:1.6;">
                تم طلب تسجيل الدخول إلى حساب شركة <strong style="color:#60a5fa;">${companyName}</strong>.<br>
                استخدم الرمز أدناه لإتمام تسجيل الدخول:
              </p>
              
              <!-- OTP Box -->
              <div style="background:linear-gradient(135deg,rgba(37,99,235,0.15),rgba(124,58,237,0.15));border:2px solid rgba(99,102,241,0.3);border-radius:16px;padding:32px;text-align:center;margin:0 0 32px;">
                <p style="color:#94a3b8;font-size:13px;margin:0 0 16px;letter-spacing:2px;text-transform:uppercase;">رمز التحقق</p>
                <div style="letter-spacing:12px;font-size:44px;font-weight:900;color:#ffffff;font-family:monospace;text-shadow:0 0 30px rgba(99,102,241,0.5);">${otp}</div>
                <p style="color:#64748b;font-size:12px;margin:16px 0 0;">صالح لمدة 5 دقائق فقط</p>
              </div>

              <!-- Warning -->
              <div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.2);border-radius:12px;padding:16px;margin:0 0 24px;">
                <p style="color:#fbbf24;font-size:13px;margin:0;line-height:1.6;">
                  ⚠️ <strong>تنبيه أمني:</strong> إذا لم تطلب هذا الرمز، تجاهل هذا البريد وتواصل مع الدعم الفني فوراً.
                </p>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background:#0f172a;border-radius:0 0 20px 20px;padding:24px 40px;text-align:center;border:1px solid rgba(255,255,255,0.05);border-top:none;">
              <p style="color:#475569;font-size:12px;margin:0 0 8px;">© 2026 Logistics Hub - جميع الحقوق محفوظة</p>
              <p style="color:#334155;font-size:11px;margin:0;">لا تشارك هذا الرمز مع أي شخص</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME || 'Logistics Hub'}" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: `🔐 رمز التحقق الخاص بك: ${otp} - تسجيل الدخول`,
    html,
  });
}

async function sendOTPWhatsApp(phone: string, otp: string, name: string, apiUrl: string, apiToken: string, instanceId: string) {
  // UltraMsg API format
  const message = `🔐 *رمز التحقق - Logistics Hub*\n\nمرحباً ${name}،\n\nرمز التحقق الخاص بك هو:\n\n*${otp}*\n\n⏰ صالح لمدة 5 دقائق فقط\n\n⚠️ لا تشارك هذا الرمز مع أي شخص.\n\n— Logistics Hub`;

  const url = `${apiUrl}/messages/chat`;
  const body = new URLSearchParams({
    token: apiToken,
    to: phone.startsWith("+") ? phone : `+${phone}`,
    body: message,
  });

  if (instanceId) {
    body.set("instance_id", instanceId);
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`WhatsApp API error: ${text}`);
  }
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "البريد الإلكتروني مطلوب" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Check if OTP is enabled
    const whatsappEnabled = await getSystemSetting(supabase, "OTP_WHATSAPP_ENABLED");
    const emailEnabled = await getSystemSetting(supabase, "OTP_EMAIL_ENABLED");

    if (whatsappEnabled !== "true" && emailEnabled !== "true") {
      return NextResponse.json({ error: "OTP غير مفعّل", otpDisabled: true }, { status: 200 });
    }

    // Get user info
    const users = await query<{ id: number; name: string; email: string; company_id: number }>(
      "SELECT id, name, email, company_id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (!users || users.length === 0) {
      // Don't reveal if user exists - just return success silently
      return NextResponse.json({ success: true });
    }

    const user = users[0];

    // Get company phone
    const companies = await query<{ name: string; phone: string }>(
      "SELECT name, phone FROM companies WHERE id = ? LIMIT 1",
      [user.company_id]
    );

    const company = companies?.[0];
    const companyPhone = company?.phone || "";
    const companyName = company?.name || "";

    // Generate OTP
    const otp = generateOTP();
    const expiryMinutes = parseInt(await getSystemSetting(supabase, "OTP_EXPIRY_MINUTES") || "5");
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000).toISOString();

    // Delete old OTPs for this email
    await supabase.from("login_otp").delete().eq("email", email);

    // Save new OTP
    await supabase.from("login_otp").insert({
      email,
      otp_code: otp,
      expires_at: expiresAt,
      verified: false,
    });

    const results: { email?: boolean; whatsapp?: boolean; errors?: string[] } = { errors: [] };

    // Send via Email
    if (emailEnabled === "true") {
      try {
        await sendOTPEmail(email, otp, user.name, companyName);
        results.email = true;
      } catch (e: any) {
        results.errors?.push(`فشل إرسال البريد: ${e.message}`);
      }
    }

    // Send via WhatsApp
    if (whatsappEnabled === "true" && companyPhone) {
      try {
        const apiUrl = await getSystemSetting(supabase, "WHATSAPP_API_URL");
        const apiToken = await getSystemSetting(supabase, "WHATSAPP_API_TOKEN");
        const instanceId = await getSystemSetting(supabase, "WHATSAPP_INSTANCE_ID");

        if (apiUrl && apiToken) {
          await sendOTPWhatsApp(companyPhone, otp, user.name, apiUrl, apiToken, instanceId);
          results.whatsapp = true;
        } else {
          results.errors?.push("إعدادات WhatsApp API غير مكتملة");
        }
      } catch (e: any) {
        results.errors?.push(`فشل إرسال WhatsApp: ${e.message}`);
      }
    } else if (whatsappEnabled === "true" && !companyPhone) {
      results.errors?.push("لا يوجد رقم هاتف مسجل للشركة");
    }

    return NextResponse.json({
      success: true,
      emailSent: results.email || false,
      whatsappSent: results.whatsapp || false,
      maskedEmail: email.replace(/(.{2})(.*)(@.*)/, "$1***$3"),
      maskedPhone: companyPhone ? companyPhone.replace(/(\+?\d{3})(\d*)(\d{3})/, "$1***$3") : null,
      noPhone: whatsappEnabled === "true" && !companyPhone,
    });
  } catch (err: any) {
    console.error("Send OTP error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

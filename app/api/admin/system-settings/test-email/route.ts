import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import nodemailer from "nodemailer";

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

export async function POST(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await request.json();
    const host = body.SMTP_HOST || process.env.SMTP_HOST;
    const port = parseInt(body.SMTP_PORT || process.env.SMTP_PORT || "465");
    const user = body.SMTP_USER || process.env.SMTP_USER;
    const pass = body.SMTP_PASS || process.env.SMTP_PASS;
    const from = body.SMTP_FROM || process.env.SMTP_FROM;
    const fromName = body.SMTP_FROM_NAME || process.env.SMTP_FROM_NAME || "System";

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `"${fromName}" <${from}>`,
      to: user,
      subject: "اختبار إعدادات البريد - Logistics Hub",
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #3b82f6;">اختبار ناجح!</h2>
          <p>تم إرسال هذا البريد التجريبي بنجاح من إعدادات النظام.</p>
          <p style="color: #6b7280; font-size: 12px;">التاريخ: ${new Date().toLocaleString("ar-SA")}</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "فشل في إرسال البريد التجريبي" },
      { status: 500 }
    );
  }
}

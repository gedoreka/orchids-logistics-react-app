import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { query } from "@/lib/db";
import { cookies } from "next/headers";

async function getCompanyInfo() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  if (!sessionCookie) return null;
  const session = JSON.parse(sessionCookie.value);
  
  const companies = await query<any>(
    "SELECT id, name FROM companies WHERE id = ?",
    [session.company_id]
  );
  
  if (!companies || companies.length === 0) return null;
  return companies[0];
}

export async function POST(request: NextRequest) {
  try {
    const company = await getCompanyInfo();
    if (!company) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { to, subject, html } = body;

    if (!to || !subject || !html) {
      return NextResponse.json({ error: "البريد والموضوع والمحتوى مطلوبين" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${company.name} - قسم الصيانة" <${process.env.SMTP_FROM}>`,
      to,
      subject,
      html,
    });

    return NextResponse.json({ success: true, message: "تم إرسال البريد بنجاح" });
  } catch (error: any) {
    console.error("Error sending fleet invoice email:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

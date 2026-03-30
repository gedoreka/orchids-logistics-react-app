import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { query, execute } from "@/lib/db";
import { cookies } from "next/headers";
import crypto from "crypto";

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
  return { ...companies[0], company_id: session.company_id };
}

export async function POST(request: NextRequest) {
  try {
    const company = await getCompanyInfo();
    if (!company) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { to, subject, html, maintenanceId } = body;

    if (!to || !subject || !html) {
      return NextResponse.json({ error: "البريد والموضوع والمحتوى مطلوبين" }, { status: 400 });
    }

    let finalHtml = html;

      // If maintenanceId provided, generate confirmation token and replace placeholder
    if (maintenanceId) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

      await execute(
        "UPDATE maintenance_requests SET confirmation_token = ?, token_expires_at = ? WHERE id = ?",
        [token, expiresAt, maintenanceId]
      );

        const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || `${new URL(request.url).protocol}//${new URL(request.url).host}`).replace(/\/$/, "");
      const confirmUrl = `${baseUrl}/api/fleet/complete-maintenance?token=${token}&id=${maintenanceId}`;
      
      finalHtml = html.replace(
        /%%CONFIRM_URL_PLACEHOLDER%%/g,
        confirmUrl
      );
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
      html: finalHtml,
    });

    return NextResponse.json({ success: true, message: "تم إرسال البريد بنجاح" });
  } catch (error: any) {
    console.error("Error sending fleet invoice email:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

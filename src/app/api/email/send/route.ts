import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountId, company_id, to, cc, bcc, subject, body: emailBody, attachments } = body;

    if (!accountId || !to || !subject) {
      return NextResponse.json(
        { error: "المستلم والموضوع مطلوبين" },
        { status: 400 }
      );
    }

    let query = supabase
      .from("company_email_accounts")
      .select("*")
      .eq("id", accountId);

    if (company_id) {
      query = query.eq("company_id", parseInt(company_id));
    }

    const { data: account, error: accountError } = await query.single();

    if (accountError || !account) {
      return NextResponse.json(
        { error: "حساب البريد غير موجود" },
        { status: 404 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: account.smtp_host,
      port: account.smtp_port,
      secure: account.smtp_port === 465,
      auth: {
        user: account.email,
        pass: account.password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions: nodemailer.SendMailOptions = {
      from: account.email,
      to: Array.isArray(to) ? to.join(", ") : to,
      cc: cc ? (Array.isArray(cc) ? cc.join(", ") : cc) : undefined,
      bcc: bcc ? (Array.isArray(bcc) ? bcc.join(", ") : bcc) : undefined,
      subject,
      html: emailBody,
      attachments: attachments?.map((att: { filename: string; content: string; contentType: string }) => ({
        filename: att.filename,
        content: Buffer.from(att.content, "base64"),
        contentType: att.contentType,
      })),
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "تم إرسال البريد بنجاح" });
  } catch (error) {
    console.error("Error sending email:", error);
    const errorMessage = error instanceof Error ? error.message : "حدث خطأ";
    
    if (errorMessage.includes("Invalid credentials") || errorMessage.includes("authentication")) {
      return NextResponse.json(
        { error: "بيانات الدخول غير صحيحة", requiresAuth: true },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: `حدث خطأ في إرسال البريد: ${errorMessage}` },
      { status: 500 }
    );
  }
}

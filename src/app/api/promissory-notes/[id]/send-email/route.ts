import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { query } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { email, company_id } = await request.json();

    if (!email || !company_id) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    const notes = await query<any>(`SELECT * FROM promissory_notes WHERE id = ? AND company_id = ?`, [id, company_id]);
    if (!notes || notes.length === 0) {
      return NextResponse.json({ error: "السند غير موجود" }, { status: 404 });
    }

    const note = notes[0];

    const companies = await query<any>(`SELECT * FROM companies WHERE id = ?`, [company_id]);
    const company = companies?.[0] || { name: 'الشركة' };

    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body{font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;background:#f8fafc;margin:0}
          .container{max-width:700px;margin:20px auto;background:#fff;border-radius:16px;padding:24px;border:1px solid #e6eef6}
          .header{background:linear-gradient(135deg,#111827,#0f172a);color:#fff;padding:26px;border-radius:12px;text-align:center}
          .content{padding:18px;color:#111}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0">سند لأمر</h1>
            <p style="margin:6px 0 0;opacity:0.8">Promissory Note</p>
          </div>
          <div class="content">
            <p><strong>رقم السند:</strong> ${note.note_number || note.note_number}</p>
            <p><strong>التاريخ:</strong> ${note.creation_date || ''}</p>
            <p><strong>المدين:</strong> ${note.debtor_name || '-'}</p>
            <p><strong>المستفيد:</strong> ${note.beneficiary_name || '-'}</p>
            <p><strong>المبلغ:</strong> ${note.amount ? Number(note.amount).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'}</p>
            <div style="margin-top:18px;color:#64748b">مرفق نسخة من السند الإلكتروني. للتواصل: ${company.name}</div>
          </div>
          <div style="padding:12px;text-align:center;color:#94a3b8;font-size:12px;border-top:1px solid #eef2f7">© ${new Date().getFullYear()} ${company.name}</div>
        </div>
      </body>
      </html>
    `;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${company.name}" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: `سند لأمر رقم ${note.note_number} - ${company.name}`,
      html
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending promissory note email:", error);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}

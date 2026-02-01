import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";
import { query } from "@/lib/db";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const body = await request.json();
    const { email, company_id, pdfBase64, fileName } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { data: voucher, error: voucherError } = await supabase
      .from("payment_vouchers")
      .select("*")
      .eq("id", id)
      .eq("company_id", company_id)
      .single();

    if (voucherError || !voucher) {
      return NextResponse.json({ error: "Voucher not found" }, { status: 404 });
    }

    const companyData = await query<any>(
      `SELECT name, vat_number, commercial_number, email as company_email, phone as company_phone FROM companies WHERE id = ?`,
      [company_id]
    );
    const company = companyData?.[0] || {};

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const luxuryHtml = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
          body { font-family: 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fffafb; margin: 0; padding: 40px 20px; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.05); border: 1px solid #fee2e2; }
          .header { background: linear-gradient(135deg, #be123c 0%, #9f1239 100%); color: white; padding: 40px; text-align: center; position: relative; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.025em; }
          .header p { margin: 10px 0 0; opacity: 0.7; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; }
          .content { padding: 40px; }
          .welcome-text { font-size: 18px; font-weight: 700; margin-bottom: 25px; color: #881337; text-align: center; }
          .info-card { background: #fff1f2; border-radius: 16px; padding: 25px; margin-bottom: 30px; }
          .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #fecaca; }
          .info-row:last-child { border-bottom: none; }
          .label { color: #9f1239; font-size: 13px; font-weight: 700; }
          .value { color: #4c0519; font-weight: 800; font-size: 14px; }
          .total-section { text-align: center; margin: 35px 0; padding: 30px; background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%); border-radius: 20px; border: 1px dashed #fb7185; }
          .total-label { font-size: 12px; font-weight: 900; color: #9f1239; text-transform: uppercase; margin-bottom: 8px; display: block; }
          .total-amount { font-size: 36px; font-weight: 900; color: #be123c; }
          .footer { background: #fffafb; padding: 35px; text-align: center; border-top: 1px solid #fee2e2; }
          .company-name { font-size: 16px; font-weight: 900; color: #881337; margin-bottom: 5px; }
          .company-info { font-size: 12px; color: #9f1239; margin-bottom: 20px; line-height: 1.6; }
          .branding { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 25px; opacity: 0.5; }
          .branding span { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; color: #9f1239; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>سند صرف إلكتروني</h1>
            <p>E-Payment Voucher</p>
          </div>
          <div class="content">
            <div class="welcome-text">مرحباً بك، تم إصدار سند صرف جديد لك</div>
            <p style="text-align: center; color: #9f1239; font-size: 14px; margin-bottom: 30px;">تجد أدناه تفاصيل عملية الصرف المالي، والمستند الأصلي مرفق في البريد بصيغة PDF.</p>
            
            <div class="info-card">
              <div class="info-row">
                <span class="label">رقم السند:</span>
                <span class="value">${voucher.voucher_number}</span>
              </div>
              <div class="info-row">
                <span class="label">تاريخ السند:</span>
                <span class="value">${voucher.voucher_date}</span>
              </div>
              <div class="info-row">
                <span class="label">صرفنا إلى السيد/السادة:</span>
                <span class="value">${voucher.payee_name}</span>
              </div>
              <div class="info-row">
                <span class="label">طريقة الدفع:</span>
                <span class="value">${voucher.payment_method}</span>
              </div>
            </div>

            <div class="total-section">
              <span class="total-label">إجمالي المبلغ المصروف</span>
              <div class="total-amount">${Number(voucher.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} <span style="font-size: 16px; opacity: 0.6;">ر.س</span></div>
            </div>

            <p style="font-size: 13px; color: #fb7185; text-align: center; font-style: italic;">"تم توثيق هذه العملية في سجلاتنا المحاسبية كإيصال صرف مالي معتمد."</p>
          </div>
          <div class="footer">
            <div class="company-name">${company.name}</div>
            <div class="company-info">
              الرقم الضريبي: ${company.vat_number || '-'}<br>
              ${company.company_email ? `البريد: ${company.company_email}` : ''}
            </div>
            
            <div class="branding">
              <div style="width: 12px; height: 12px; background: #be123c; border-radius: 3px;"></div>
              <span>Powered by Logistics Systems Pro</span>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const attachments = [];
    if (pdfBase64) {
      attachments.push({
        filename: fileName || `Payment-Voucher-${voucher.voucher_number}.pdf`,
        content: pdfBase64.split("base64,")[1],
        encoding: "base64",
      });
    }

    await transporter.sendMail({
      from: `"${company.name || process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: `سند صرف رقم ${voucher.voucher_number} - ${company.name}`,
      html: luxuryHtml,
      attachments,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}

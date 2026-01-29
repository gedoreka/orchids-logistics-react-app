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
    const { email, company_id } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { data: income, error: incomeError } = await supabase
      .from("manual_income")
      .select("*")
      .eq("id", id)
      .eq("company_id", company_id)
      .single();

    if (incomeError || !income) {
      return NextResponse.json({ error: "Income record not found" }, { status: 404 });
    }

    const companyData = await query<any>(
      `SELECT name, vat_number, commercial_number FROM companies WHERE id = ?`,
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

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #0891b2, #0e7490); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 30px; }
          .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
          .label { color: #666; font-size: 14px; }
          .value { color: #111; font-weight: bold; font-size: 14px; }
          .total { background: #ecfeff; padding: 20px; border-radius: 12px; margin-top: 20px; text-align: center; }
          .total-amount { font-size: 32px; font-weight: bold; color: #0891b2; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>سند إيراد</h1>
            <p style="margin: 10px 0 0; opacity: 0.8;">Income Voucher</p>
          </div>
          <div class="content">
            <div class="info-row">
              <span class="label">رقم السند:</span>
              <span class="value">${income.operation_number}</span>
            </div>
            <div class="info-row">
              <span class="label">التاريخ:</span>
              <span class="value">${income.income_date}</span>
            </div>
            <div class="info-row">
              <span class="label">نوع الإيراد:</span>
              <span class="value">${income.income_type}</span>
            </div>
            <div class="info-row">
              <span class="label">طريقة الدفع:</span>
              <span class="value">${income.payment_method}</span>
            </div>
            <div class="info-row">
              <span class="label">البيان:</span>
              <span class="value">${income.description || '-'}</span>
            </div>
            <div class="total">
              <p style="margin: 0 0 10px; color: #666;">المبلغ الإجمالي</p>
              <div class="total-amount">${Number(income.total).toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س</div>
            </div>
          </div>
          <div class="footer">
            <p><strong>${company.name || 'الشركة'}</strong></p>
            <p>الرقم الضريبي: ${company.vat_number || '-'}</p>
            <p style="margin-top: 15px;">تم إرسال هذا السند عبر نظام Logistics Systems Pro</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: `سند إيراد رقم ${income.operation_number} - ${company.name || 'الشركة'}`,
      html: htmlContent,
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

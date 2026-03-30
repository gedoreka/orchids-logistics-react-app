import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { query } from "@/lib/db";

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

    const quotationData = await query<any>(
      `SELECT q.*, c.customer_name, c.email as client_email FROM quotations q 
       LEFT JOIN customers c ON q.client_id = c.id 
       WHERE q.id = ? AND q.company_id = ?`,
      [id, company_id]
    );

    if (quotationData.length === 0) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    const quotation = quotationData[0];

    const companyData = await query<any>(
      `SELECT name, vat_number, commercial_number, email as company_email FROM companies WHERE id = ?`,
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
          body { font-family: 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f9ff; margin: 0; padding: 40px 20px; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.05); border: 1px solid #e0f2fe; }
          .header { background: linear-gradient(135deg, #0369a1 0%, #075985 100%); color: white; padding: 40px; text-align: center; position: relative; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.025em; }
          .header p { margin: 10px 0 0; opacity: 0.7; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; }
          .content { padding: 40px; }
          .welcome-text { font-size: 18px; font-weight: 700; margin-bottom: 25px; color: #0c4a6e; text-align: center; }
          .info-card { background: #f0f9ff; border-radius: 16px; padding: 25px; margin-bottom: 30px; }
          .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e0f2fe; }
          .info-row:last-child { border-bottom: none; }
          .label { color: #0369a1; font-size: 13px; font-weight: 700; }
          .value { color: #0c4a6e; font-weight: 800; font-size: 14px; }
          .total-section { text-align: center; margin: 35px 0; padding: 30px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 20px; border: 1px dashed #0ea5e9; }
          .total-label { font-size: 12px; font-weight: 900; color: #0369a1; text-transform: uppercase; margin-bottom: 8px; display: block; }
          .total-amount { font-size: 36px; font-weight: 900; color: #0369a1; }
          .footer { background: #f0f9ff; padding: 35px; text-align: center; border-top: 1px solid #e0f2fe; }
          .company-name { font-size: 16px; font-weight: 900; color: #0c4a6e; margin-bottom: 5px; }
          .company-info { font-size: 12px; color: #0369a1; margin-bottom: 20px; line-height: 1.6; }
          .branding { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 25px; opacity: 0.5; }
          .branding span { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; color: #0369a1; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>عرض سعر رسمي</h1>
            <p>Official Price Quotation</p>
          </div>
          <div class="content">
            <div class="welcome-text">السيد/السادة: ${quotation.client_name || quotation.customer_name}</div>
            <p style="text-align: center; color: #64748b; font-size: 14px; margin-bottom: 30px;">يسرنا تقديم عرض السعر التالي لخدماتنا، تفاصيل العرض مرفقة كملف PDF.</p>
            
            <div class="info-card">
              <div class="info-row">
                <span class="label">رقم العرض:</span>
                <span class="value">${quotation.quotation_number}</span>
              </div>
              <div class="info-row">
                <span class="label">تاريخ العرض:</span>
                <span class="value">${quotation.issue_date}</span>
              </div>
              <div class="info-row">
                <span class="label">تاريخ الانتهاء:</span>
                <span class="value">${quotation.due_date}</span>
              </div>
            </div>

            <div class="total-section">
              <span class="total-label">إجمالي قيمة العرض</span>
              <div class="total-amount">${Number(quotation.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} <span style="font-size: 16px; opacity: 0.6;">ر.س</span></div>
            </div>

            <p style="font-size: 13px; color: #0ea5e9; text-align: center; font-style: italic;">"نتطلع للتعاون معكم وتقديم أفضل الخدمات الاحترافية."</p>
          </div>
          <div class="footer">
            <div class="company-name">${company.name}</div>
            <div class="company-info">
              الرقم الضريبي: ${company.vat_number || '-'}<br>
              ${company.company_email ? `البريد: ${company.company_email}` : ''}
            </div>
            
            <div class="branding">
              <div style="width: 12px; height: 12px; background: #0ea5e9; border-radius: 3px;"></div>
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
        filename: fileName || `Quotation-${quotation.quotation_number}.pdf`,
        content: pdfBase64.split("base64,")[1],
        encoding: "base64",
      });
    }

    await transporter.sendMail({
      from: `"${company.name || process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: `عرض سعر رقم ${quotation.quotation_number} - ${company.name}`,
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

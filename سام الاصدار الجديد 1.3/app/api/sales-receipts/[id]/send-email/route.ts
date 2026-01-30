import { NextRequest, NextResponse } from "next/server";
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

    // Fetch Receipt Data
    const receipts = await query<any>(
      `SELECT sr.*, c.customer_name as system_client_name
       FROM sales_receipts sr
       LEFT JOIN customers c ON sr.client_id = c.id
       WHERE sr.id = ? AND sr.company_id = ?`,
      [id, company_id]
    );

    if (receipts.length === 0) {
      return NextResponse.json({ error: "الإيصال غير موجود" }, { status: 404 });
    }

    const receipt = receipts[0];
    const clientName = receipt.use_custom_client ? receipt.client_name : (receipt.system_client_name || receipt.client_name);

    // Fetch Items
    const items = await query<any>(
      `SELECT * FROM sales_receipt_items WHERE receipt_id = ?`,
      [id]
    );

    // Fetch Company Info
    const companies = await query<any>(
      `SELECT * FROM companies WHERE id = ?`,
      [company_id]
    );
    const company = companies[0];

    if (!company) {
      return NextResponse.json({ error: "الشركة غير موجودة" }, { status: 404 });
    }

    // Prepare Email Content
    const subject = `إيصال مبيعات رقم ${receipt.receipt_number} - ${company.name}`;
    
    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${item.product_name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${Number(item.unit_price).toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${Number(item.total_with_vat).toFixed(2)}</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 40px; text-align: center; }
          .content { padding: 40px; }
          .info-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
          .info-box { background: #f1f5f9; padding: 15px; border-radius: 12px; }
          .label { color: #64748b; font-size: 12px; font-weight: bold; margin-bottom: 5px; display: block; }
          .value { color: #1e293b; font-size: 14px; font-weight: 800; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #f8fafc; color: #64748b; font-size: 12px; padding: 12px; text-align: center; border-bottom: 2px solid #e2e8f0; }
          .total-box { margin-top: 30px; background: #0f172a; color: white; padding: 25px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; }
          .footer { padding: 30px; text-align: center; color: #94a3b8; font-size: 11px; border-top: 1px solid #f1f5f9; }
          .brand { color: #3b82f6; font-weight: 900; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">إيصال مبيعات</h1>
            <p style="margin: 10px 0 0; opacity: 0.7; font-size: 14px;">Sales Receipt</p>
          </div>
          
          <div class="content">
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #1e293b; margin: 0;">مرحباً ${clientName}</h2>
              <p style="color: #64748b; margin: 5px 0;">نرفق لكم تفاصيل إيصال المبيعات الخاص بكم</p>
            </div>

            <div class="info-grid">
              <div class="info-box">
                <span class="label">رقم الإيصال</span>
                <span class="value">${receipt.receipt_number}</span>
              </div>
              <div class="info-box">
                <span class="label">التاريخ</span>
                <span class="value">${receipt.receipt_date}</span>
              </div>
            </div>

            <div class="info-box" style="margin-bottom: 30px;">
              <span class="label">المنشأة المصدرة</span>
              <span class="value">${company.name}</span>
              <div style="font-size: 12px; color: #64748b; margin-top: 5px;">الرقم الضريبي: ${company.vat_number}</div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>البند</th>
                  <th>الكمية</th>
                  <th>السعر</th>
                  <th>الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml || `
                  <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">مبيعات عامة</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">1</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${Number(receipt.amount).toFixed(2)}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${Number(receipt.amount).toFixed(2)}</td>
                  </tr>
                `}
              </tbody>
            </table>

            <div class="total-box">
              <div>
                <span style="font-size: 12px; opacity: 0.7; display: block;">الإجمالي النهائي</span>
                <span style="font-weight: 900;">شامل الضريبة</span>
              </div>
              <div style="text-align: left;">
                <span style="font-size: 28px; font-weight: 900;">${Number(receipt.total_amount || receipt.amount).toFixed(2)}</span>
                <span style="font-size: 14px; opacity: 0.7;">ر.س</span>
              </div>
            </div>

            <div style="margin-top: 30px; text-align: center; font-size: 13px; color: #64748b; font-style: italic;">
              نشكركم لتعاملكم معنا. هذا الإيصال تم إنشاؤه إلكترونياً.
            </div>
          </div>

          <div class="footer">
            <div style="margin-bottom: 10px;">
              <span class="brand">Logistics Systems Pro</span>
              <span style="margin: 0 10px;">|</span>
              <span>نظام إدارة الخدمات اللوجستية المتكامل</span>
            </div>
            <p>© ${new Date().getFullYear()} جميع الحقوق محفوظة لشركة ${company.name}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send using nodemailer
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.default.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${company.name}" <${process.env.SMTP_FROM}>`,
      to: email,
      subject,
      html
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error sending receipt email:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

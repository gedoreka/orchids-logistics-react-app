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

    const quotations = await query<any>(
      `SELECT q.*, c.customer_name, c.company_name as client_company
       FROM quotations q
       LEFT JOIN customers c ON q.client_id = c.id
       WHERE q.id = ? AND q.company_id = ?`,
      [id, company_id]
    );

    if (!quotations || quotations.length === 0) {
      return NextResponse.json({ error: "عرض السعر غير موجود" }, { status: 404 });
    }

    const quotation = quotations[0];

    const items = await query<any>(`SELECT * FROM quotation_items WHERE quotation_id = ?`, [id]);

    const companies = await query<any>(`SELECT * FROM companies WHERE id = ?`, [company_id]);
    const company = companies?.[0] || { name: 'الشركة' };

    const itemsHtml = (items || []).map(item => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #eee;text-align:right">${item.product_name}</td>
        <td style="padding:12px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
        <td style="padding:12px;border-bottom:1px solid #eee;text-align:center">${Number(item.price).toFixed(2)}</td>
        <td style="padding:12px;border-bottom:1px solid #eee;text-align:center">${Number(item.total).toFixed(2)}</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f8fafc; margin:0; }
          .container{max-width:600px;margin:20px auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0}
          .header{background:linear-gradient(135deg,#0f172a,#1e293b);color:#fff;padding:36px;text-align:center}
          .content{padding:30px}
          table{width:100%;border-collapse:collapse}
          th{background:#f8fafc;color:#64748b;padding:12px;border-bottom:2px solid #e2e8f0}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0;font-size:22px">عرض سعر</h1>
            <p style="margin:6px 0 0;opacity:0.8">Price Quotation</p>
          </div>
          <div class="content">
            <div style="text-align:center;margin-bottom:20px">
              <h2 style="margin:0;color:#1e293b">مرحباً</h2>
              <p style="color:#64748b">نرفق لكم عرض السعر المطلوب</p>
            </div>

            <div style="margin-bottom:20px">
              <strong>الرقم:</strong> ${quotation.quotation_number} &nbsp; &nbsp;
              <strong>التاريخ:</strong> ${quotation.issue_date}
            </div>

            <div style="margin-bottom:20px">
              <strong>المنشأة:</strong> ${company.name}
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
                ${itemsHtml || `<tr><td style="padding:12px;text-align:right">خدمات عامة</td><td style="text-align:center">1</td><td style="text-align:center">${Number(quotation.total_amount).toFixed(2)}</td><td style="text-align:center">${Number(quotation.total_amount).toFixed(2)}</td></tr>`}
              </tbody>
            </table>

            <div style="margin-top:24px;text-align:center;color:#64748b;font-size:13px">
              شكراً لتواصلكم معنا.
            </div>
          </div>
          <div style="padding:20px;text-align:center;color:#94a3b8;font-size:11px;border-top:1px solid #f1f5f9">
            © ${new Date().getFullYear()} ${company.name}
          </div>
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
      subject: `عرض سعر رقم ${quotation.quotation_number} - ${company.name}`,
      html
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error sending quotation email:", error);
    return NextResponse.json({ error: error?.message || 'Failed to send' }, { status: 500 });
  }
}

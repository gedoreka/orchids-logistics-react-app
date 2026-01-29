import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import nodemailer from "nodemailer";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { commission_id, commissionId, email: manualEmail } = body;
    const finalId = commission_id || commissionId;

    if (!finalId) {
      return NextResponse.json({ error: "Missing commission_id" }, { status: 400 });
    }

    // 1. Fetch Commission Data
    const commissions = await query<any>(
      `SELECT ec.*, e.name as employee_name, e.email as employee_email, e.user_code, e.iqama_number 
       FROM employee_commissions ec
       JOIN employees e ON ec.employee_id = e.id
       WHERE ec.id = ?`,
      [finalId]
    );

    if (commissions.length === 0) {
      return NextResponse.json({ error: "Commission not found" }, { status: 404 });
    }

    const comm = commissions[0];
    const targetEmail = manualEmail || comm.employee_email;

    if (!targetEmail) {
      return NextResponse.json({ error: "Employee email not found. Please provide an email." }, { status: 400 });
    }

    // 2. Fetch Company Info
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("auth_session");
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const session = JSON.parse(sessionCookie.value);
    const companyId = session.company_id;

    const companies = await query<any>(
      "SELECT name, logo_path, phone, vat_number, commercial_number FROM companies WHERE id = ?",
      [companyId]
    );
    const company = companies[0] || { name: "ZoolSpeed Logistics" };

    // 3. Prepare Email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const isPaid = comm.status === 'paid';
    const netAmount = (comm.mode.startsWith("fixed") ? Number(comm.total) : Number(comm.commission)) + Number(comm.bonus) - Number(comm.deduction);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #334155; margin: 0; padding: 0; }
          .container { max-width: 650px; margin: 20px auto; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; background-color: #ffffff; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
          .header { background-color: ${isPaid ? '#059669' : '#e11d48'}; padding: 40px 30px; text-align: center; color: #ffffff; }
          .header h2 { margin: 0; font-size: 26px; font-weight: 900; }
          .header p { margin: 10px 0 0; opacity: 0.9; font-size: 14px; }
          .content { padding: 40px; }
          .section-title { color: #94a3b8; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px; }
          .employee-info { margin-bottom: 30px; border-bottom: 2px solid #f8fafc; padding-bottom: 20px; }
          .employee-name { margin: 0; color: #0f172a; font-size: 22px; font-weight: 900; }
          .employee-meta { color: #64748b; font-size: 13px; font-weight: 600; margin-top: 5px; }
          .notice-box { padding: 20px; margin-bottom: 30px; border-radius: 12px; font-weight: 600; border-right: 4px solid ${isPaid ? '#059669' : '#e11d48'}; background-color: ${isPaid ? '#f0fdf4' : '#fff1f2'}; }
          .details-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #f1f5f9; }
          .details-table td { padding: 15px 20px; font-size: 14px; }
          .label { color: #64748b; font-weight: 600; }
          .value { font-weight: 800; color: #0f172a; text-align: right; }
          .total-row { border-top: 2px solid #e2e8f0; }
          .total-label { color: #0f172a; font-size: 18px; font-weight: 900; }
          .total-value { font-size: 26px; font-weight: 950; color: ${isPaid ? '#059669' : '#e11d48'}; text-align: right; }
          .footer { border-top: 1px solid #f1f5f9; padding: 30px; text-align: center; color: #94a3b8; font-size: 13px; }
          .app-footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #94a3b8; font-size: 11px; font-weight: 600; border-top: 1px solid #f1f5f9; }
          .bilingual { display: flex; justify-content: space-between; gap: 20px; }
          .rtl { direction: rtl; text-align: right; }
          .ltr { direction: ltr; text-align: left; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="bilingual">
              <div class="rtl">
                <h2>${isPaid ? 'سند صرف عمولة' : 'إشعار استحقاق مالي'}</h2>
              </div>
              <div class="ltr">
                <h2>${isPaid ? 'Commission Payment Receipt' : 'Payment Reminder Notice'}</h2>
              </div>
            </div>
            <p>${company.name}</p>
          </div>
          
          <div class="content">
            <div class="employee-info">
              <div class="bilingual">
                <div class="rtl">
                  <p class="section-title">بيانات الموظف</p>
                  <h3 class="employee-name">${comm.employee_name}</h3>
                  <div class="employee-meta">كود: ${comm.user_code} | هوية: ${comm.iqama_number}</div>
                </div>
                <div class="ltr">
                  <p class="section-title">Employee Details</p>
                  <h3 class="employee-name">${comm.employee_name}</h3>
                  <div class="employee-meta">Code: ${comm.user_code} | ID: ${comm.iqama_number}</div>
                </div>
              </div>
            </div>

            <div class="notice-box">
              <div class="bilingual">
                <div class="rtl">
                  ${isPaid ? `
                    تم إيداع مستحقاتكم المالية بنجاح لعمولات شهر <b>${comm.month}</b>. نسعد بجهودكم المستمرة.
                  ` : `
                    نود إحاطتكم بوجود مستحقات مالية معلقة لشهر <b>${comm.month}</b>. نرجو مراجعة الإدارة المالية.
                  `}
                </div>
                <div class="ltr">
                  ${isPaid ? `
                    Your commission for <b>${comm.month}</b> has been successfully paid. We appreciate your hard work.
                  ` : `
                    You have an outstanding payment for <b>${comm.month}</b>. Please contact the finance department.
                  `}
                </div>
              </div>
            </div>

            <table class="details-table">
              <tr>
                <td class="label rtl">الفترة الزمنية / Period:</td>
                <td class="value">${comm.month}</td>
              </tr>
              <tr>
                <td class="label rtl">نظام الاحتساب / Mode:</td>
                <td class="value">${comm.mode === 'fixed_daily' ? 'Daily Fixed' : comm.mode === 'fixed_monthly' ? 'Monthly Fixed' : 'Percentage %'}</td>
              </tr>
              <tr>
                <td class="label rtl">العمولة الأساسية / Base Commission:</td>
                <td class="value">${(comm.mode.startsWith("fixed") ? Number(comm.total) : Number(comm.commission)).toLocaleString()} SAR</td>
              </tr>
              <tr>
                <td class="label rtl">إضافات / Bonuses (+):</td>
                <td class="value" style="color: #059669;">${Number(comm.bonus).toLocaleString()} SAR</td>
              </tr>
              <tr>
                <td class="label rtl">خصومات / Deductions (-):</td>
                <td class="value" style="color: #e11d48;">${Number(comm.deduction).toLocaleString()} SAR</td>
              </tr>
              <tr class="total-row">
                <td class="total-label rtl">الصافي المستحق / Net Total:</td>
                <td class="total-value">${netAmount.toLocaleString()} SAR</td>
              </tr>
            </table>

            <div class="footer">
              <div class="bilingual">
                <div class="rtl">
                  <p>هذا الإشعار رسمي صادر عن ${company.name}</p>
                  ${company.phone ? `<p style="font-weight: 700; margin-top: 5px;">للاستفسار: ${company.phone}</p>` : ''}
                </div>
                <div class="ltr">
                  <p>Official notice from ${company.name}</p>
                  ${company.phone ? `<p style="font-weight: 700; margin-top: 5px;">Contact: ${company.phone}</p>` : ''}
                </div>
              </div>
            </div>
          </div>
          
          <div class="app-footer">
            Bilingual Document Issued via <b>Logistics Systems Pro</b><br/>
            All Rights Reserved © 2026
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"${company.name} | Logistics Systems Pro" <${process.env.SMTP_FROM}>`,
      to: targetEmail,
      subject: isPaid 
        ? `[Receipt] Commission Payment - ${comm.month} | سند صرف عمولة` 
        : `[Urgent] Payment Reminder - ${comm.month} | إشعار استحقاق مالي`,
      html: htmlContent,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Email Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

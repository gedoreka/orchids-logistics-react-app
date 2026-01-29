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
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Tahoma', 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f4f7f9; }
          .wrapper { width: 100%; table-layout: fixed; background-color: #f4f7f9; padding-bottom: 40px; }
          .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; font-family: sans-serif; color: #4a4a4a; }
          .header { background-color: ${isPaid ? '#059669' : '#e11d48'}; padding: 40px 20px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; }
          .header p { color: #ffffff; margin: 10px 0 0; opacity: 0.8; font-size: 16px; }
          .content { padding: 40px 30px; }
          .info-table { width: 100%; border-spacing: 0; margin-bottom: 25px; }
          .info-table td { padding: 12px 0; border-bottom: 1px solid #f0f4f8; }
          .label { color: #64748b; font-size: 13px; font-weight: bold; width: 40%; }
          .value { color: #0f172a; font-size: 14px; font-weight: bold; text-align: left; }
          .notice-box { padding: 25px; border-radius: 12px; margin-bottom: 30px; text-align: center; font-size: 15px; line-height: 1.6; }
          .notice-paid { background-color: #f0fdf4; border: 1px solid #bcf0da; color: #03543f; }
          .notice-unpaid { background-color: #fff1f2; border: 1px solid #fecaca; color: #991b1b; }
          .amount-card { background-color: #f8fafc; border-radius: 16px; padding: 30px; text-align: center; border: 1px solid #e2e8f0; }
          .amount-label { color: #64748b; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
          .amount-value { color: ${isPaid ? '#059669' : '#e11d48'}; font-size: 36px; font-weight: 900; margin: 10px 0; }
          .footer { padding: 30px; text-align: center; font-size: 12px; color: #94a3b8; }
          .btn { display: inline-block; padding: 14px 30px; background-color: ${isPaid ? '#059669' : '#e11d48'}; color: #ffffff !important; text-decoration: none; border-radius: 10px; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <center class="wrapper">
          <table class="main">
            <tr>
              <td class="header">
                <h1>${isPaid ? 'سند صرف عمولة' : 'إشعار استحقاق مالي'}</h1>
                <p>${isPaid ? 'Commission Payment Receipt' : 'Payment Entitlement Notice'}</p>
              </td>
            </tr>
            <tr>
              <td class="content">
                <div class="notice-box ${isPaid ? 'notice-paid' : 'notice-unpaid'}">
                  ${isPaid ? `
                    <b>تهانينا!</b> تم صرف عمولة شهر <b>${comm.month}</b> بنجاح.
                    <br/>
                    Congratulations! Your commission for <b>${comm.month}</b> has been processed.
                  ` : `
                    <b>تنبيه هام:</b> يوجد لديك مستحقات مالية معلقة لشهر <b>${comm.month}</b>.
                    <br/>
                    Urgent: You have outstanding commission entitlements for <b>${comm.month}</b>.
                  `}
                </div>

                <table class="info-table">
                  <tr>
                    <td class="label">الموظف / Employee</td>
                    <td class="value">${comm.employee_name}</td>
                  </tr>
                  <tr>
                    <td class="label">الكود / Code</td>
                    <td class="value">${comm.user_code}</td>
                  </tr>
                  <tr>
                    <td class="label">رقم الهوية / ID</td>
                    <td class="value">${comm.iqama_number}</td>
                  </tr>
                  <tr>
                    <td class="label">الشهر / Month</td>
                    <td class="value">${comm.month}</td>
                  </tr>
                  <tr>
                    <td class="label">نوع العمولة / Type</td>
                    <td class="value">${comm.mode === 'fixed_daily' ? 'Daily Fixed' : comm.mode === 'fixed_monthly' ? 'Monthly Fixed' : 'Percentage %'}</td>
                  </tr>
                </table>

                <div class="amount-card">
                  <div class="amount-label">الصافي المستحق / Net Amount Due</div>
                  <div class="amount-value">${netAmount.toLocaleString()} SAR</div>
                  <p style="font-size: 11px; color: #94a3b8; margin: 0;">
                    ${isPaid ? 'تم التحويل إلى حسابكم البنكي المعتمد' : 'يرجى مراجعة الإدارة المالية لاستلام مستحقاتكم'}
                  </p>
                </div>

                <div style="text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}" class="btn">
                    ${isPaid ? 'عرض التفاصيل / View Details' : 'مراجعة الآن / Review Now'}
                  </a>
                </div>
              </td>
            </tr>
            <tr>
              <td class="footer">
                <p>هذا البريد مرسل آلياً من نظام <b>Logistics Systems Pro</b></p>
                <p>© 2026 ${company.name}. جميع الحقوق محفوظة.</p>
              </td>
            </tr>
          </table>
        </center>
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

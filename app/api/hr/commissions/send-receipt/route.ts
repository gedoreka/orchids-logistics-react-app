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
      <html dir="rtl">
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; background-color: #f1f5f9; }
          .wrapper { padding: 40px 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
          .header { background: ${isPaid ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)'}; padding: 50px 40px; text-align: center; color: #ffffff; position: relative; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px; }
          .header p { margin: 10px 0 0; opacity: 0.9; font-size: 15px; font-weight: 600; }
          .status-badge { display: inline-block; padding: 6px 16px; background: rgba(255,255,255,0.2); border-radius: 100px; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-top: 20px; border: 1px solid rgba(255,255,255,0.3); }
          .content { padding: 40px; }
          .welcome-text { text-align: center; margin-bottom: 40px; }
          .welcome-text h2 { margin: 0; font-size: 24px; font-weight: 900; color: #0f172a; }
          .welcome-text p { margin: 10px 0 0; color: #64748b; font-size: 15px; }
          .details-card { background-color: #f8fafc; border-radius: 20px; padding: 30px; border: 1px solid #f1f5f9; margin-bottom: 30px; }
          .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px dashed #e2e8f0; }
          .detail-row:last-child { border-bottom: none; }
          .label { color: #64748b; font-size: 13px; font-weight: 700; }
          .value { color: #0f172a; font-size: 14px; font-weight: 800; }
          .amount-section { text-align: center; padding: 30px; background: ${isPaid ? '#f0fdf4' : '#fff1f2'}; border-radius: 20px; margin-bottom: 30px; border: 2px solid ${isPaid ? '#dcfce7' : '#fee2e2'}; }
          .amount-label { font-size: 12px; font-weight: 800; color: ${isPaid ? '#166534' : '#991b1b'}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; display: block; }
          .amount-value { font-size: 36px; font-weight: 950; color: ${isPaid ? '#059669' : '#dc2626'}; }
          .amount-currency { font-size: 16px; font-weight: 700; margin-right: 5px; opacity: 0.7; }
          .action-box { text-align: center; padding: 25px; border-radius: 20px; background-color: #0f172a; color: #ffffff; margin-bottom: 30px; }
          .action-box p { margin: 0; font-size: 14px; font-weight: 600; line-height: 1.6; }
          .footer { text-align: center; padding: 40px; border-top: 1px solid #f1f5f9; background-color: #f8fafc; }
          .footer p { margin: 0; color: #94a3b8; font-size: 12px; font-weight: 600; }
          .footer .company-name { color: #475569; font-size: 14px; font-weight: 800; margin-bottom: 5px; display: block; }
          .bilingual { display: flex; flex-direction: column; gap: 5px; }
          .ar { font-weight: 800; }
          .en { font-size: 12px; opacity: 0.8; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <div class="bilingual">
                <div class="ar"><h1>${isPaid ? 'سند صرف عمولة' : 'إشعار استحقاق مالي'}</h1></div>
                <div class="en">${isPaid ? 'Commission Disbursement Receipt' : 'Financial Due Notification'}</div>
              </div>
              <p>${company.name}</p>
              <div class="status-badge">${isPaid ? 'مدفوع / PAID' : 'مستحق / UNPAID'}</div>
            </div>
            
            <div class="content">
              <div class="welcome-text">
                <div class="bilingual">
                  <div class="ar"><h2>عزيزي، ${comm.employee_name}</h2></div>
                  <div class="en">Dear, ${comm.employee_name}</div>
                </div>
              </div>

              <div class="amount-section">
                <span class="amount-label">
                  <div class="bilingual">
                    <div class="ar">الصافي المستحق</div>
                    <div class="en">Net Payable Amount</div>
                  </div>
                </span>
                <div class="amount-value">
                  <span class="amount-currency">SAR</span>${netAmount.toLocaleString()}
                </div>
              </div>

              <div class="details-card">
                <div class="detail-row">
                  <span class="label">الفترة / Month</span>
                  <span class="value">${comm.month}</span>
                </div>
                <div class="detail-row">
                  <span class="label">كود الموظف / ID</span>
                  <span class="value">${comm.user_code}</span>
                </div>
                <div class="detail-row">
                  <span class="label">نوع العمولة / Type</span>
                  <span class="value">${comm.mode === 'fixed_daily' ? 'يومي ثابت / Daily' : comm.mode === 'fixed_monthly' ? 'شهري ثابت / Monthly' : 'نسبة مئوية / Percentage'}</span>
                </div>
                <div class="detail-row">
                  <span class="label">الإضافات / Bonus</span>
                  <span class="value" style="color: #059669;">+ ${Number(comm.bonus).toLocaleString()}</span>
                </div>
                <div class="detail-row">
                  <span class="label">الخصومات / Deductions</span>
                  <span class="value" style="color: #dc2626;">- ${Number(comm.deduction).toLocaleString()}</span>
                </div>
              </div>

              <div class="action-box">
                <div class="bilingual">
                  ${isPaid ? `
                    <div class="ar"><p>تم تحويل مستحقاتك المالية بنجاح. شكراً لجهودك المتميزة.</p></div>
                    <div class="en"><p>Your payment has been successfully processed. Thank you for your hard work.</p></div>
                  ` : `
                    <div class="ar"><p>نحيطكم علماً بوجود مستحقات مالية معلقة. يرجى مراجعة الإدارة المالية لاتمام الصرف.</p></div>
                    <div class="en"><p>This is a notice for an outstanding payment. Please contact finance to finalize the disbursement.</p></div>
                  `}
                </div>
              </div>
            </div>
            
            <div class="footer">
              <span class="company-name">${company.name}</span>
              <div class="bilingual">
                <div class="ar"><p>هذا المستند صادر آلياً من نظام إدارة اللوجستيات</p></div>
                <div class="en"><p>This is an automated document from Logistics Management System</p></div>
              </div>
            </div>
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

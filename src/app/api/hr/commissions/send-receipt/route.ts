import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import nodemailer from "nodemailer";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { commission_id, email: manualEmail } = body;

    if (!commission_id) {
      return NextResponse.json({ error: "Missing commission_id" }, { status: 400 });
    }

    // 1. Fetch Commission Data
    const commissions = await query<any>(
      `SELECT ec.*, e.name as employee_name, e.email as employee_email, e.user_code, e.iqama_number 
       FROM employee_commissions ec
       JOIN employees e ON ec.employee_id = e.id
       WHERE ec.id = ?`,
      [commission_id]
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

    const netAmount = (comm.mode.startsWith("fixed") ? Number(comm.total) : Number(comm.commission)) + Number(comm.bonus) - Number(comm.deduction);

    const htmlContent = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #1e293b; padding: 30px; text-align: center; color: #ffffff;">
          <h2 style="margin: 0; font-size: 24px;">سند تأكيد صرف عمولة</h2>
          <p style="margin: 5px 0 0; opacity: 0.8;">${company.name}</p>
        </div>
        
        <div style="padding: 30px;">
          <div style="margin-bottom: 25px; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px;">
            <p style="margin: 0; color: #64748b; font-size: 12px; font-weight: bold; text-transform: uppercase;">بيانات الموظف</p>
            <h3 style="margin: 5px 0; color: #0f172a;">${comm.employee_name}</h3>
            <p style="margin: 0; color: #64748b; font-size: 14px;">كود الموظف: ${comm.user_code} | رقم الإقامة: ${comm.iqama_number}</p>
          </div>

          <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">الفترة (الشهر):</td>
                <td style="padding: 8px 0; text-align: left; font-weight: bold; color: #0f172a;">${comm.month}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">نوع العمولة:</td>
                <td style="padding: 8px 0; text-align: left; font-weight: bold; color: #0f172a;">${comm.mode === 'fixed_daily' ? 'مبلغ ثابت (يومي)' : comm.mode === 'fixed_monthly' ? 'مبلغ ثابت (شهري)' : 'نسبة مئوية'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">قيمة العمولة المستحقة:</td>
                <td style="padding: 8px 0; text-align: left; font-weight: bold; color: #3b82f6;">${(comm.mode.startsWith("fixed") ? Number(comm.total) : Number(comm.commission)).toLocaleString()} ر.س</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">المكافآت:</td>
                <td style="padding: 8px 0; text-align: left; font-weight: bold; color: #10b981;">+ ${Number(comm.bonus).toLocaleString()} ر.س</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">الخصومات:</td>
                <td style="padding: 8px 0; text-align: left; font-weight: bold; color: #ef4444;">- ${Number(comm.deduction).toLocaleString()} ر.س</td>
              </tr>
              <tr style="border-top: 1px solid #e2e8f0;">
                <td style="padding: 15px 0 0; color: #0f172a; font-size: 16px; font-weight: bold;">إجمالي الصافي:</td>
                <td style="padding: 15px 0 0; text-align: left; font-size: 20px; font-weight: 900; color: #0f172a;">${netAmount.toLocaleString()} ر.س</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin-bottom: 25px;">
            <span style="display: inline-block; padding: 8px 20px; border-radius: 50px; background-color: #ecfdf5; color: #059669; font-weight: bold; font-size: 14px;">
              حالة السداد: ${comm.status === 'paid' ? 'تم الدفع بنجاح' : 'بانتظار الصرف'}
            </span>
          </div>

          <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
            <p style="margin: 0;">شكراً لجهودكم المتميزة مع ${company.name}</p>
            ${company.phone ? `<p style="margin: 5px 0 0;">للتواصل: ${company.phone}</p>` : ''}
          </div>
        </div>
        
        <div style="background-color: #f8fafc; padding: 15px; text-align: center; color: #cbd5e1; font-size: 10px;">
          تم إنشاء هذا السند آلياً عبر نظام ZoolSpeed. جميع الحقوق محفوظة © 2026
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || company.name}" <${process.env.SMTP_FROM}>`,
      to: targetEmail,
      subject: `سند تأكيد صرف عمولة - ${comm.month}`,
      html: htmlContent,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Email Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

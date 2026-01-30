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

    const isPaid = comm.status === 'paid';
    const netAmount = (comm.mode.startsWith("fixed") ? Number(comm.total) : Number(comm.commission)) + Number(comm.bonus) - Number(comm.deduction);

    const htmlContent = `
      <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; background-color: #ffffff; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
        <div style="background-color: ${isPaid ? '#0f172a' : '#92400e'}; padding: 40px 30px; text-align: center; color: #ffffff; position: relative; overflow: hidden;">
          <div style="position: relative; z-index: 10;">
            <h2 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px;">${isPaid ? 'سند تأكيد صرف عمولة' : 'إشعار استحقاق مالي'}</h2>
            <p style="margin: 10px 0 0; opacity: 0.9; font-size: 16px; font-weight: 500;">${company.name}</p>
          </div>
          <div style="position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: rgba(255,255,255,0.05); border-radius: 50%;"></div>
        </div>
        
        <div style="padding: 40px;">
          <div style="margin-bottom: 35px; border-bottom: 2px solid #f8fafc; padding-bottom: 20px;">
            <p style="margin: 0; color: #94a3b8; font-size: 11px; font-weight: 900; text-transform: uppercase; tracking: 1.5px;">بيانات المستحق</p>
            <h3 style="margin: 8px 0; color: #0f172a; font-size: 22px; font-weight: 900;">السيد/ ${comm.employee_name}</h3>
            <div style="display: flex; gap: 15px; margin-top: 5px;">
              <span style="color: #64748b; font-size: 13px; font-weight: 600;">كود: ${comm.user_code}</span>
              <span style="color: #64748b; font-size: 13px; font-weight: 600;">|</span>
              <span style="color: #64748b; font-size: 13px; font-weight: 600;">رقم الهوية: ${comm.iqama_number}</span>
            </div>
          </div>

          ${!isPaid ? `
          <div style="background-color: #fffbeb; border-right: 4px solid #f59e0b; padding: 20px; margin-bottom: 30px; border-radius: 8px;">
            <p style="margin: 0; color: #92400e; font-size: 15px; line-height: 1.6; font-weight: 600;">
              نود إحاطتكم علماً بوجود مستحقات مالية معلقة خاصة بعمولات شهر <b>${comm.month}</b>. 
              نرجو منكم التكرم بمراجعة القسم المالي لاستكمال إجراءات الصرف في أقرب وقت ممكن لضمان انتظام العمليات المالية.
            </p>
          </div>
          ` : `
          <div style="background-color: #f0fdf4; border-right: 4px solid #22c55e; padding: 20px; margin-bottom: 30px; border-radius: 8px;">
            <p style="margin: 0; color: #166534; font-size: 15px; line-height: 1.6; font-weight: 600;">
              تم اعتماد وإيداع مستحقاتكم المالية بنجاح لعمولات شهر <b>${comm.month}</b>. 
              نسعد بجهودكم المستمرة ونتمنى لكم مزيداً من النجاح والتوفيق.
            </p>
          </div>
          `}

          <div style="background-color: #f8fafc; border-radius: 16px; padding: 30px; margin-bottom: 35px; border: 1px solid #f1f5f9;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; color: #64748b; font-size: 14px; font-weight: 600;">الفترة الزمنية:</td>
                <td style="padding: 12px 0; text-align: left; font-weight: 800; color: #0f172a;">${comm.month}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #64748b; font-size: 14px; font-weight: 600;">نظام الاحتساب:</td>
                <td style="padding: 12px 0; text-align: left; font-weight: 800; color: #0f172a;">${comm.mode === 'fixed_daily' ? 'مبلغ ثابت (يومي)' : comm.mode === 'fixed_monthly' ? 'مبلغ ثابت (شهري)' : 'نسبة مئوية'}</td>
              </tr>
              <tr style="border-bottom: 1px dashed #e2e8f0;">
                <td style="padding: 12px 0; color: #64748b; font-size: 14px; font-weight: 600;">العمولة الأساسية:</td>
                <td style="padding: 12px 0; text-align: left; font-weight: 800; color: #3b82f6;">${(comm.mode.startsWith("fixed") ? Number(comm.total) : Number(comm.commission)).toLocaleString()} ر.س</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #64748b; font-size: 14px; font-weight: 600;">إضافات / مكافآت:</td>
                <td style="padding: 12px 0; text-align: left; font-weight: 800; color: #10b981;">+ ${Number(comm.bonus).toLocaleString()} ر.س</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #64748b; font-size: 14px; font-weight: 600;">خصومات إدارية:</td>
                <td style="padding: 12px 0; text-align: left; font-weight: 800; color: #ef4444;">- ${Number(comm.deduction).toLocaleString()} ر.س</td>
              </tr>
              <tr style="border-top: 2px solid #e2e8f0;">
                <td style="padding: 20px 0 0; color: #0f172a; font-size: 18px; font-weight: 900;">الصافي المستحق:</td>
                <td style="padding: 20px 0 0; text-align: left; font-size: 26px; font-weight: 950; color: ${isPaid ? '#0f172a' : '#92400e'};">${netAmount.toLocaleString()} ر.س</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin-bottom: 35px;">
            <div style="display: inline-block; padding: 12px 30px; border-radius: 50px; background-color: ${isPaid ? '#ecfdf5' : '#fff7ed'}; color: ${isPaid ? '#059669' : '#c2410c'}; font-weight: 900; font-size: 15px; border: 1px solid ${isPaid ? '#d1fae5' : '#ffedd5'};">
              حالة العملية: ${isPaid ? 'تم صرف المستحقات' : 'بانتظار السداد والمراجعة'}
            </div>
          </div>

          <div style="border-top: 1px solid #f1f5f9; padding-top: 30px; text-align: center; color: #94a3b8; font-size: 13px;">
            <p style="margin: 0; font-weight: 600;">هذا الإشعار رسمي صادر عن ${company.name}</p>
            ${company.phone ? `<p style="margin: 8px 0 0; font-weight: 700;">للمراجعة والاستفسار: ${company.phone}</p>` : ''}
          </div>
        </div>
        
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; color: #94a3b8; font-size: 11px; font-weight: 600; border-top: 1px solid #f1f5f9;">
          صدر هذا المستند آلياً عبر منصة <b>Logistics Systems Pro</b><br/>
          جميع الحقوق محفوظة © 2026
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"${company.name} | Logistics Systems Pro" <${process.env.SMTP_FROM}>`,
      to: targetEmail,
      subject: `${isPaid ? 'تأكيد صرف عمولة' : 'تنبيه استحقاق مالي'} - ${comm.month}`,
      html: htmlContent,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Email Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

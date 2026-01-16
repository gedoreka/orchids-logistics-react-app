import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { cookies } from "next/headers";
import nodemailer from "nodemailer";

async function getCompanyInfo() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  if (!sessionCookie) return null;
  const session = JSON.parse(sessionCookie.value);
  
  const companies = await query<any>(
    "SELECT id, name, commercial_number FROM companies WHERE id = ?",
    [session.company_id]
  );
  
  if (!companies || companies.length === 0) return null;
  
  const company = companies[0];
  
  const users = await query<any>(
    "SELECT email FROM users WHERE id = ?",
    [session.user_id]
  );
  
  if (users && users.length > 0) {
    company.email = users[0].email;
  }
  
  return company;
}

export async function POST(request: NextRequest) {
  try {
    const company = await getCompanyInfo();
    if (!company) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { recipientEmail, task } = body;

    if (!recipientEmail || !task) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    const now = new Date();
    const dateOptions: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    const timeOptions: Intl.DateTimeFormatOptions = { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    };
    const arabicDate = now.toLocaleDateString('ar-SA', dateOptions);
    const arabicTime = now.toLocaleTimeString('ar-SA', timeOptions);

    const priorityLabels: Record<string, string> = {
      high: "عالية",
      medium: "متوسطة", 
      low: "منخفضة"
    };

    const statusLabels: Record<string, string> = {
      pending: "قيد الانتظار",
      in_progress: "قيد التنفيذ",
      completed: "مكتملة",
      cancelled: "ملغاة"
    };

    const priorityColors: Record<string, string> = {
      high: "#ef4444",
      medium: "#f59e0b",
      low: "#22c55e"
    };

    const subject = `مهمة جديدة: ${task.title} | ${company.name}`;
    
    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); min-height: 100vh;">
        <div style="max-width: 650px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%); backdrop-filter: blur(20px); border-radius: 32px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
            
            <div style="background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%); padding: 50px 40px; text-align: center; position: relative;">
              <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #a78bfa, #818cf8, #60a5fa, #818cf8, #a78bfa); background-size: 200% 100%;"></div>
              <div style="width: 100px; height: 100px; background: rgba(255,255,255,0.2); border-radius: 24px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.2);">
                <span style="font-size: 50px;">📋</span>
              </div>
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin: 0 0 12px 0; text-shadow: 0 4px 20px rgba(0,0,0,0.3);">مهمة جديدة</h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 0; font-weight: 500;">تم تعيين مهمة جديدة لك</p>
            </div>
            
            <div style="padding: 50px 40px; background: #ffffff;">
              <div style="text-align: center; margin-bottom: 35px;">
                <p style="font-size: 20px; color: #1e293b; line-height: 1.8; margin: 0;">
                  السلام عليكم ورحمة الله وبركاته
                </p>
              </div>
              
              <div style="background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%); border-radius: 20px; padding: 30px; margin-bottom: 30px; border: 1px solid #c4b5fd;">
                <h2 style="color: #5b21b6; font-size: 22px; font-weight: 800; margin: 0 0 15px 0; text-align: center;">${task.title}</h2>
                ${task.description ? `<p style="color: #6b7280; font-size: 15px; line-height: 1.8; margin: 0; text-align: center;">${task.description}</p>` : ''}
              </div>
              
              <div style="background: #f8fafc; border-radius: 20px; padding: 25px; margin-bottom: 30px; border: 1px solid #e2e8f0;">
                <h3 style="color: #334155; font-size: 16px; margin: 0 0 20px 0; font-weight: 700; text-align: center;">تفاصيل المهمة</h3>
                
                <div style="display: flex; flex-direction: column; gap: 15px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: white; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 14px; font-weight: 600;">🎯 الأولوية</span>
                    <span style="color: ${priorityColors[task.priority] || '#64748b'}; font-size: 14px; font-weight: 700;">${priorityLabels[task.priority] || task.priority}</span>
                  </div>
                  
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: white; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 14px; font-weight: 600;">📊 الحالة</span>
                    <span style="color: #1e293b; font-size: 14px; font-weight: 700;">${statusLabels[task.status] || task.status}</span>
                  </div>
                  
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: white; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 14px; font-weight: 600;">📅 تاريخ الاستحقاق</span>
                    <span style="color: #1e293b; font-size: 14px; font-weight: 700;">${task.due_date}</span>
                  </div>
                  
                  ${task.employee_name ? `
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: white; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 14px; font-weight: 600;">👤 الموظف المعني</span>
                    <span style="color: #1e293b; font-size: 14px; font-weight: 700;">${task.employee_name}</span>
                  </div>
                  ` : ''}
                  
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: white; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 14px; font-weight: 600;">🏢 الجهة المرسلة</span>
                    <span style="color: #1e293b; font-size: 14px; font-weight: 700;">${company.name}</span>
                  </div>
                  
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: white; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 14px; font-weight: 600;">🕐 تاريخ الإرسال</span>
                    <span style="color: #1e293b; font-size: 14px; font-weight: 700;">${arabicDate} - ${arabicTime}</span>
                  </div>
                </div>
              </div>
              
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 16px; padding: 20px; margin-bottom: 25px; border: 1px solid #fcd34d;">
                <div style="display: flex; align-items: center; gap: 12px; justify-content: center;">
                  <span style="font-size: 24px;">⚡</span>
                  <div>
                    <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 700;">تنبيه هام</p>
                    <p style="color: #a16207; font-size: 13px; margin: 4px 0 0 0;">يرجى إنجاز المهمة قبل تاريخ الاستحقاق المحدد</p>
                  </div>
                </div>
              </div>
              
              <div style="background: #f8fafc; border-radius: 16px; padding: 20px; text-align: center; border: 1px solid #e2e8f0;">
                <p style="color: #64748b; font-size: 13px; margin: 0 0 8px 0;">للاستفسارات والتواصل</p>
                <p style="color: #8b5cf6; font-size: 15px; font-weight: 700; margin: 0;">${company.email || 'info@zoolspeed.com'}</p>
              </div>
            </div>
            
            <div style="background: #0f172a; padding: 30px 40px; text-align: center;">
              <div style="margin-bottom: 15px;">
                <span style="color: #a78bfa; font-size: 18px; font-weight: 800;">Logistics Systems Pro</span>
                <span style="color: #475569; font-size: 12px; margin-right: 8px;">| نظام إدارة اللوجستيات</span>
              </div>
              <p style="color: #64748b; font-size: 11px; margin: 0 0 8px 0;">© ${new Date().getFullYear()} جميع الحقوق محفوظة</p>
              <p style="color: #475569; font-size: 10px; margin: 0;">هذا البريد مرسل من نظام إدارة المهام</p>
            </div>
            
          </div>
        </div>
      </body>
      </html>
    `;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM}>`,
      to: recipientEmail,
      subject,
      html,
    });

    return NextResponse.json({ success: true, message: "تم إرسال البريد بنجاح" });
  } catch (error: any) {
    console.error("Error sending task email:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

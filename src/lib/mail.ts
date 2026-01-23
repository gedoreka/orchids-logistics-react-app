import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) {
  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM}>`,
    to,
    subject,
    text,
    html,
  };

  return await transporter.sendMail(mailOptions);
}

export async function sendLoginNotification(email: string, name: string, companyName: string) {
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
    const arabicDate = now.toLocaleDateString('en-US', dateOptions);
    const arabicTime = now.toLocaleTimeString('en-US', timeOptions);

  const subject = "تم تسجيل دخول جديد إلى حسابك - Logistics Systems Pro";
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
          
          <div style="background: linear-gradient(135deg, #0078D4 0%, #5B21B6 50%, #7C3AED 100%); padding: 50px 40px; text-align: center; position: relative;">
            <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #60a5fa, #a78bfa, #c084fc, #a78bfa, #60a5fa); background-size: 200% 100%;"></div>
            <div style="width: 100px; height: 100px; background: rgba(255,255,255,0.2); border-radius: 24px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.2);">
              <span style="font-size: 50px;">🔐</span>
            </div>
            <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin: 0 0 12px 0; text-shadow: 0 4px 20px rgba(0,0,0,0.3);">تسجيل دخول جديد</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 0; font-weight: 500;">تم رصد تسجيل دخول إلى حسابك</p>
          </div>
          
          <div style="padding: 50px 40px; background: #ffffff;">
            <div style="text-align: center; margin-bottom: 35px;">
              <p style="font-size: 20px; color: #1e293b; line-height: 1.8; margin: 0;">
                مرحباً<br>
                <strong style="color: #0078D4; font-size: 26px; display: block; margin: 10px 0;">${name}</strong>
              </p>
            </div>
            
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 20px; padding: 30px; margin-bottom: 30px; border: 1px solid #bae6fd;">
              <div style="text-align: center; margin-bottom: 20px;">
                <span style="font-size: 40px;">✨</span>
              </div>
              <p style="color: #0369a1; font-size: 16px; line-height: 1.8; margin: 0; text-align: center; font-weight: 600;">
                  تم تسجيل دخولك بنجاح إلى نظام Logistics Systems Pro
                </p>
            </div>
            
            <div style="background: #f8fafc; border-radius: 20px; padding: 25px; margin-bottom: 30px; border: 1px solid #e2e8f0;">
              <h3 style="color: #334155; font-size: 16px; margin: 0 0 20px 0; font-weight: 700; text-align: center;">تفاصيل تسجيل الدخول</h3>
              
              <div style="display: flex; flex-direction: column; gap: 15px;">
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: white; border-radius: 12px; border: 1px solid #e2e8f0;">
                  <span style="color: #64748b; font-size: 14px; font-weight: 600;">📅 التاريخ</span>
                  <span style="color: #1e293b; font-size: 14px; font-weight: 700;">${arabicDate}</span>
                </div>
                
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: white; border-radius: 12px; border: 1px solid #e2e8f0;">
                  <span style="color: #64748b; font-size: 14px; font-weight: 600;">🕐 الوقت</span>
                  <span style="color: #1e293b; font-size: 14px; font-weight: 700;">${arabicTime}</span>
                </div>
                
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: white; border-radius: 12px; border: 1px solid #e2e8f0;">
                  <span style="color: #64748b; font-size: 14px; font-weight: 600;">🏢 المنشأة</span>
                  <span style="color: #1e293b; font-size: 14px; font-weight: 700;">${companyName}</span>
                </div>
                
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: white; border-radius: 12px; border: 1px solid #e2e8f0;">
                  <span style="color: #64748b; font-size: 14px; font-weight: 600;">📧 البريد</span>
                  <span style="color: #1e293b; font-size: 14px; font-weight: 700;">${email}</span>
                </div>
              </div>
            </div>
            
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 16px; padding: 20px; margin-bottom: 25px; border: 1px solid #fcd34d;">
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <span style="font-size: 24px;">⚠️</span>
                <div>
                  <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 700;">تنبيه أمني</p>
                  <p style="color: #a16207; font-size: 13px; margin: 8px 0 0 0; line-height: 1.6;">إذا لم تكن أنت من قام بتسجيل الدخول، يرجى تغيير كلمة المرور فوراً والتواصل مع الدعم الفني.</p>
                </div>
              </div>
            </div>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="https://zoolspeed.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #0078D4 0%, #7C3AED 100%); color: white; text-decoration: none; padding: 16px 45px; border-radius: 14px; font-size: 16px; font-weight: 700; box-shadow: 0 10px 30px rgba(0,120,212,0.3);">
                الذهاب إلى لوحة التحكم →
              </a>
            </div>
            
            <div style="background: #f8fafc; border-radius: 16px; padding: 20px; text-align: center; border: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 13px; margin: 0 0 8px 0;">هل تحتاج مساعدة؟</p>
              <p style="color: #0078D4; font-size: 15px; font-weight: 700; margin: 0;">info@zoolspeed.com</p>
            </div>
          </div>
          
          <div style="background: #0f172a; padding: 30px 40px; text-align: center;">
            <div style="margin-bottom: 15px;">
              <span style="color: #60a5fa; font-size: 18px; font-weight: 800;">Logistics Systems Pro</span>
              <span style="color: #475569; font-size: 12px; margin-right: 8px;">| نظام إدارة اللوجستيات</span>
            </div>
            <p style="color: #64748b; font-size: 11px; margin: 0 0 8px 0;">© ${new Date().getFullYear()} جميع الحقوق محفوظة لشركة زول اسبيد للأنشطة المتعددة</p>
            <p style="color: #475569; font-size: 10px; margin: 0;">هذا البريد مرسل آلياً للأغراض الأمنية</p>
          </div>
          
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    return await sendEmail({ to: email, subject, html });
  } catch (error) {
    console.error("Failed to send login notification email:", error);
  }
}

export async function sendResetCode(email: string, name: string, code: string) {
  const subject = "رمز التحقق لاستعادة كلمة المرور - Logistics Systems Pro";
  const html = `
    <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 24px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background-color: #008080; width: 60px; height: 60px; border-radius: 16px; display: inline-block; line-height: 60px; color: white; font-size: 30px; font-weight: bold; box-shadow: 0 10px 20px rgba(0,128,128,0.2);">L</div>
        <h2 style="color: #0f172a; margin-top: 15px; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Logistics Systems Pro</h2>
      </div>
      <div style="background-color: #f8fafc; border-radius: 20px; padding: 30px; border: 1px solid #f1f5f9;">
        <p style="font-size: 16px; color: #475569; margin-bottom: 25px; line-height: 1.6;">مرحباً <strong>${name}</strong>،</p>
        <p style="font-size: 16px; color: #475569; margin-bottom: 25px; line-height: 1.6;">لقد طلبت إعادة تعيين كلمة المرور الخاصة بك. يرجى استخدام رمز التحقق التالي لإتمام العملية:</p>
        <div style="background: linear-gradient(135deg, #008080 0%, #006666 100%); padding: 25px; text-align: center; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #ffffff; border-radius: 16px; margin: 30px 0; box-shadow: 0 10px 25px rgba(0,128,128,0.15);">
          ${code}
        </div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 8px; color: #008080; font-size: 14px; font-weight: 700;">
          <span>•</span>
          <span>صالح لمدة 15 دقيقة فقط</span>
          <span>•</span>
        </div>
      </div>
      <p style="font-size: 14px; color: #94a3b8; margin-top: 30px; line-height: 1.6; text-align: center;">إذا لم تطلب أنت هذا الرمز، فيرجى تجاهل هذا البريد الإلكتروني بأمان.</p>
      <div style="border-top: 1px solid #f1f5f9; margin-top: 40px; padding-top: 30px; text-align: center;">
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">© ${new Date().getFullYear()} Logistics Systems Pro. جميع الحقوق محفوظة.</p>
        <p style="font-size: 11px; color: #cbd5e1; margin-top: 8px;">هذا البريد مرسل آلياً، يرجى عدم الرد عليه.</p>
      </div>
    </div>
  `;

  return await sendEmail({ to: email, subject, html });
}

export async function sendWelcomeSubUserEmail(email: string, name: string, password: string) {
  const subject = "مرحباً بك في نظام Logistics Systems Pro - بيانات حسابك";
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
          
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%); padding: 50px 40px; text-align: center; position: relative;">
            <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #34d399, #10b981, #059669, #10b981, #34d399); background-size: 200% 100%;"></div>
            <div style="width: 100px; height: 100px; background: rgba(255,255,255,0.2); border-radius: 24px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.2);">
              <span style="font-size: 50px;">🎉</span>
            </div>
            <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin: 0 0 12px 0; text-shadow: 0 4px 20px rgba(0,0,0,0.3);">مرحباً بك!</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 0; font-weight: 500;">تم إنشاء حسابك بنجاح</p>
          </div>
          
          <div style="padding: 50px 40px; background: #ffffff;">
            <div style="text-align: center; margin-bottom: 35px;">
              <p style="font-size: 20px; color: #1e293b; line-height: 1.8; margin: 0;">
                أهلاً<br>
                <strong style="color: #10b981; font-size: 26px; display: block; margin: 10px 0;">${name}</strong>
              </p>
            </div>
            
            <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 20px; padding: 30px; margin-bottom: 30px; border: 1px solid #a7f3d0;">
              <div style="text-align: center; margin-bottom: 20px;">
                <span style="font-size: 40px;">✨</span>
              </div>
              <p style="color: #047857; font-size: 16px; line-height: 1.8; margin: 0; text-align: center; font-weight: 600;">
                تم إنشاء حسابك في نظام Logistics Systems Pro
              </p>
            </div>
            
            <div style="background: #f8fafc; border-radius: 20px; padding: 25px; margin-bottom: 30px; border: 1px solid #e2e8f0;">
              <h3 style="color: #334155; font-size: 16px; margin: 0 0 20px 0; font-weight: 700; text-align: center;">بيانات تسجيل الدخول</h3>
              
              <div style="display: flex; flex-direction: column; gap: 15px;">
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: white; border-radius: 12px; border: 1px solid #e2e8f0;">
                  <span style="color: #64748b; font-size: 14px; font-weight: 600;">📧 البريد الإلكتروني</span>
                  <span style="color: #1e293b; font-size: 14px; font-weight: 700;">${email}</span>
                </div>
                
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: white; border-radius: 12px; border: 1px solid #e2e8f0;">
                  <span style="color: #64748b; font-size: 14px; font-weight: 600;">🔑 كلمة المرور</span>
                  <span style="color: #1e293b; font-size: 14px; font-weight: 700; direction: ltr;">${password}</span>
                </div>
              </div>
            </div>
            
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 16px; padding: 20px; margin-bottom: 25px; border: 1px solid #fcd34d;">
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <span style="font-size: 24px;">⚠️</span>
                <div>
                  <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 700;">تنبيه مهم</p>
                  <p style="color: #a16207; font-size: 13px; margin: 8px 0 0 0; line-height: 1.6;">يرجى تغيير كلمة المرور فور تسجيل الدخول الأول للحفاظ على أمان حسابك.</p>
                </div>
              </div>
            </div>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="https://zoolspeed.com/login" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #047857 100%); color: white; text-decoration: none; padding: 16px 45px; border-radius: 14px; font-size: 16px; font-weight: 700; box-shadow: 0 10px 30px rgba(16,185,129,0.3);">
                تسجيل الدخول الآن →
              </a>
            </div>
            
            <div style="background: #f8fafc; border-radius: 16px; padding: 20px; text-align: center; border: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 13px; margin: 0 0 8px 0;">هل تحتاج مساعدة؟</p>
              <p style="color: #10b981; font-size: 15px; font-weight: 700; margin: 0;">info@zoolspeed.com</p>
            </div>
          </div>
          
          <div style="background: #0f172a; padding: 30px 40px; text-align: center;">
            <div style="margin-bottom: 15px;">
              <span style="color: #34d399; font-size: 18px; font-weight: 800;">Logistics Systems Pro</span>
              <span style="color: #475569; font-size: 12px; margin-right: 8px;">| نظام إدارة اللوجستيات</span>
            </div>
            <p style="color: #64748b; font-size: 11px; margin: 0 0 8px 0;">© ${new Date().getFullYear()} جميع الحقوق محفوظة</p>
            <p style="color: #475569; font-size: 10px; margin: 0;">هذا البريد مرسل آلياً</p>
          </div>
          
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    return await sendEmail({ to: email, subject, html });
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
}

export async function sendWelcomeEmail(email: string, name: string, password: string) {
  return sendWelcomeSubUserEmail(email, name, password);
}

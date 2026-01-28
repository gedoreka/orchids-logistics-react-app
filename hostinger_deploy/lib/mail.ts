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
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; min-height: 100vh;">
      <div style="max-width: 650px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: #ffffff; border-radius: 32px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.05);">
          
          <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 50px 40px; text-align: center; position: relative;">
            <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.1); border-radius: 24px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.1);">
              <span style="font-size: 40px;">🔐</span>
            </div>
            <h1 style="color: #ffffff; font-size: 26px; font-weight: 800; margin: 0 0 12px 0;">تسجيل دخول جديد</h1>
            <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 0; font-weight: 500;">تم رصد دخول إلى حسابك في Logistics Systems Pro</p>
          </div>
          
          <div style="padding: 40px; background: #ffffff;">
            <div style="text-align: right; margin-bottom: 35px;">
              <p style="font-size: 18px; color: #1e293b; line-height: 1.8; margin: 0;">
                مرحباً <strong style="color: #3b82f6;">${name}</strong>
              </p>
            </div>
            
            <div style="background: #f1f5f9; border-radius: 20px; padding: 25px; margin-bottom: 30px; border: 1px solid #e2e8f0;">
              <h3 style="color: #334155; font-size: 15px; margin: 0 0 20px 0; font-weight: 700;">تفاصيل العملية</h3>
              
              <div style="display: flex; flex-direction: column; gap: 12px;">
                <div style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between;">
                  <span style="color: #64748b; font-size: 13px;">التاريخ والوقت:</span>
                  <span style="color: #1e293b; font-size: 13px; font-weight: 700;">${arabicDate} | ${arabicTime}</span>
                </div>
                <div style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between;">
                  <span style="color: #64748b; font-size: 13px;">الشركة:</span>
                  <span style="color: #1e293b; font-size: 13px; font-weight: 700;">${companyName}</span>
                </div>
                <div style="padding: 12px 0; display: flex; justify-content: space-between;">
                  <span style="color: #64748b; font-size: 13px;">الحساب:</span>
                  <span style="color: #1e293b; font-size: 13px; font-weight: 700;">${email}</span>
                </div>
              </div>
            </div>
            
            <div style="background: #fffbeb; border-radius: 16px; padding: 20px; margin-bottom: 25px; border: 1px solid #fef3c7;">
              <p style="color: #92400e; font-size: 13px; margin: 0; line-height: 1.6;">
                <strong>تنبيه أمني:</strong> إذا لم تكن أنت من قام بهذا الدخول، يرجى تغيير كلمة المرور فوراً وتأمين حسابك.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="display: inline-block; background: #1e293b; color: white; text-decoration: none; padding: 14px 35px; border-radius: 12px; font-size: 14px; font-weight: 700;">
                  لوحة التحكم
                </a>
              </div>

          </div>
          
          <div style="background: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #f1f5f9;">
            <p style="color: #94a3b8; font-size: 11px; margin: 0;">Logistics Systems Pro - الحل المتكامل لإدارة اللوجستيات</p>
            <p style="color: #cbd5e1; font-size: 10px; margin: 5px 0 0 0;">© 2026 جميع الحقوق محفوظة</p>
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
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; min-height: 100vh;">
      <div style="max-width: 650px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: #ffffff; border-radius: 32px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.05);">
          
          <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 50px 40px; text-align: center; position: relative;">
            <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.1); border-radius: 24px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.1);">
              <span style="font-size: 40px;">🔑</span>
            </div>
            <h1 style="color: #ffffff; font-size: 26px; font-weight: 800; margin: 0 0 12px 0;">استعادة كلمة المرور</h1>
            <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 0; font-weight: 500;">Logistics Systems Pro Security</p>
          </div>
          
          <div style="padding: 40px; background: #ffffff;">
            <div style="text-align: right; margin-bottom: 30px;">
              <p style="font-size: 18px; color: #1e293b; line-height: 1.8; margin: 0;">
                مرحباً <strong style="color: #3b82f6;">${name}</strong>
              </p>
              <p style="font-size: 15px; color: #64748b; margin: 10px 0 0 0;">لقد طلبت إعادة تعيين كلمة المرور الخاصة بك. يرجى استخدام الرمز التالي:</p>
            </div>
            
            <div style="background: #f1f5f9; border-radius: 24px; padding: 40px; text-align: center; margin-bottom: 30px; border: 2px dashed #e2e8f0;">
              <div style="font-size: 48px; font-weight: 900; letter-spacing: 12px; color: #1e293b; font-family: monospace;">
                ${code}
              </div>
              <p style="color: #94a3b8; font-size: 12px; margin-top: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                الرمز صالح لمدة 15 دقيقة فقط
              </p>
            </div>
            
            <div style="background: #fffbeb; border-radius: 16px; padding: 20px; text-align: center; border: 1px solid #fef3c7;">
              <p style="color: #92400e; font-size: 13px; margin: 0; line-height: 1.6;">
                إذا لم تطلب أنت هذا الرمز، فيرجى تجاهل هذا البريد الإلكتروني.
              </p>
            </div>
          </div>
          
          <div style="background: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #f1f5f9;">
            <p style="color: #94a3b8; font-size: 11px; margin: 0;">Logistics Systems Pro - نظام إدارة اللوجستيات المتكامل</p>
            <p style="color: #cbd5e1; font-size: 10px; margin: 5px 0 0 0;">© 2026 جميع الحقوق محفوظة</p>
          </div>
          
        </div>
      </div>
    </body>
    </html>
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
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #047857 100%); color: white; text-decoration: none; padding: 16px 45px; border-radius: 14px; font-size: 16px; font-weight: 700; box-shadow: 0 10px 30px rgba(16,185,129,0.3);">
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

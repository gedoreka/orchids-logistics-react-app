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
  fromName,
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  fromName?: string;
}) {
  const mailOptions = {
    from: `"${fromName || process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM}>`,
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

  const subject = "تم تسجيل دخول جديد إلى حسابك - Logistics Hub";
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
            <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 0; font-weight: 500;">تم رصد دخول إلى حسابك في Logistics Hub</p>
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
            <p style="color: #94a3b8; font-size: 11px; margin: 0;">Logistics Hub - الحل المتكامل لإدارة اللوجستيات</p>
            <p style="color: #cbd5e1; font-size: 10px; margin: 5px 0 0 0;">© 2026 جميع الحقوق محفوظة</p>
          </div>
          
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    return await sendEmail({ to: email, subject, html, fromName: companyName });
  } catch (error) {
    console.error("Failed to send login notification email:", error);
  }
}

export async function sendResetCode(email: string, name: string, code: string) {
  const subject = "رمز التحقق لاستعادة كلمة المرور - Logistics Hub";
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
            <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 0; font-weight: 500;">Logistics Hub Security</p>
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
            <p style="color: #94a3b8; font-size: 11px; margin: 0;">Logistics Hub - نظام إدارة اللوجستيات المتكامل</p>
            <p style="color: #cbd5e1; font-size: 10px; margin: 5px 0 0 0;">© 2026 جميع الحقوق محفوظة</p>
          </div>
          
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: email, subject, html });
}

export async function sendWelcomeSubUserEmail(
  email: string, 
  name: string, 
  password: string, 
  companyName: string, 
  permissions: string[] = []
) {
  const subject = `مرحباً بك في ${companyName} - بيانات حسابك في Logistics Hub`;
  
    // Format permissions for display
    const permissionTranslations: { [key: string]: string } = {
      'employees_module': 'إدارة الموظفين',
      'salary_payrolls_module': 'مسيرات الرواتب',
      'clients_module': 'إدارة العملاء',
      'receipts_module': 'سندات المبيعات',
      'quotations_module': 'عروض الأسعار',
      'sales_module': 'الفواتير الضريبية',
      'sales_invoices_module': 'الفواتير الضريبية',
      'sales_receipts_module': 'سندات المبيعات',
      'income_module': 'سندات الدخل',
      'credit_notes_module': 'إشعارات الدائن',
      'receipt_vouchers_module': 'سندات القبض',
      'vehicles_list': 'قائمة المركبات',
      'fleet_module': 'إدارة الأسطول',
      'expenses_module': 'المصروفات',
      'journal_entries_module': 'القيود اليومية',
      'income_report_module': 'تقرير الدخل',
      'expenses_report_module': 'تقرير المصروفات',
      'accounts_module': 'دليل الحسابات',
      'cost_centers_module': 'مراكز التكلفة',
      'ledger_module': 'الأستاذ العام',
      'trial_balance_module': 'ميزان المراجعة',
      'income_statement_module': 'قائمة الدخل',
      'balance_sheet_module': 'الميزانية العمومية',
      'tax_settings_module': 'إعدادات الضريبة',
      'letters_templates_module': 'الخطابات الجاهزة',
      'sub_users_module': 'إدارة المستخدمين',
      'monthly_commissions_module': 'العمولات الشهرية',
      'commissions_summary_module': 'ملخص العمولات',
      'ecommerce_orders_module': 'طلبات التجارة الإلكترونية',
      'daily_orders_module': 'طلبات اليوم',
      'ecommerce_stores_module': 'إدارة المتاجر',
      'personal_shipments_module': 'الشحنات الشخصية',
      'manage_shipments_module': 'إدارة الشحنات',
      'hr_module': 'إدارة الموارد البشرية',
      'financial_vouchers_module': 'السندات المالية',
      'payment_vouchers_module': 'سندات الصرف',
      'promissory_notes_module': 'السندات لأمر'
    };


  const permissionsHtml = permissions.length > 0 
    ? permissions.map(p => `<li style="color: #475569; font-size: 14px; margin-bottom: 5px;">• ${permissionTranslations[p] || p}</li>`).join('')
    : '<li style="color: #94a3b8; font-size: 14px;">لم يتم تعيين صلاحيات محددة بعد</li>';

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f0f4f8; min-height: 100vh;">
      <div style="max-width: 650px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: #ffffff; border-radius: 32px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1);">
          
          <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 60px 40px; text-align: center; position: relative;">
            <div style="width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 30px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px);">
              <span style="font-size: 50px;">🌟</span>
            </div>
            <h1 style="color: #ffffff; font-size: 32px; font-weight: 900; margin: 0 0 12px 0; letter-spacing: -1px;">مرحباً بك في فريقنا!</h1>
            <p style="color: rgba(255,255,255,0.8); font-size: 16px; margin: 0; font-weight: 500;">تم تفعيل حسابك بنجاح بواسطة ${companyName}</p>
          </div>
          
          <div style="padding: 50px 40px; background: #ffffff;">
            <div style="text-align: right; margin-bottom: 40px; border-right: 4px solid #3b82f6; padding-right: 20px;">
              <h2 style="font-size: 24px; color: #1e293b; margin: 0;">أهلاً بك، ${name}</h2>
              <p style="font-size: 16px; color: #64748b; margin: 10px 0 0 0;">يسعدنا انضمامك إلينا. إليك تفاصيل حسابك الجديد:</p>
            </div>
            
            <div style="background: #f8fafc; border-radius: 24px; padding: 30px; margin-bottom: 35px; border: 1px solid #e2e8f0;">
              <div style="margin-bottom: 25px;">
                <h3 style="color: #334155; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 18px;">🔑</span> بيانات الدخول
                </h3>
                <div style="background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;">
                  <div style="padding: 15px 20px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #64748b; font-size: 13px;">البريد الإلكتروني:</span>
                    <strong style="color: #1e293b; font-size: 14px;">${email}</strong>
                  </div>
                  <div style="padding: 15px 20px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #64748b; font-size: 13px;">كلمة المرور المؤقتة:</span>
                    <strong style="color: #3b82f6; font-size: 14px; font-family: monospace;">${password}</strong>
                  </div>
                </div>
              </div>

              <div>
                <h3 style="color: #334155; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 18px;">🛡️</span> الصلاحيات الممنوحة
                </h3>
                <div style="background: white; border-radius: 16px; border: 1px solid #e2e8f0; padding: 20px;">
                  <ul style="margin: 0; padding: 0; list-style: none;">
                    ${permissionsHtml}
                  </ul>
                </div>
              </div>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <a href="https://accounts.zoolspeed.com/login" style="display: inline-block; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: #ffffff; text-decoration: none; padding: 20px 45px; border-radius: 20px; font-size: 18px; font-weight: 800; box-shadow: 0 15px 30px rgba(30,41,59,0.2); transition: all 0.3s elegance;">
                <span style="vertical-align: middle; margin-left: 10px;">🚀</span> سجل الدخول الآن
              </a>
              <p style="color: #94a3b8; font-size: 12px; margin-top: 15px;">أو انسخ الرابط: https://accounts.zoolspeed.com/login</p>
            </div>

            <div style="background: #fffbeb; border-radius: 20px; padding: 25px; border: 1px solid #fef3c7;">
              <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.6;">
                <strong>💡 نصيحة أمنية:</strong> ننصح بتغيير كلمة المرور فور دخولك الأول لضمان خصوصية حسابك.
              </p>
            </div>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #f1f5f9;">
            <p style="color: #1e293b; font-size: 14px; font-weight: 700; margin: 0;">Logistics Hub</p>
            <p style="color: #94a3b8; font-size: 11px; margin: 5px 0 0 0;">الحل المتكامل لإدارة اللوجستيات | © 2026</p>
          </div>
          
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    return await sendEmail({ to: email, subject, html, fromName: companyName });
  } catch (error) {
    console.error("Failed to send welcome sub-user email:", error);
  }
}

export async function sendSubUserStatusEmail(
  email: string, 
  name: string, 
  status: "active" | "suspended", 
  companyName: string
) {
  const isActive = status === "active";
  const subject = isActive 
    ? `تم تنشيط حسابك بنجاح - ${companyName}`
    : `تنبيه: تم تعليق حسابك مؤقتاً - ${companyName}`;

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; min-height: 100vh;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: #ffffff; border-radius: 32px; overflow: hidden; border: 1px solid ${isActive ? '#e2e8f0' : '#fee2e2'}; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.05);">
          
          <div style="background: ${isActive ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : 'linear-gradient(135deg, #991b1b 0%, #dc2626 100%)'}; padding: 50px 40px; text-align: center;">
            <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 24px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
              <span style="font-size: 40px;">${isActive ? '✅' : '🚫'}</span>
            </div>
            <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0;">${isActive ? 'تم تنشيط الحساب' : 'تم تعليق الحساب'}</h1>
          </div>
          
          <div style="padding: 40px; background: #ffffff; text-align: right;">
            <p style="font-size: 18px; color: #1e293b; line-height: 1.8;">
              مرحباً <strong>${name}</strong>
            </p>
            <p style="font-size: 15px; color: #64748b; line-height: 1.8;">
              نود إفادتك بأن حالة حسابك في نظام <strong>Logistics Hub</strong> التابع لـ <strong>${companyName}</strong> قد تم تحديثها.
            </p>
            
            <div style="background: #f1f5f9; border-radius: 20px; padding: 25px; margin: 30px 0; border: 1px solid #e2e8f0;">
              <h3 style="color: #334155; font-size: 14px; margin: 0 0 15px 0; font-weight: 700;">تفاصيل الحالة الجديدة</h3>
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="color: #64748b;">الحالة:</span>
                <strong style="color: ${isActive ? '#059669' : '#dc2626'};">${isActive ? 'نشط' : 'موقوف'}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 10px 0;">
                <span style="color: #64748b;">وقت التحديث:</span>
                <strong style="color: #1e293b;">${new Date().toLocaleString('ar-SA')}</strong>
              </div>
            </div>

            <p style="font-size: 14px; color: #64748b; line-height: 1.6;">
              ${isActive 
                ? 'يمكنك الآن تسجيل الدخول ومتابعة عملك بشكل طبيعي.' 
                : 'تم تعليق وصولك للنظام مؤقتاً. يرجى مراجعة مدير النظام لمزيد من التفاصيل.'}
            </p>

            ${isActive ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://accounts.zoolspeed.com/login" style="display: inline-block; background: #1e293b; color: white; text-decoration: none; padding: 14px 35px; border-radius: 12px; font-size: 14px; font-weight: 700;">
                  تسجيل الدخول
                </a>
              </div>
            ` : ''}
          </div>
          
          <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #f1f5f9;">
            <p style="color: #94a3b8; font-size: 11px; margin: 0;">Logistics Hub | نظام الإدارة المتكامل</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    return await sendEmail({ to: email, subject, html, fromName: companyName });
  } catch (error) {
    console.error("Failed to send status update email:", error);
  }
}

export async function sendSubUserDeletionEmail(email: string, name: string, companyName: string) {
  const subject = `تنبيه: تم حذف حسابك نهائياً - ${companyName}`;

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #fef2f2; min-height: 100vh;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: #ffffff; border-radius: 32px; overflow: hidden; border: 1px solid #fee2e2; box-shadow: 0 25px 50px -12px rgba(153, 27, 27, 0.1);">
          
          <div style="background: linear-gradient(135deg, #991b1b 0%, #dc2626 100%); padding: 50px 40px; text-align: center;">
            <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 24px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
              <span style="font-size: 40px;">⚠️</span>
            </div>
            <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0;">تم حذف الحساب نهائياً</h1>
          </div>
          
          <div style="padding: 40px; background: #ffffff; text-align: right;">
            <p style="font-size: 18px; color: #1e293b; line-height: 1.8;">
              مرحباً <strong>${name}</strong>
            </p>
            <p style="font-size: 15px; color: #64748b; line-height: 1.8; margin-bottom: 30px;">
              نحيطكم علماً بأنه تم حذف حسابكم في نظام <strong>Logistics Hub</strong> التابع لـ <strong>${companyName}</strong> بشكل نهائي.
            </p>
            
            <div style="background: #fef2f2; border-radius: 20px; padding: 25px; margin-bottom: 30px; border: 1px solid #fee2e2;">
              <h3 style="color: #991b1b; font-size: 14px; margin: 0 0 15px 0; font-weight: 700;">ماذا يعني هذا؟</h3>
              <ul style="color: #b91c1c; font-size: 14px; margin: 0; padding-right: 20px; line-height: 1.8;">
                <li>لا يمكنك تسجيل الدخول إلى النظام بعد الآن.</li>
                <li>تم إلغاء جميع الصلاحيات المرتبطة بحسابك.</li>
                <li>لا يمكن استعادة بيانات الحساب أو الجلسات السابقة.</li>
              </ul>
            </div>

            <div style="text-align: center; border-top: 1px solid #f1f5f9; padding-top: 30px; margin-top: 30px;">
              <p style="font-size: 13px; color: #94a3b8; margin: 0;">نشكرك على مجهوداتك خلال فترة عملك معنا.</p>
            </div>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #f1f5f9;">
            <p style="color: #94a3b8; font-size: 11px; margin: 0;">Logistics Hub | الإدارة العامة</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    return await sendEmail({ to: email, subject, html, fromName: companyName });
  } catch (error) {
    console.error("Failed to send deletion email:", error);
  }
}

export async function sendWelcomeEmail(email: string, name: string, password: string, companyName?: string) {
  return sendWelcomeSubUserEmail(email, name, password, companyName || "Logistics Hub");
}

// إشعار الإدارة عند تسجيل شركة جديدة
export async function sendNewCompanyRegistrationAlert(companyData: {
  name: string;
  email: string;
  phone?: string;
  commercial_number?: string;
  country?: string;
  region?: string;
}) {
  const adminEmail = "gedorrka@gmail.com";
  const now = new Date();
  const arabicDate = now.toLocaleDateString('ar-SA', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const arabicTime = now.toLocaleTimeString('ar-SA', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true
  });

  const subject = `🔔 طلب تسجيل شركة جديدة - ${companyData.name}`;
  
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f0f9ff; min-height: 100vh;">
      <div style="max-width: 650px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: #ffffff; border-radius: 32px; overflow: hidden; border: 1px solid #e0f2fe; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1);">
          
          <div style="background: linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #0ea5e9 100%); padding: 50px 40px; text-align: center; position: relative;">
            <div style="width: 90px; height: 90px; background: rgba(255,255,255,0.15); border-radius: 28px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px; border: 2px solid rgba(255,255,255,0.2); backdrop-filter: blur(10px);">
              <span style="font-size: 45px;">🏢</span>
            </div>
            <h1 style="color: #ffffff; font-size: 28px; font-weight: 900; margin: 0 0 12px 0; letter-spacing: -0.5px;">طلب تسجيل جديد!</h1>
            <p style="color: rgba(255,255,255,0.85); font-size: 15px; margin: 0; font-weight: 500;">تم استلام طلب تسجيل شركة جديدة في النظام</p>
          </div>
          
          <div style="padding: 45px 40px; background: #ffffff;">
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 24px; padding: 30px; margin-bottom: 30px; border: 1px solid #bae6fd;">
              <h3 style="color: #0369a1; font-size: 16px; font-weight: 800; margin: 0 0 20px 0; display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 22px;">📋</span> بيانات الشركة
              </h3>
              
              <div style="background: white; border-radius: 16px; border: 1px solid #e0f2fe; overflow: hidden;">
                <div style="padding: 16px 20px; border-bottom: 1px solid #f0f9ff; display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #64748b; font-size: 13px; font-weight: 600;">اسم الشركة:</span>
                  <strong style="color: #0369a1; font-size: 15px;">${companyData.name}</strong>
                </div>
                <div style="padding: 16px 20px; border-bottom: 1px solid #f0f9ff; display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #64748b; font-size: 13px; font-weight: 600;">البريد الإلكتروني:</span>
                  <strong style="color: #1e293b; font-size: 14px;">${companyData.email}</strong>
                </div>
                ${companyData.phone ? `
                <div style="padding: 16px 20px; border-bottom: 1px solid #f0f9ff; display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #64748b; font-size: 13px; font-weight: 600;">رقم الهاتف:</span>
                  <strong style="color: #1e293b; font-size: 14px;" dir="ltr">${companyData.phone}</strong>
                </div>
                ` : ''}
                ${companyData.commercial_number ? `
                <div style="padding: 16px 20px; border-bottom: 1px solid #f0f9ff; display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #64748b; font-size: 13px; font-weight: 600;">السجل التجاري:</span>
                  <strong style="color: #1e293b; font-size: 14px;">${companyData.commercial_number}</strong>
                </div>
                ` : ''}
                ${companyData.country || companyData.region ? `
                <div style="padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #64748b; font-size: 13px; font-weight: 600;">الموقع:</span>
                  <strong style="color: #1e293b; font-size: 14px;">${[companyData.country, companyData.region].filter(Boolean).join(' - ')}</strong>
                </div>
                ` : ''}
              </div>
            </div>
            
            <div style="background: #fef3c7; border-radius: 16px; padding: 20px; margin-bottom: 30px; border: 1px solid #fde68a;">
              <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.7; display: flex; align-items: flex-start; gap: 10px;">
                <span style="font-size: 18px;">⏰</span>
                <span><strong>وقت الطلب:</strong> ${arabicDate} - ${arabicTime}</span>
              </p>
            </div>

            <div style="text-align: center; margin: 35px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/companies?filter=pending" style="display: inline-block; background: linear-gradient(135deg, #0369a1 0%, #0284c7 100%); color: #ffffff; text-decoration: none; padding: 18px 40px; border-radius: 16px; font-size: 16px; font-weight: 800; box-shadow: 0 10px 25px rgba(3, 105, 161, 0.3);">
                <span style="vertical-align: middle; margin-left: 8px;">👀</span> مراجعة الطلب الآن
              </a>
            </div>

            <div style="background: #f1f5f9; border-radius: 16px; padding: 20px; text-align: center;">
              <p style="color: #64748b; font-size: 13px; margin: 0; line-height: 1.6;">
                يمكنك قبول أو رفض الطلب من لوحة تحكم الإدارة
              </p>
            </div>
          </div>
          
          <div style="background: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #f1f5f9;">
            <p style="color: #1e293b; font-size: 14px; font-weight: 700; margin: 0;">Logistics Hub</p>
            <p style="color: #94a3b8; font-size: 11px; margin: 5px 0 0 0;">إشعارات الإدارة التلقائية</p>
          </div>
          
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    return await sendEmail({ to: adminEmail, subject, html, fromName: "Logistics Hub" });
  } catch (error) {
    console.error("Failed to send new company registration alert:", error);
  }
}

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

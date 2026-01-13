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
  const subject = "رمز التحقق لاستعادة كلمة المرور - ZoolSpeed";
  const html = `
    <div dir="rtl" style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #2563eb; text-align: center;">ZoolSpeed</h2>
      <p>مرحباً ${name}،</p>
      <p>لقد طلبت إعادة تعيين كلمة المرور الخاصة بك. يرجى استخدام رمز التحقق التالي:</p>
      <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1e40af; border-radius: 5px; margin: 20px 0;">
        ${code}
      </div>
      <p>هذا الرمز صالح لمدة 15 دقيقة فقط.</p>
      <p>إذا لم تطلب أنت هذا الرمز، فيرجى تجاهل هذا البريد الإلكتروني.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #666; text-align: center;">© ${new Date().getFullYear()} ZoolSpeed Logistics. جميع الحقوق محفوظة.</p>
    </div>
  `;

  return await sendEmail({ to: email, subject, html });
}

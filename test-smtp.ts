
import nodemailer from "nodemailer";

async function testSMTP() {
  console.log("Testing SMTP with:", {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    from: process.env.SMTP_FROM,
  });

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.verify();
    console.log("SMTP Connection verified successfully!");
    
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM}>`,
      to: "info@zoolspeed.com", // Send to self for testing
      subject: "Test Email from ZoolSpeed",
      text: "If you receive this, SMTP is working!",
    });
    
    console.log("Email sent successfully:", info.messageId);
  } catch (error) {
    console.error("SMTP Test failed:", error);
  }
}

testSMTP();

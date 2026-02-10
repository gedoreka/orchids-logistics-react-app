import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { query, execute } from "@/lib/db";
import { cookies } from "next/headers";
import crypto from "crypto";

async function getCompanyInfo() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  if (!sessionCookie) return null;
  const session = JSON.parse(sessionCookie.value);

  const companies = await query<any>(
    "SELECT id, name, email FROM companies WHERE id = ?",
    [session.company_id]
  );

  if (!companies || companies.length === 0) return null;
  return companies[0];
}

// POST: Send completion confirmation email
export async function POST(request: NextRequest) {
  try {
    const company = await getCompanyInfo();
    if (!company) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { maintenanceId, to } = await request.json();

    if (!maintenanceId || !to) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get maintenance details
    const maintenanceRows = await query<any>(
      `SELECT m.*, v.plate_number_ar, v.brand, v.model 
       FROM maintenance_requests m 
       LEFT JOIN vehicles v ON m.vehicle_id = v.id 
       WHERE m.id = ?`,
      [maintenanceId]
    );

    if (!maintenanceRows || maintenanceRows.length === 0) {
      return NextResponse.json({ error: "Maintenance not found" }, { status: 404 });
    }

    const maintenance = maintenanceRows[0];

    // Generate confirmation token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

    // Store the token
    await execute(
      `UPDATE maintenance_requests SET confirmation_token = ?, token_expires_at = ? WHERE id = ?`,
      [token, expiresAt, maintenanceId]
    );

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3006";
    const confirmUrl = `${appUrl}/api/fleet/complete-maintenance?token=${token}&id=${maintenanceId}`;

    const emailHtml = `
      <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #0f172a; border-radius: 24px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05);">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
          <div style="width: 70px; height: 70px; background: rgba(255,255,255,0.2); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
            <span style="font-size: 32px;">✅</span>
          </div>
          <h1 style="margin: 0; font-size: 24px; color: white; font-weight: 900;">تأكيد اكتمال الصيانة</h1>
          <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">أمر الصيانة #${String(maintenanceId).padStart(6, "0")}</p>
        </div>
        
        <div style="padding: 30px;">
          <div style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); border-radius: 16px; padding: 20px; margin-bottom: 24px; text-align: center;">
            <p style="margin: 0 0 8px; color: #6ee7b7; font-weight: 700; font-size: 15px;">تم إكمال أعمال الصيانة بنجاح</p>
            <p style="margin: 0; color: rgba(255,255,255,0.5); font-size: 12px;">يرجى الضغط على الزر أدناه لتأكيد استلام المركبة</p>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px;">
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px;">
              <p style="margin: 0 0 4px; color: rgba(255,255,255,0.4); font-size: 10px; font-weight: 800; text-transform: uppercase;">رقم اللوحة</p>
              <p style="margin: 0; color: white; font-size: 16px; font-weight: 900;">${maintenance.plate_number_ar || "-"}</p>
            </div>
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px;">
              <p style="margin: 0 0 4px; color: rgba(255,255,255,0.4); font-size: 10px; font-weight: 800; text-transform: uppercase;">المركبة</p>
              <p style="margin: 0; color: white; font-size: 14px; font-weight: 700;">${maintenance.brand || ""} ${maintenance.model || ""}</p>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; text-decoration: none; padding: 16px 48px; border-radius: 16px; font-size: 16px; font-weight: 900; letter-spacing: 0.5px;">تأكيد اكتمال الصيانة</a>
          </div>
          
          <p style="margin: 0; color: rgba(255,255,255,0.3); font-size: 11px; text-align: center;">صالح لمدة 72 ساعة من وقت الإرسال</p>
        </div>
        
        <div style="padding: 20px 30px; border-top: 1px solid rgba(255,255,255,0.05); text-align: center;">
          <p style="margin: 0; color: rgba(255,255,255,0.3); font-size: 11px;">${company.name} - نظام إدارة الأسطول</p>
        </div>
      </div>
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
      from: `"${company.name} - قسم الصيانة" <${process.env.SMTP_FROM}>`,
      to,
      subject: `تأكيد اكتمال الصيانة - أمر #${String(maintenanceId).padStart(6, "0")}`,
      html: emailHtml,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error sending completion email:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// GET: Handle confirmation link click
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const id = searchParams.get("id");

    if (!token || !id) {
      return new NextResponse(renderResultPage(false, "رابط غير صالح"), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const rows = await query<any>(
      "SELECT * FROM maintenance_requests WHERE id = ? AND confirmation_token = ?",
      [id, token]
    );

    if (!rows || rows.length === 0) {
      return new NextResponse(renderResultPage(false, "رابط غير صالح أو منتهي الصلاحية"), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const maintenance = rows[0];

    if (maintenance.token_expires_at && new Date(maintenance.token_expires_at) < new Date()) {
      return new NextResponse(renderResultPage(false, "انتهت صلاحية رابط التأكيد"), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    if (maintenance.status === "completed") {
      return new NextResponse(renderResultPage(true, "تم تأكيد اكتمال هذه الصيانة مسبقاً"), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // Mark as completed
    await execute(
      "UPDATE maintenance_requests SET status = 'completed', confirmation_token = NULL, token_expires_at = NULL, confirmed_at = NOW() WHERE id = ?",
      [id]
    );

    return new NextResponse(renderResultPage(true, "تم تأكيد اكتمال الصيانة بنجاح"), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error: any) {
    console.error("Error confirming maintenance:", error);
    return new NextResponse(renderResultPage(false, "حدث خطأ أثناء التأكيد"), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}

function renderResultPage(success: boolean, message: string): string {
  const color = success ? "#10b981" : "#ef4444";
  const icon = success ? "✅" : "❌";
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>تأكيد الصيانة</title></head>
<body style="margin:0;padding:40px 20px;background:#0f172a;font-family:'Segoe UI',Tahoma,Arial,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;">
  <div style="max-width:440px;width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:48px 32px;text-align:center;">
    <div style="width:80px;height:80px;background:${color}20;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:24px;">
      <span style="font-size:40px;">${icon}</span>
    </div>
    <h1 style="color:white;font-size:22px;font-weight:900;margin:0 0 12px;">${message}</h1>
    <p style="color:rgba(255,255,255,0.4);font-size:13px;margin:0;">يمكنك إغلاق هذه الصفحة الآن</p>
  </div>
</body>
</html>`;
}

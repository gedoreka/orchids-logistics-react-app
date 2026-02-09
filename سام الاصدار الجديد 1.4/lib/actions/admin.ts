"use server";

import { query, execute } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/mail";

interface CompanyWithUser {
  id: number;
  name: string;
  email: string;
  commercial_number: string;
  temp_password?: string;
}

export async function approveCompany(id: number) {
  try {
    const companies = await query<CompanyWithUser>(
      "SELECT c.id, c.name, c.commercial_number, c.temp_password, u.email FROM companies c LEFT JOIN users u ON u.company_id = c.id WHERE c.id = ? LIMIT 1",
      [id]
    );
    
    if (companies.length === 0) {
      return { success: false, error: "الشركة غير موجودة" };
    }
    
    const company = companies[0];

    // Calculate trial end date (14 days from now)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 14);
    const subscriptionEndDate = endDate.toISOString().split('T')[0];

    await execute(
      "UPDATE companies SET status = 'approved', is_active = 1, selected_plan_id = 1, is_subscription_active = 1, subscription_end_date = ?, temp_password = NULL WHERE id = ?", 
      [subscriptionEndDate, id]
    );
    
    await execute(
      "UPDATE users SET role = 'user', is_active = 1, is_activated = 1, activation_date = NOW() WHERE company_id = ?",
      [id]
    );

    if (company.email) {
      const html = generateApprovalEmailTemplate(company.name, company.email, company.temp_password || "الكلمة التي اخترتها عند التسجيل");
      await sendEmail({
        to: company.email,
        subject: "تهانينا! تم تفعيل حسابك في ZoolSpeed - مرحباً بك في عائلتنا",
        html,
      });
    }

    revalidatePath("/admin/companies");
    return { success: true };
  } catch (error: any) {
    console.error("Approve company error:", error);
    return { success: false, error: error.message };
  }
}

export async function rejectCompany(id: number) {
  try {
    const companies = await query<CompanyWithUser>(
      "SELECT c.id, c.name, c.commercial_number, u.email FROM companies c LEFT JOIN users u ON u.company_id = c.id WHERE c.id = ? LIMIT 1",
      [id]
    );
    
    if (companies.length === 0) {
      return { success: false, error: "الشركة غير موجودة" };
    }
    
    const company = companies[0];

    await execute("UPDATE companies SET status = 'rejected', is_active = 0, temp_password = NULL WHERE id = ?", [id]);
    
    await execute(
      "UPDATE users SET is_active = 0, is_activated = 0 WHERE company_id = ?",
      [id]
    );

    if (company.email) {
      const html = generateRejectionEmailTemplate(company.name);
      await sendEmail({
        to: company.email,
        subject: "تحديث حالة طلبك في ZoolSpeed",
        html,
      });
    }

    revalidatePath("/admin/companies");
    return { success: true };
  } catch (error: any) {
    console.error("Reject company error:", error);
    return { success: false, error: error.message };
  }
}

function generateApprovalEmailTemplate(companyName: string, email: string, password: string): string {
  return `
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
            <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #34d399, #10b981, #059669, #047857, #059669, #10b981, #34d399); background-size: 200% 100%; animation: gradient 3s ease infinite;"></div>
            <div style="width: 100px; height: 100px; background: rgba(255,255,255,0.2); border-radius: 24px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.2);">
              <span style="font-size: 50px;">✓</span>
            </div>
            <h1 style="color: #ffffff; font-size: 32px; font-weight: 800; margin: 0 0 12px 0; text-shadow: 0 4px 20px rgba(0,0,0,0.3);">تهانينا الحارة!</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 0; font-weight: 500;">تم تفعيل حسابك بنجاح</p>
          </div>
          
          <div style="padding: 50px 40px; background: #ffffff;">
            <div style="text-align: center; margin-bottom: 40px;">
              <p style="font-size: 20px; color: #1e293b; line-height: 1.8; margin: 0;">
                يسعدنا أن نرحب بشركة<br>
                <strong style="color: #10b981; font-size: 28px; display: block; margin: 15px 0; background: linear-gradient(135deg, #10b981, #059669); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${companyName}</strong>
                في عائلة ZoolSpeed
              </p>
            </div>

            <div style="background: #f8fafc; border-radius: 20px; padding: 25px; margin-bottom: 30px; border: 1px solid #e2e8f0; text-align: right;">
              <h3 style="color: #1e293b; font-size: 18px; margin: 0 0 15px 0; font-weight: 700; border-bottom: 2px solid #10b981; padding-bottom: 10px; display: inline-block;">بيانات الدخول الخاصة بك:</h3>
              <div style="margin-bottom: 15px;">
                <p style="margin: 5px 0; color: #64748b; font-size: 14px;">البريد الإلكتروني:</p>
                <p style="margin: 0; color: #1e293b; font-size: 16px; font-weight: 700;">${email}</p>
              </div>
              <div style="margin-bottom: 15px;">
                <p style="margin: 5px 0; color: #64748b; font-size: 14px;">كلمة المرور:</p>
                <p style="margin: 0; color: #1e293b; font-size: 16px; font-weight: 700;">${password}</p>
              </div>
              <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 15px; margin-top: 20px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">
                  ⚠️ تنبيه: لقد تم منحك <strong>باقة تجريبية مجانية لمدة 14 يوم</strong> لتجربة كافة خدمات النظام. يمكنك الترقية إلى الباقة الدائمة في أي وقت من داخل النظام.
                </p>
              </div>
            </div>
            
            <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 20px; padding: 30px; margin-bottom: 30px; border: 1px solid #bbf7d0;">
              <h3 style="color: #166534; font-size: 18px; margin: 0 0 20px 0; font-weight: 700;">مميزات حسابك المفعّل:</h3>
              <ul style="margin: 0; padding: 0; list-style: none;">
                <li style="padding: 12px 0; border-bottom: 1px solid rgba(22,163,74,0.1); display: flex; align-items: center; gap: 12px;">
                  <span style="width: 32px; height: 32px; background: #10b981; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 14px;">✓</span>
                  <span style="color: #374151; font-size: 15px;">إدارة شاملة لأسطول المركبات</span>
                </li>
                <li style="padding: 12px 0; border-bottom: 1px solid rgba(22,163,74,0.1); display: flex; align-items: center; gap: 12px;">
                  <span style="width: 32px; height: 32px; background: #10b981; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 14px;">✓</span>
                  <span style="color: #374151; font-size: 15px;">نظام محاسبي متكامل ومتوافق مع الزكاة والدخل</span>
                </li>
                <li style="padding: 12px 0; border-bottom: 1px solid rgba(22,163,74,0.1); display: flex; align-items: center; gap: 12px;">
                  <span style="width: 32px; height: 32px; background: #10b981; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 14px;">✓</span>
                  <span style="color: #374151; font-size: 15px;">إدارة الموارد البشرية والموظفين</span>
                </li>
                <li style="padding: 12px 0; display: flex; align-items: center; gap: 12px;">
                  <span style="width: 32px; height: 32px; background: #10b981; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 14px;">✓</span>
                  <span style="color: #374151; font-size: 15px;">تقارير وتحليلات متقدمة في الوقت الفعلي</span>
                </li>
              </ul>
            </div>
            
              <div style="text-align: center; margin: 40px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 18px 50px; border-radius: 14px; font-size: 18px; font-weight: 700; box-shadow: 0 10px 30px rgba(16,185,129,0.4); transition: all 0.3s;">
                  تسجيل الدخول للنظام →
                </a>
              </div>

            
            <div style="background: #f8fafc; border-radius: 16px; padding: 25px; text-align: center; border: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">هل تحتاج مساعدة؟ فريق الدعم الفني جاهز لخدمتك</p>
              <p style="color: #10b981; font-size: 16px; font-weight: 700; margin: 0;">support@zoolspeed.com</p>
            </div>
          </div>
          
          <div style="background: #0f172a; padding: 30px 40px; text-align: center;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 10px 0;">© ${new Date().getFullYear()} ZoolSpeed. جميع الحقوق محفوظة</p>
            <p style="color: #475569; font-size: 11px; margin: 0;">هذا البريد مرسل آلياً، يرجى عدم الرد عليه</p>
          </div>
          
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function toggleCompanyStatus(id: number, currentStatus: number) {
  try {
    const newStatus = currentStatus === 1 ? 0 : 1;
    await query("UPDATE companies SET is_active = ? WHERE id = ?", [newStatus, id]);
    revalidatePath("/admin/companies");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function generateToken(id: number, duration: number) {
  try {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    let expiry = null;
    if (duration > 0) {
      const date = new Date();
      date.setDate(date.getDate() + duration);
      expiry = date.toISOString().split('T')[0];
    }
    
    await query("UPDATE companies SET access_token = ?, token_expiry = ? WHERE id = ?", [token, expiry, id]);
    revalidatePath("/admin/companies");
    return { success: true, token };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function sendAdminNotification(data: {
  title: string;
  message: string;
  sent_to_all: boolean;
  image_path?: string;
}) {
  try {
    await query(
      "INSERT INTO admin_notifications (title, message, sent_to_all, image_path) VALUES (?, ?, ?, ?)",
      [data.title, data.message, data.sent_to_all ? 1 : 0, data.image_path || null]
    );
    revalidatePath("/admin/notifications");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCompany(id: number, data: Record<string, any>) {
  try {
    const fields = Object.keys(data);
    const values = Object.values(data);
    
    if (fields.length === 0) {
      return { success: false, error: "No fields to update" };
    }
    
    const setClause = fields.map(field => `${field} = ?`).join(", ");
    await query(`UPDATE companies SET ${setClause} WHERE id = ?`, [...values, id]);
    
    revalidatePath("/admin/companies");
    revalidatePath(`/admin/companies/${id}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCompany(id: number) {
  try {
    if (id === 1) {
      return { success: false, error: "لا يمكن حذف الشركة الرئيسية للمدير" };
    }

    const adminUsers = await query<{ id: number }>("SELECT id FROM users WHERE company_id = ? AND role = 'admin'", [id]);
    if (adminUsers.length > 0) {
      return { success: false, error: "لا يمكن حذف شركة تحتوي على مدير نظام" };
    }

    await execute("DELETE FROM multi_shift_notifications WHERE company_id = ?", [id]);
    await execute("DELETE FROM multi_shift_assignments WHERE company_id = ?", [id]);
    await execute("DELETE FROM multi_shift_settings WHERE company_id = ?", [id]);
    await execute("DELETE FROM multi_shifts WHERE company_id = ?", [id]);
    await execute("DELETE FROM leave_requests WHERE company_id = ?", [id]);
    await execute("DELETE FROM employee_tasks WHERE company_id = ?", [id]);
    await execute("DELETE FROM shifts WHERE company_id = ?", [id]);
    await execute("DELETE FROM maintenance_requests WHERE company_id = ?", [id]);
    await execute("DELETE FROM vehicles WHERE company_id = ?", [id]);
    await execute("DELETE FROM spares WHERE company_id = ?", [id]);
    await execute("DELETE FROM spares_categories WHERE company_id = ?", [id]);
    await execute("DELETE FROM payrolls WHERE company_id = ?", [id]);
    await execute("DELETE FROM payroll_headers WHERE company_id = ?", [id]);
    await execute("DELETE FROM credit_notes WHERE company_id = ?", [id]);
    await execute("DELETE FROM company_bank_accounts WHERE company_id = ?", [id]);
    await execute("DELETE FROM company_documents WHERE company_id = ?", [id]);
    await execute("DELETE FROM company_features WHERE company_id = ?", [id]);
    await execute("DELETE FROM company_permissions WHERE company_id = ?", [id]);
    await execute("DELETE FROM zatca_certificates WHERE company_id = ?", [id]);
    await execute("DELETE FROM users WHERE company_id = ?", [id]);
    await execute("DELETE FROM companies WHERE id = ?", [id]);
    
    revalidatePath("/admin/companies");
    return { success: true, message: "تم حذف الشركة وجميع البيانات المرتبطة بها" };
  } catch (error: any) {
    console.error("Delete company error:", error);
    return { success: false, error: error.message };
  }
}

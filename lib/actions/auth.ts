"use server";

import { AuthResponse, User, Company, ResetToken, SubUser, UserType } from "@/lib/types";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { sendResetCode, sendLoginNotification, sendWelcomeEmail } from "@/lib/mail";
import { supabase } from "@/lib/supabase-client";
import { query, execute } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function registerAction(formData: FormData): Promise<AuthResponse> {
  try {
    const name = formData.get("name") as string;
    const commercial_number = formData.get("commercial_number") as string;
    const vat_number = formData.get("vat_number") as string;
    const phone = formData.get("phone") as string;
    const website = formData.get("website") as string;
    const currency = formData.get("currency") as string;
    const country = formData.get("country") as string;
    const region = formData.get("region") as string;
    const district = formData.get("district") as string;
    const street = formData.get("street") as string;
    const postal_code = formData.get("postal_code") as string;
    const short_address = formData.get("short_address") as string;
    const bank_beneficiary = formData.get("bank_beneficiary") as string;
    const bank_name = formData.get("bank_name") as string;
    const bank_account = formData.get("bank_account") as string;
    const bank_iban = formData.get("bank_iban") as string;
    const transport_license_number = formData.get("transport_license_number") as string;
    const transport_license_type = formData.get("transport_license_type") as string;
    const license_start = formData.get("license_start") as string;
    const license_end = formData.get("license_end") as string;
    const user_email = (formData.get("user_email") as string || "").trim().toLowerCase();
    const password = formData.get("password") as string;

    const logoFile = formData.get("logo_path") as File;
    const stampFile = formData.get("stamp_path") as File;
    const digitalSealFile = formData.get("digital_seal_path") as File;
    const licenseImageFile = formData.get("license_image") as File;

    const uploadFile = async (file: File | null, folder: string) => {
      if (!file || file.size === 0) return null;
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('establishments')
        .upload(filePath, file);

      if (error) throw error;
      const { data: publicUrlData } = supabase.storage
        .from('establishments')
        .getPublicUrl(filePath);
      
      return publicUrlData.publicUrl;
    };

    const logo_path = await uploadFile(logoFile, 'logos');
    const stamp_path = await uploadFile(stampFile, 'stamps');
    const digital_seal_path = await uploadFile(digitalSealFile, 'seals');
    const transport_license_image = await uploadFile(licenseImageFile, 'licenses');

    const existingUsers = await query<any>("SELECT id FROM users WHERE email = ?", [user_email]);

    if (existingUsers && existingUsers.length > 0) {
      return { success: false, error: "البريد الإلكتروني مسجل مسبقاً." };
    }

    const companyResult = await execute(
      `INSERT INTO companies (name, status, is_active, commercial_number, vat_number, phone, website, currency, logo_path, stamp_path, digital_seal_path, country, region, district, street, postal_code, short_address, bank_beneficiary, bank_name, bank_account, bank_iban, transport_license_number, transport_license_type, transport_license_image, license_start, license_end, created_at) VALUES (?, 'pending', 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [name, commercial_number, vat_number, phone, website, currency, logo_path, stamp_path, digital_seal_path, country, region, district, street, postal_code, short_address, bank_beneficiary, bank_name, bank_account, bank_iban, transport_license_number, transport_license_type, transport_license_image, license_start || null, license_end || null]
    );
    
    const companyId = companyResult.insertId;

    const hashedPassword = await bcrypt.hash(password, 10);
    await execute(
      "INSERT INTO users (name, email, password, role, company_id, is_activated, created_at) VALUES (?, ?, ?, 'admin', ?, 0, NOW())",
      [name, user_email, hashedPassword, companyId]
    );

    const features = ['dashboard', 'drivers', 'vehicles', 'tracking', 'reports', 'settings'];
    for (const feature of features) {
      await execute(
        "INSERT INTO company_permissions (company_id, feature_key, is_enabled) VALUES (?, ?, 1)",
        [companyId, feature]
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "حدث خطأ أثناء عملية التسجيل. يرجى المحاولة لاحقاً." };
  }
}

export async function loginAction(formData: FormData): Promise<AuthResponse> {
  const email = (formData.get("email") as string || "").trim().toLowerCase();
  const password = formData.get("password") as string;
  const remember = formData.get("remember") === "on";

  try {
    let user: any = null;
    let userType: UserType = "owner";

    // 1. Try to find in users table
    const users = await query<User & { password?: string }>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users && users.length > 0) {
      user = users[0];
      userType = user.email === process.env.ADMIN_EMAIL ? "admin" : "owner";
    } else {
      // 2. Try to find in company_sub_users table
      const { data: subUser, error: subError } = await supabase
        .from("company_sub_users")
        .select("*")
        .eq("email", email)
        .eq("status", "active")
        .single();

      if (subUser) {
        user = subUser;
        userType = "sub_user";
      }
    }

    if (!user) {
      return { success: false, error: "البريد الإلكتروني غير مسجل." };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password || "");
    if (!isPasswordValid) {
      return { success: false, error: "كلمة المرور غير صحيحة." };
    }

    // Get company data
    const companies = await query<{ name: string; status: string; is_active: number }>(
      "SELECT name, status, is_active FROM companies WHERE id = ?",
      [user.company_id]
    );

    if (!companies || companies.length === 0) {
      return { success: false, error: "لم يتم العثور على بيانات الشركة." };
    }

    const company = companies[0];

    // Status checks
    if (user.email !== "admin@zoolspeed.com") {
      if (company.status !== "approved") {
        return {
          success: false,
          error: "الشركة غير مقبولة بعد. يرجى انتظار مراجعة الإدارة.",
        };
      }

      if (company.is_active !== 1) {
        return {
          success: false,
          error: "الشركة موقوفة. يرجى التواصل مع الإدارة.",
        };
      }
    }

    if (userType === "owner" && user.is_activated === 0 && user.email !== "admin@zoolspeed.com") {
      return {
        success: false,
        error: "الحساب غير مفعل. يرجى انتظار تفعيل الإدارة.",
      };
    }

    // Get permissions
    const permissions: Record<string, number> = {};

    // 1. Get company feature permissions
    const companyPermissionsRows = await query<{ feature_key: string; is_enabled: number }>(
      "SELECT feature_key, is_enabled FROM company_permissions WHERE company_id = ?",
      [user.company_id]
    );

    (companyPermissionsRows || []).forEach((p) => {
      permissions[p.feature_key] = p.is_enabled ? 1 : 0;
    });

    // 2. If sub_user, also get their specific permissions
    if (userType === "sub_user") {
      const subUserPermissionsRows = await query<{ permission_key: string }>(
        "SELECT permission_key FROM sub_user_permissions WHERE sub_user_id = ?",
        [user.id]
      );
      (subUserPermissionsRows || []).forEach((p) => {
        permissions[p.permission_key] = 1;
      });

      // Update last login
      await supabase
        .from("company_sub_users")
        .update({ last_login_at: new Date().toISOString() })
        .eq("id", user.id);
    }

    const cookieStore = await cookies();
    const sessionData: AuthSession = {
      user_id: userType === "sub_user" ? 0 : user.id,
      sub_user_id: userType === "sub_user" ? user.id : undefined,
      user_name: user.name,
      company_id: user.company_id,
      role: user.role || (userType === "sub_user" ? "user" : "admin"),
      permissions,
      user_type: userType,
    };

    cookieStore.set("auth_session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: remember ? 30 * 24 * 60 * 60 : undefined,
      path: "/",
    });

    if (remember) {
      cookieStore.set("user_email", email, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });
    }

    // Login notification for owners
    if (userType === "owner") {
      const today = new Date().toISOString().split('T')[0];
      const lastLoginNotification = await query<{ last_notification_date: string }>(
        "SELECT DATE(last_login_notification) as last_notification_date FROM users WHERE id = ?",
        [user.id]
      );
      
      const lastNotificationDate = lastLoginNotification?.[0]?.last_notification_date;
      
      if (!lastNotificationDate || lastNotificationDate !== today) {
        await execute(
          "UPDATE users SET last_login_notification = NOW() WHERE id = ?",
          [user.id]
        );
        sendLoginNotification(user.email, user.name, company.name || "الشركة").catch(console.error);
      }
    }

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: sessionData.role,
        company_id: user.company_id,
        is_activated: user.is_activated ?? 1,
        user_type: userType,
      },
      permissions,
    };
    } catch (error: any) {
      console.error("Login process exception:", {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      let errorMessage = "خطأ في الاتصال بقاعدة البيانات.";
      
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        errorMessage = "فشل الاتصال بسيرفر MySQL. يرجى التأكد من بيانات قاعدة البيانات في ملف .env";
      } else if (error.message?.includes('supabase')) {
        errorMessage = "فشل الاتصال بخدمة Supabase. يرجى مراجعة مفاتيح الربط.";
      }
      
      return { success: false, error: errorMessage };
    }
}

export async function forgotPasswordAction(formData: FormData): Promise<AuthResponse> {
  const email = (formData.get("email") as string || "").trim().toLowerCase();

  try {
    const users = await query<{ id: number; name: string }>(
      "SELECT id, name FROM users WHERE email = ?",
      [email]
    );

    if (!users || users.length === 0) {
      return { success: false, error: "البريد الإلكتروني غير مسجل في النظام." };
    }

    const user = users[0];
    const token = Math.floor(100000 + Math.random() * 900000).toString();

    await execute("DELETE FROM password_resets WHERE email = ?", [email]);
    await execute(
      "INSERT INTO password_resets (email, token, created_at) VALUES (?, ?, NOW())",
      [email, token]
    );

    await sendResetCode(email, user.name, token);

    const cookieStore = await cookies();
    cookieStore.set("reset_email", email, { maxAge: 15 * 60, path: "/" });
    cookieStore.set("reset_user_name", user.name, { maxAge: 15 * 60, path: "/" });
    cookieStore.set("reset_user_type", "owner", { maxAge: 15 * 60, path: "/" });

    return { success: true };
  } catch (error) {
    console.error("Forgot password error:", error);
    return { success: false, error: "حدث خطأ أثناء معالجة الطلب." };
  }
}

export async function verifyTokenAction(formData: FormData): Promise<AuthResponse> {
  const token = formData.get("token") as string;
  const cookieStore = await cookies();
  const email = cookieStore.get("reset_email")?.value;

  if (!email) {
    return { success: false, error: "انتهت صلاحية الجلسة. يرجى المحاولة مرة أخرى." };
  }

  try {
    const tokens = await query<any>(
      "SELECT * FROM password_resets WHERE email = ? AND token = ? AND created_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)",
      [email, token]
    );

    if (!tokens || tokens.length === 0) {
      return { success: false, error: "رمز التحقق غير صحيح أو منتهي الصلاحية." };
    }

    cookieStore.set("token_verified", "true", { maxAge: 15 * 60, path: "/" });
    return { success: true };
  } catch (error) {
    console.error("Verify token error:", error);
    return { success: false, error: "حدث خطأ أثناء التحقق من الرمز." };
  }
}

export async function resetPasswordAction(formData: FormData): Promise<AuthResponse> {
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;
  const cookieStore = await cookies();
  const email = cookieStore.get("reset_email")?.value;
  const verified = cookieStore.get("token_verified")?.value === "true";
  const userType = cookieStore.get("reset_user_type")?.value || "owner";

  if (!email || !verified) {
    return { success: false, error: "غير مصرح لك بالقيام بهذه العملية." };
  }

  if (password.length < 6) {
    return { success: false, error: "كلمة المرور يجب أن تكون على الأقل 6 أحرف." };
  }

  if (password !== confirm) {
    return { success: false, error: "كلمتا المرور غير متطابقتين." };
  }

    try {
      const hashed = await bcrypt.hash(password, 10);
      
      await execute(
        "UPDATE users SET password = ? WHERE email = ?",
        [hashed, email]
      );
      
      await execute("DELETE FROM password_resets WHERE email = ?", [email]);

    cookieStore.delete("reset_email");
    cookieStore.delete("reset_user_name");
    cookieStore.delete("token_verified");
    cookieStore.delete("reset_user_type");

    return { success: true };
  } catch (error) {
    console.error("Reset password error:", error);
    return { success: false, error: "حدث خطأ أثناء تحديث كلمة المرور." };
  }
}

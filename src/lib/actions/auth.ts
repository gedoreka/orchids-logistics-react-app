"use server";

import { AuthResponse, User, Company, ResetToken } from "@/lib/types";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";
import { sendResetCode } from "@/lib/mail";
import { supabase } from "@/lib/supabase-client";

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
    const user_email = formData.get("user_email") as string;
    const password = formData.get("password") as string;

    // File handling
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

    // Check if user already exists
    const existingUsers = await query("SELECT id FROM users WHERE email = ?", [user_email]);
    if (existingUsers.length > 0) {
      return { success: false, error: "البريد الإلكتروني مسجل مسبقاً." };
    }

    // Insert Company
    const companyResult = await query<{ id: number }>(
      `INSERT INTO companies (
        name, status, is_active, commercial_number, vat_number, phone, website, currency,
        logo_path, stamp_path, digital_seal_path, country, region, district, street,
        postal_code, short_address, bank_beneficiary, bank_name, bank_account, bank_iban,
        transport_license_number, transport_license_type, transport_license_image,
        license_start, license_end, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()) RETURNING id`,
      [
        name, 'pending', 0, commercial_number, vat_number, phone, website, currency,
        logo_path, stamp_path, digital_seal_path, country, region, district, street,
        postal_code, short_address, bank_beneficiary, bank_name, bank_account, bank_iban,
        transport_license_number, transport_license_type, transport_license_image,
        license_start || null, license_end || null
      ]
    );

    const companyId = companyResult[0].id;

    // Insert User
    const hashedPassword = await bcrypt.hash(password, 10);
    await query(
      "INSERT INTO users (name, email, password, role, company_id, is_activated, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())",
      [name, user_email, hashedPassword, 'admin', companyId, 0]
    );

    // Insert Default Permissions
    const features = ['dashboard', 'drivers', 'vehicles', 'tracking', 'reports', 'settings'];
    for (const feature of features) {
      await query(
        "INSERT INTO company_permissions (company_id, feature_key, is_enabled) VALUES (?, ?, ?)",
        [companyId, feature, 1]
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "حدث خطأ أثناء عملية التسجيل. يرجى المحاولة لاحقاً." };
  }
}

export async function loginAction(formData: FormData): Promise<AuthResponse> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const remember = formData.get("remember") === "on";

  try {
    // 1. Fetch user from DB
    const users = await query<User & { password?: string }>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return { success: false, error: "البريد الإلكتروني غير مسجل." };
    }

    const user = users[0];

    // 2. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password || "");
    if (!isPasswordValid) {
      return { success: false, error: "كلمة المرور غير صحيحة." };
    }

    // 3. Check company status
    const companies = await query<Company>(
      "SELECT status, is_active FROM companies WHERE id = ?",
      [user.company_id]
    );

    if (companies.length === 0) {
      return { success: false, error: "لم يتم العثور على بيانات الشركة." };
    }

    const company = companies[0];

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

    if (user.is_activated === 0 && user.email !== "admin@zoolspeed.com") {
      return {
        success: false,
        error: "الحساب غير مفعل. يرجى انتظار تفعيل الإدارة.",
      };
    }

    // 4. Load permissions
    const permissionsRows = await query<{
      feature_key: string;
      is_enabled: number;
    }>(
      "SELECT feature_key, is_enabled FROM company_permissions WHERE company_id = ?",
      [user.company_id]
    );

    const permissions: Record<string, number> = {};
    permissionsRows.forEach((p) => {
      permissions[p.feature_key] = p.is_enabled;
    });

    // 5. Set Session
    const cookieStore = await cookies();
    const sessionData = {
      user_id: user.id,
      user_name: user.name,
      company_id: user.company_id,
      role: user.role,
      permissions,
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

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company_id: user.company_id,
        is_activated: user.is_activated,
      },
      permissions,
    };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "خطأ في الاتصال بقاعدة البيانات." };
  }
}

export async function forgotPasswordAction(formData: FormData): Promise<AuthResponse> {
  const email = formData.get("email") as string;

  try {
    const users = await query<User>("SELECT id, name FROM users WHERE email = ?", [email]);

    if (users.length === 0) {
      return { success: false, error: "البريد الإلكتروني غير مسجل في النظام." };
    }

    const user = users[0];
    const token = Math.floor(100000 + Math.random() * 900000).toString();

    // Use UPSERT for PostgreSQL
    await query(
      `INSERT INTO password_resets (email, token, created_at) 
       VALUES (?, ?, NOW()) 
       ON CONFLICT (email) DO UPDATE SET token = EXCLUDED.token, created_at = NOW()`,
      [email, token]
    );

    // Send Real Email using Hostinger SMTP
    await sendResetCode(email, user.name, token);

    const cookieStore = await cookies();
    cookieStore.set("reset_email", email, { maxAge: 15 * 60, path: "/" });
    cookieStore.set("reset_user_name", user.name, { maxAge: 15 * 60, path: "/" });

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
    const tokens = await query<ResetToken>(
      "SELECT * FROM password_resets WHERE email = ? AND token = ? AND created_at >= NOW() - INTERVAL 15 MINUTE",
      [email, token]
    );

    if (tokens.length === 0) {
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
    await query("UPDATE users SET password = ? WHERE email = ?", [hashed, email]);
    await query("DELETE FROM password_resets WHERE email = ?", [email]);

    cookieStore.delete("reset_email");
    cookieStore.delete("reset_user_name");
    cookieStore.delete("token_verified");

    return { success: true };
  } catch (error) {
    console.error("Reset password error:", error);
    return { success: false, error: "حدث خطأ أثناء تحديث كلمة المرور." };
  }
}

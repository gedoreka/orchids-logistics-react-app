"use server";

import { AuthResponse, User, Company, ResetToken } from "@/lib/types";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";
import { sendResetCode } from "@/lib/mail";

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

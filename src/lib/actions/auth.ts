"use server";

import { AuthResponse, User, Company } from "@/lib/types";
import { cookies } from "next/headers";

// This is a placeholder for the actual database connection
// In a real implementation, you would use a library like 'mysql2' or 'pg'
// to connect to your existing database.

export async function loginAction(formData: FormData): Promise<AuthResponse> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const remember = formData.get("remember") === "on";

  try {
    // 1. Fetch user from DB (Mock logic for now)
    // const user = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    
    // For demonstration, let's assume we found a user
    // In reality, you'd verify password using bcrypt.compare()
    
    if (email === "admin@zoolspeed.com" && password === "admin123") {
      const mockUser: User = {
        id: 1,
        name: "Admin User",
        email: "admin@zoolspeed.com",
        role: "admin",
        company_id: 101,
        is_activated: 1,
      };

      // 2. Check company status (Logic from login.php)
      // const company = await db.query("SELECT status, is_active FROM companies WHERE id = ?", [mockUser.company_id]);
      const mockCompany: Company = {
        id: 101,
        status: 'approved',
        is_active: 1,
      };

      if (!mockCompany) {
        return { success: false, error: "لم يتم العثور على بيانات الشركة." };
      }
      
      if (mockCompany.status !== 'approved') {
        return { success: false, error: "الشركة غير مقبولة بعد. يرجى انتظار مراجعة الإدارة." };
      }
      
      if (mockCompany.is_active !== 1) {
        return { success: false, error: "الشركة موقوفة. يرجى التواصل مع الإدارة." };
      }

      if (mockUser.is_activated === 0 && mockUser.email !== 'admin@zoolspeed.com') {
        return { success: false, error: "الحساب غير مفعل. يرجى انتظار تفعيل الإدارة." };
      }

      // 3. Load permissions
      // const permissions = await db.query("SELECT feature_key, is_enabled FROM company_permissions WHERE company_id = ?", [mockUser.company_id]);
      const mockPermissions = {
        "dashboard": 1,
        "inventory": 1,
        "accounting": 1
      };

      // 4. Set Session (Using JWT or Encrypted Cookies in Next.js)
      const cookieStore = await cookies();
      
      // In a real app, you'd sign a JWT here
      cookieStore.set("auth_session", JSON.stringify({
        user_id: mockUser.id,
        user_name: mockUser.name,
        company_id: mockUser.company_id,
        role: mockUser.role,
        permissions: mockPermissions
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: remember ? 30 * 24 * 60 * 60 : undefined, // 30 days if remember is checked
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
        user: mockUser, 
        permissions: mockPermissions 
      };
    } else {
      return { success: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." };
    }
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "خطأ في الاتصال بالقاعدة البيانات." };
  }
}

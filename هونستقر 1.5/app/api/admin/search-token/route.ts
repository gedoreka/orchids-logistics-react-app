import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "الرجاء إدخال رمز الاشتراك" }, { status: 400 });
    }

    const companies = await query(
      "SELECT * FROM companies WHERE access_token = ?",
      [token]
    );

    if (!companies || companies.length === 0) {
      return NextResponse.json({ error: "لم يتم العثور على رمز الاشتراك" }, { status: 404 });
    }

    const company = companies[0];

    const permissionsResult = await query(
      "SELECT feature_key, is_enabled FROM company_permissions WHERE company_id = ?",
      [company.id]
    );

    const permissions: Record<string, boolean> = {};
    if (permissionsResult) {
      permissionsResult.forEach((row: { feature_key: string; is_enabled: number }) => {
        permissions[row.feature_key] = row.is_enabled === 1;
      });
    }

    return NextResponse.json({
      company,
      permissions
    });

  } catch (error) {
    console.error("Error searching token:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء البحث" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_id, feature_key, is_enabled } = body;

    if (!company_id || !feature_key) {
      return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
    }

    const existing = await query(
      "SELECT id FROM company_permissions WHERE company_id = ? AND feature_key = ?",
      [company_id, feature_key]
    );

    if (existing && existing.length > 0) {
      await execute(
        "UPDATE company_permissions SET is_enabled = ? WHERE company_id = ? AND feature_key = ?",
        [is_enabled ? 1 : 0, company_id, feature_key]
      );
    } else {
      await execute(
        "INSERT INTO company_permissions (company_id, feature_key, is_enabled) VALUES (?, ?, ?)",
        [company_id, feature_key, is_enabled ? 1 : 0]
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error updating permission:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء تحديث الصلاحية" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_id, is_active } = body;

    if (!company_id) {
      return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
    }

    await execute(
      "UPDATE companies SET is_active = ? WHERE id = ?",
      [is_active, company_id]
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error updating company status:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء تحديث حالة الشركة" }, { status: 500 });
  }
}

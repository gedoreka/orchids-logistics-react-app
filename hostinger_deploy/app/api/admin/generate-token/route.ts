import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_id, days, features } = body;

    if (!company_id) {
      return NextResponse.json({ error: "الرجاء اختيار الشركة" }, { status: 400 });
    }

    if (!features || features.length === 0) {
      return NextResponse.json({ error: "الرجاء اختيار صلاحية واحدة على الأقل" }, { status: 400 });
    }

    const token = crypto.randomBytes(6).toString("hex");
    
    let expiryDate: string;
    if (days === 0) {
      const farFuture = new Date();
      farFuture.setFullYear(farFuture.getFullYear() + 100);
      expiryDate = farFuture.toISOString().split('T')[0];
    } else {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + days);
      expiryDate = expiry.toISOString().split('T')[0];
    }

    await execute(
      "UPDATE companies SET access_token = ?, token_expiry = ? WHERE id = ?",
      [token, expiryDate, company_id]
    );

    await execute(
      "DELETE FROM company_permissions WHERE company_id = ?",
      [company_id]
    );

    for (const featureKey of features) {
      await execute(
        "INSERT INTO company_permissions (company_id, feature_key, is_enabled) VALUES (?, ?, 1)",
        [company_id, featureKey]
      );
    }

    return NextResponse.json({
      success: true,
      token: token,
      expiry: expiryDate,
      message: "تم توليد رمز الاشتراك بنجاح"
    });

  } catch (error) {
    console.error("Error generating token:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء توليد الرمز" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { execute, query } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const plans = await query(`SELECT * FROM subscription_plans WHERE id = ?`, [id]);
    
    if (plans.length === 0) {
      return NextResponse.json({ success: false, error: "الباقة غير موجودة" }, { status: 404 });
    }

    return NextResponse.json({ success: true, plan: plans[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      name_en,
      description,
      description_en,
      price,
      duration_value,
      duration_unit,
      trial_days,
      is_active,
      features,
      services,
      include_all_services,
      sort_order
    } = body;

    await execute(`
      UPDATE subscription_plans SET
        name = ?,
        name_en = ?,
        description = ?,
        description_en = ?,
        price = ?,
        duration_value = ?,
        duration_unit = ?,
        trial_days = ?,
        is_active = ?,
        features = ?,
        services = ?,
        include_all_services = ?,
        sort_order = ?
      WHERE id = ?
    `, [
      name,
      name_en || null,
      description || null,
      description_en || null,
      price || 0,
      duration_value || 1,
      duration_unit || 'months',
      trial_days || 0,
      is_active !== undefined ? is_active : 1,
      features ? JSON.stringify(features) : null,
      services ? JSON.stringify(services) : null,
      include_all_services !== undefined ? include_all_services : 1,
      sort_order || 0,
      id
    ]);

    return NextResponse.json({ success: true, message: "تم تحديث الباقة بنجاح" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const subscriptions = await query(
      `SELECT id FROM company_subscriptions WHERE plan_id = ? AND status = 'active'`,
      [id]
    );

    if (subscriptions.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: "لا يمكن حذف باقة لديها اشتراكات نشطة" 
      }, { status: 400 });
    }

    await execute(`DELETE FROM plan_permissions WHERE plan_id = ?`, [id]);
    await execute(`DELETE FROM subscription_plans WHERE id = ?`, [id]);

    return NextResponse.json({ success: true, message: "تم حذف الباقة بنجاح" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

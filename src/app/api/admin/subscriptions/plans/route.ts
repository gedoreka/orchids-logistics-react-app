import { NextRequest, NextResponse } from "next/server";
import { execute, query } from "@/lib/db";

export async function GET() {
  try {
    const plans = await query(`
      SELECT * FROM subscription_plans 
      ORDER BY sort_order ASC, id ASC
    `);

    return NextResponse.json({ success: true, plans });
  } catch (error: any) {
    console.error("Error fetching plans:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      name_en,
      description,
      price,
      duration_value,
      duration_unit,
      is_active,
      services,
      include_all_services,
      sort_order
    } = body;

    const result = await execute(`
      INSERT INTO subscription_plans 
      (name, name_en, description, price, duration_value, duration_unit, free_trial_days, is_active, includes_all_services, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name,
      name_en || null,
      description || null,
      price || 0,
      duration_value || 1,
      duration_unit || 'months',
      0,
      is_active !== undefined ? is_active : 1,
      include_all_services !== undefined ? include_all_services : 1,
      sort_order || 0
    ]);

    const planId = result.insertId;

    if (services && services.length > 0 && !include_all_services) {
      for (const serviceKey of services) {
        await execute(`
          INSERT INTO plan_permissions (plan_id, permission_key)
          VALUES (?, ?)
          ON DUPLICATE KEY UPDATE permission_key = permission_key
        `, [planId, serviceKey]);
      }
    }

    return NextResponse.json({ 
      success: true, 
      id: planId,
      message: "تم إنشاء الباقة بنجاح" 
    });
  } catch (error: any) {
    console.error("Error creating plan:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

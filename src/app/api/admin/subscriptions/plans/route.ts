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

    const result = await execute(`
      INSERT INTO subscription_plans 
      (name, name_en, description, description_en, price, duration_value, duration_unit, trial_days, is_active, features, services, include_all_services, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      sort_order || 0
    ]);

    return NextResponse.json({ 
      success: true, 
      id: result.insertId,
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

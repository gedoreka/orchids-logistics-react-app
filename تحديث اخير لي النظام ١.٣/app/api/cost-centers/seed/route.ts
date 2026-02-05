import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { company_id } = await req.json();

    if (!company_id) {
      return NextResponse.json({ success: false, error: "Company ID is required" }, { status: 400 });
    }

    // Main Centers
    const mainCenters = [
      { code: "MAIN-01", name: "مراكز تكلفة النشاط الأساسي", type: "main", desc: "النطاق: جميع الأنشطة التشغيلية الأساسية للمنشأة" },
      { code: "MAIN-02", name: "مراكز تكلفة الدعم والخدمات", type: "main", desc: "النطاق: الإدارات المساندة والخدمات المشتركة" }
    ];

    for (const main of mainCenters) {
      // Check if already exists
      const exists = await query<any>("SELECT id FROM cost_centers WHERE center_code = ? AND company_id = ?", [main.code, company_id]);
      let parentId;
      if (exists.length === 0) {
        const result: any = await query("INSERT INTO cost_centers (center_code, center_name, center_type, description, company_id) VALUES (?, ?, ?, ?, ?)", 
          [main.code, main.name, main.type, main.desc, company_id]);
        parentId = result.insertId;
      } else {
        parentId = exists[0].id;
      }

      // Sub Centers
      if (main.code === "MAIN-01") {
        const subs = [
          { code: "CTR-01", name: "مركز تكلفة النقل البري", desc: "النطاق: جميع عمليات النقل البري المحلي والدولي\nالتكاليف المباشرة: وقود، صيانة، رواتب سائقين، رسوم طرق" },
          { code: "CTR-02", name: "مركز تكلفة التوصيل السريع", desc: "النطاق: خدمات التوصيل داخل المدن\nالتكاليف المباشرة: وقود، إطارات، بدل سفر مندوبين" },
          { code: "CTR-03", name: "مركز تكلفة التخزين والمستودعات", desc: "النطاق: إدارة وتشغيل المستودعات\nالتكاليف المباشرة: إيجار، كهرباء، روابط عمال التخزين" }
        ];
        for (const sub of subs) {
           const subExists = await query<any>("SELECT id FROM cost_centers WHERE center_code = ? AND company_id = ?", [sub.code, company_id]);
           if (subExists.length === 0) {
             await query("INSERT INTO cost_centers (center_code, center_name, center_type, description, parent_id, company_id) VALUES (?, ?, 'sub', ?, ?, ?)", 
               [sub.code, sub.name, sub.desc, parentId, company_id]);
           }
        }
      } else if (main.code === "MAIN-02") {
        const subs = [
          { code: "CTS-01", name: "مركز تكلفة الدعم اللوجستي", desc: "النطاق: التخطيط - التتبع - التنسيق\nالتكاليف: روابط موظفي التخطيط، اتصالات، أنظمة تتبع" },
          { code: "CTS-02", name: "مركز تكلفة المبيعات والتسويق", desc: "النطاق: التسويق - المبيعات - خدمة العملاء\nالتكاليف: إعلانات، عمولات، مشاركة معارض" },
          { code: "CTS-03", name: "مركز تكلفة الإدارة العامة", desc: "النطاق: الإدارة العليا - الشؤون المالية - الموارد البشرية\nالتكاليف: رواتب الإدارة، إيجار مكاتب، أتعاب محاسبية" }
        ];
        for (const sub of subs) {
          const subExists = await query<any>("SELECT id FROM cost_centers WHERE center_code = ? AND company_id = ?", [sub.code, company_id]);
          if (subExists.length === 0) {
            await query("INSERT INTO cost_centers (center_code, center_name, center_type, description, parent_id, company_id) VALUES (?, ?, 'sub', ?, ?, ?)", 
              [sub.code, sub.name, sub.desc, parentId, company_id]);
          }
        }
      }
    }

    return NextResponse.json({ success: true, message: "Cost centers seeded successfully" });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

const DEFAULT_COA = [
  // Level 1: Main Parents
  { code: "1", name: "الأصول", type: "أصل", account_type: "main", parent_code: null },
  { code: "2", name: "الالتزامات", type: "خصم", account_type: "main", parent_code: null },
  { code: "3", name: "حقوق الملكية", type: "خصم", account_type: "main", parent_code: null },
  { code: "4", name: "الإيرادات", type: "دخل", account_type: "main", parent_code: null },
  { code: "5", name: "المصروفات", type: "مصروف", account_type: "main", parent_code: null },

  // Level 2: Under 1 (Assets)
  { code: "11", name: "الأصول المتداولة", type: "أصل", account_type: "main", parent_code: "1" },
  { code: "12", name: "الأصول الثابتة", type: "أصل", account_type: "main", parent_code: "1" },

  // Level 3: Under 11 (Current Assets)
  { code: "111", name: "النقدية والشيكات", type: "أصل", account_type: "sub", parent_code: "11" },
  { code: "112", name: "البنوك", type: "أصل", account_type: "sub", parent_code: "11" },
  { code: "113", name: "العملاء", type: "أصل", account_type: "sub", parent_code: "11" },
  { code: "114", name: "مخزون الوقود", type: "أصل", account_type: "sub", parent_code: "11" },
  { code: "115", name: "مخزون قطع الغيار", type: "أصل", account_type: "sub", parent_code: "11" },
  { code: "116", name: "مصروفات مقدمة", type: "أصل", account_type: "sub", parent_code: "11" },

  // Level 3: Under 12 (Fixed Assets)
  { code: "121", name: "وسائل النقل", type: "أصل", account_type: "main", parent_code: "12" },
  { code: "122", name: "معدات المستودعات", type: "أصل", account_type: "main", parent_code: "12" },
  { code: "123", name: "المباني والأراضي", type: "أصل", account_type: "main", parent_code: "12" },

  // Level 4: Under 121 (Transport)
  { code: "1211", name: "شاحنات نقل", type: "أصل", account_type: "sub", parent_code: "121" },
  { code: "1212", name: "سيارات توصيل", type: "أصل", account_type: "sub", parent_code: "121" },
  { code: "1213", name: "دراجات نارية للتوصيل", type: "أصل", account_type: "sub", parent_code: "121" },

  // Level 4: Under 122 (Warehouse Equipment)
  { code: "1221", name: "رافعات شوكية", type: "أصل", account_type: "sub", parent_code: "122" },
  { code: "1222", name: "أرفف تخزين", type: "أصل", account_type: "sub", parent_code: "122" },

  // Level 4: Under 123 (Buildings/Land)
  { code: "1231", name: "مستودعات", type: "أصل", account_type: "sub", parent_code: "123" },
  { code: "1232", name: "مكاتب إدارية", type: "أصل", account_type: "sub", parent_code: "123" },

  // Level 2: Under 2 (Liabilities)
  { code: "21", name: "الالتزامات المتداولة", type: "خصم", account_type: "main", parent_code: "2" },
  { code: "22", name: "الالتزامات طويلة الأجل", type: "خصم", account_type: "main", parent_code: "2" },

  // Level 3: Under 21 (Current Liabilities)
  { code: "211", name: "الموردون", type: "خصم", account_type: "sub", parent_code: "21" },
  { code: "212", name: "قروض قصيرة الأجل", type: "خصم", account_type: "sub", parent_code: "21" },
  { code: "213", name: "مصروفات مستحقة", type: "خصم", account_type: "sub", parent_code: "21" },

  // Level 3: Under 22 (Long-term Liabilities)
  { code: "221", name: "قروض طويلة الأجل", type: "خصم", account_type: "sub", parent_code: "22" },

  // Level 2: Under 3 (Equity)
  { code: "31", name: "رأس المال", type: "خصم", account_type: "sub", parent_code: "3" },
  { code: "32", name: "الأرباح المحتجزة", type: "خصم", account_type: "sub", parent_code: "3" },
  { code: "33", name: "الأرباح والخسائر", type: "خصم", account_type: "sub", parent_code: "3" },

  // Level 2: Under 4 (Revenue)
  { code: "41", name: "إيرادات النقل", type: "دخل", account_type: "main", parent_code: "4" },
  { code: "42", name: "إيرادات التوصيل السريع", type: "دخل", account_type: "main", parent_code: "4" },
  { code: "43", name: "إيرادات التخزين", type: "دخل", account_type: "main", parent_code: "4" },

  // Level 3: Under 41 (Transport Revenue)
  { code: "411", name: "نقل بضائع داخل المدينة", type: "دخل", account_type: "sub", parent_code: "41" },
  { code: "412", name: "نقل بضائع بين المدن", type: "دخل", account_type: "sub", parent_code: "41" },
  { code: "413", name: "نقل دولي", type: "دخل", account_type: "sub", parent_code: "41" },

  // Level 3: Under 42 (Delivery Revenue)
  { code: "421", name: "توصيل وثائق", type: "دخل", account_type: "sub", parent_code: "42" },
  { code: "422", name: "توصيل طرود", type: "دخل", account_type: "sub", parent_code: "42" },
  { code: "423", name: "توصيل طعام", type: "دخل", account_type: "sub", parent_code: "42" },

  // Level 3: Under 43 (Storage Revenue)
  { code: "431", name: "تخزين قصير الأجل", type: "دخل", account_type: "sub", parent_code: "43" },
  { code: "432", name: "تخزين طويل الأجل", type: "دخل", account_type: "sub", parent_code: "43" },

  // Level 2: Under 5 (Expenses)
  { code: "51", name: "تكاليف مباشرة", type: "مصروف", account_type: "main", parent_code: "5" },
  { code: "52", name: "مصاريف تشغيلية", type: "مصروف", account_type: "main", parent_code: "5" },
  { code: "53", name: "مصاريف عمومية وإدارية", type: "مصروف", account_type: "main", parent_code: "5" },

  // Level 3: Under 51 (Direct Costs)
  { code: "511", name: "وقود وسائل النقل", type: "مصروف", account_type: "sub", parent_code: "51" },
  { code: "512", name: "صيانة وإصلاح المركبات", type: "مصروف", account_type: "sub", parent_code: "51" },
  { code: "513", name: "رواتب السائقين وفرق التوصيل", type: "مصروف", account_type: "sub", parent_code: "51" },
  { code: "514", name: "التأمينات والتراخيص", type: "مصروف", account_type: "sub", parent_code: "51" },
  { code: "515", name: "تكاليف التعبئة والتغليف", type: "مصروف", account_type: "sub", parent_code: "51" },

  // Level 3: Under 52 (Operating Expenses)
  { code: "521", name: "إيجار المستودعات", type: "مصروف", account_type: "sub", parent_code: "52" },
  { code: "522", name: "رواتب الموظفين الإداريين", type: "مصروف", account_type: "sub", parent_code: "52" },
  { code: "523", name: "كهرباء ومياه", type: "مصروف", account_type: "sub", parent_code: "52" },
  { code: "524", name: "اتصالات وإنترنت", type: "مصروف", account_type: "sub", parent_code: "52" },
  { code: "525", name: "مصاريف تسويقية", type: "مصروف", account_type: "sub", parent_code: "52" },

  // Level 3: Under 53 (General & Admin)
  { code: "531", name: "رواتب الإدارة", type: "مصروف", account_type: "sub", parent_code: "53" },
  { code: "532", name: "مصاريف مكتبية", type: "مصروف", account_type: "sub", parent_code: "53" },
  { code: "533", name: "برامج وأنظمة إلكترونية", type: "مصروف", account_type: "sub", parent_code: "53" },
  { code: "534", name: "استشارات قانونية ومحاسبية", type: "مصروف", account_type: "sub", parent_code: "53" },
];

export async function POST(request: NextRequest) {
  try {
    const { company_id } = await request.json();

    if (!company_id) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 });
    }

    // Check if company already has accounts
    const existing = await query("SELECT id FROM accounts WHERE company_id = ? LIMIT 1", [company_id]);
    if (existing.length > 0) {
      // If accounts exist, we don't seed to prevent duplication unless requested.
      // But user said "مع الاحتفاظ بالمضاف حاليا", so we skip if code exists.
    }

    const insertedAccounts: Record<string, number> = {};

    // Sort by code length to ensure parents are inserted first
    const sortedCOA = [...DEFAULT_COA].sort((a, b) => a.code.length - b.code.length);

    for (const item of sortedCOA) {
      // Check if this specific code exists for this company
      const check = await query(
        "SELECT id FROM accounts WHERE account_code = ? AND company_id = ?",
        [item.code, company_id]
      );

      if (check.length > 0) {
        insertedAccounts[item.code] = check[0].id;
        continue;
      }

      const parentId = item.parent_code ? insertedAccounts[item.parent_code] : null;

      const result = await query(
        "INSERT INTO accounts (account_code, account_name, type, company_id, parent_id, account_type) VALUES (?, ?, ?, ?, ?, ?)",
        [item.code, item.name, item.type, company_id, parentId, item.account_type]
      );

      insertedAccounts[item.code] = result.insertId;
    }

    return NextResponse.json({ 
      success: true, 
      message: "تم تهيئة شجرة الحسابات بنجاح",
      count: Object.keys(insertedAccounts).length 
    });
  } catch (error) {
    console.error("Error seeding COA:", error);
    return NextResponse.json({ error: "Failed to seed accounts" }, { status: 500 });
  }
}

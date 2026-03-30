import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get("company_id");
  if (!companyId) {
    return NextResponse.json({ success: false, error: "Missing company_id" }, { status: 400 });
  }

  try {
    // 1. Identity expiry notifications
    const expiryEmployees = await query(
      `SELECT e.id, e.name, e.name_en, e.iqama_expiry, e.iqama_number, e.package_id, p.group_name as package_name
       FROM employees e
       LEFT JOIN employee_packages p ON e.package_id = p.id
       WHERE e.company_id = ? AND e.is_active = 1 AND e.iqama_expiry IS NOT NULL
       ORDER BY e.iqama_expiry ASC`,
      [companyId]
    );

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const expired: any[] = [];
    const expiringSoon: any[] = []; // within 90 days

    for (const emp of expiryEmployees as any[]) {
      const expiryDate = new Date(emp.iqama_expiry);
      expiryDate.setHours(0, 0, 0, 0);
      const diffMs = expiryDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        expired.push({ ...emp, days_remaining: diffDays, status: 'expired' });
      } else if (diffDays <= 90) {
        expiringSoon.push({ ...emp, days_remaining: diffDays, status: 'expiring_soon' });
      }
    }

    // 2. Incomplete employee data notifications (per package)
    // Check key fields: name, iqama_number, phone, basic_salary, iqama_expiry, birth_date, nationality
    const requiredFields = ['name', 'iqama_number', 'phone', 'basic_salary', 'iqama_expiry', 'nationality'];
    
    const incompleteEmployees = await query(
      `SELECT e.id, e.name, e.name_en, e.package_id, p.group_name as package_name,
              e.iqama_number, e.phone, e.basic_salary, e.iqama_expiry, e.nationality, e.birth_date, e.email, e.position
       FROM employees e
       LEFT JOIN employee_packages p ON e.package_id = p.id
       WHERE e.company_id = ? AND e.is_active = 1
       AND (
         e.name IS NULL OR e.name = '' OR
         e.iqama_number IS NULL OR e.iqama_number = '' OR
         e.phone IS NULL OR e.phone = '' OR
         e.basic_salary IS NULL OR e.basic_salary = 0 OR
         e.iqama_expiry IS NULL OR
         e.nationality IS NULL OR e.nationality = ''
       )
       ORDER BY p.group_name, e.name`,
      [companyId]
    );

    // Group incomplete by package
    const incompleteByPackage: Record<number, { package_name: string; package_id: number; employees: any[] }> = {};
    for (const emp of incompleteEmployees as any[]) {
      const pkgId = emp.package_id;
      if (!incompleteByPackage[pkgId]) {
        incompleteByPackage[pkgId] = {
          package_id: pkgId,
          package_name: emp.package_name || 'غير محدد',
          employees: []
        };
      }
      const missingFields: string[] = [];
      if (!emp.name) missingFields.push('name');
      if (!emp.iqama_number) missingFields.push('iqama_number');
      if (!emp.phone) missingFields.push('phone');
      if (!emp.basic_salary || emp.basic_salary === 0) missingFields.push('basic_salary');
      if (!emp.iqama_expiry) missingFields.push('iqama_expiry');
      if (!emp.nationality) missingFields.push('nationality');

      incompleteByPackage[pkgId].employees.push({
        id: emp.id,
        name: emp.name || emp.name_en || `موظف #${emp.id}`,
        missing_fields: missingFields,
        missing_count: missingFields.length
      });
    }

    return NextResponse.json({
      success: true,
      identity: {
        expired,
        expiring_soon: expiringSoon,
        total_expired: expired.length,
        total_expiring_soon: expiringSoon.length,
      },
      incomplete: {
        packages: Object.values(incompleteByPackage),
        total_incomplete: (incompleteEmployees as any[]).length,
      }
    });
  } catch (error: any) {
    console.error("HR notifications error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

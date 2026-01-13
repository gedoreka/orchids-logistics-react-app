"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createEmployeePackage(data: {
  group_name: string;
  work_type: string;
  monthly_target: number;
  bonus_after_target: number;
  company_id: number;
}) {
  try {
    await query(
      "INSERT INTO employee_packages (group_name, work_type, monthly_target, bonus_after_target, company_id) VALUES (?, ?, ?, ?, ?)",
      [data.group_name, data.work_type, data.monthly_target, data.bonus_after_target, data.company_id]
    );
    revalidatePath("/hr");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteEmployeePackage(id: number) {
  try {
    // Check if employees are assigned to this package
    const employees = await query<{ count: string }>(
      "SELECT COUNT(*) as count FROM employees WHERE package_id = ?",
      [id]
    );
    
    if (Number(employees[0].count) > 0) {
      return { success: false, error: "لا يمكن حذف هذه الباقة لأنها مرتبطة بموظفين." };
    }

    await query("DELETE FROM employee_packages WHERE id = ?", [id]);
    revalidatePath("/hr");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function saveEmployees(packageId: number, employees: any[]) {
  try {
    for (const emp of employees) {
      await query(
        `INSERT INTO employees (
          name, iqama_number, identity_number, nationality, user_code, 
          phone, email, job_title, basic_salary, housing_allowance, 
          vehicle_plate, iban, package_id, company_id, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          emp.name, emp.iqama_number || null, emp.identity_number || null, emp.nationality, emp.user_code || null,
          emp.phone || null, emp.email || null, emp.job_title || null, emp.basic_salary, emp.housing_allowance || 0,
          emp.vehicle_plate || null, emp.iban || null, packageId, emp.company_id
        ]
      );
    }
    revalidatePath(`/hr/packages/${packageId}`);
    return { success: true, message: "تم حفظ الموظفين بنجاح" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addViolation(data: {
  employee_id: number;
  violation_type: string;
  violation_date: string;
  violation_amount: number;
  deducted_amount: number;
  status: string;
  violation_description: string;
}) {
  try {
    const remaining_amount = data.violation_amount - data.deducted_amount;
    await query(
      `INSERT INTO employee_violations 
      (employee_id, violation_type, violation_date, violation_amount, deducted_amount, remaining_amount, status, violation_description) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.employee_id, data.violation_type, data.violation_date, data.violation_amount, data.deducted_amount, remaining_amount, data.status, data.violation_description]
    );
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addLetter(data: {
  employee_id: number;
  letter_type: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  violation_amount: number;
  letter_details: string;
  document_path?: string;
}) {
  try {
    await query(
      `INSERT INTO employee_letters 
      (employee_id, letter_type, start_date, end_date, duration_days, violation_amount, letter_details, document_path) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.employee_id, data.letter_type, data.start_date, data.end_date, data.duration_days, data.violation_amount, data.letter_details, data.document_path || null]
    );
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

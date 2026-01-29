"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createPackageWithEmployees(data: {
  group_name: string;
  work_type: string;
  monthly_target: number;
  bonus_after_target: number;
  company_id: number;
  employees: any[];
}) {
  try {
    const result: any = await query(
      "INSERT INTO employee_packages (group_name, work_type, monthly_target, bonus_after_target, company_id) VALUES (?, ?, ?, ?, ?)",
      [data.group_name, data.work_type, data.monthly_target, data.bonus_after_target, data.company_id]
    );
    
    // In MySQL, pool.execute result for INSERT contains insertId
    // However, our query helper returns rows. Let's see how to get insertId.
    // If using pool.execute directly, it returns [result, fields].
    // Our 'execute' helper returns just result.
    
    // Let's use 'execute' helper which returns the result object.
    const insertResult = await query<any>("SELECT LAST_INSERT_ID() as id");
    const packageId = insertResult[0].id;

    if (data.employees && data.employees.length > 0) {
      for (const emp of data.employees) {
        if (!emp.name) continue;
        await query(
          `INSERT INTO employees (
            name, iqama_number, identity_number, nationality, user_code, 
            phone, email, job_title, basic_salary, housing_allowance, 
            vehicle_plate, iban, package_id, company_id, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          [
            emp.name, emp.iqama_number || null, emp.identity_number || null, emp.nationality || null, emp.user_code || null,
            emp.phone || null, emp.email || null, emp.job_title || null, emp.basic_salary || 0, emp.housing_allowance || 0,
            emp.vehicle_plate || null, emp.iban || null, packageId, data.company_id
          ]
        );
      }
    }

    revalidatePath("/hr");
    revalidatePath("/hr/packages");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating package with employees:", error);
    return { success: false, error: error.message };
  }
}

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
    revalidatePath("/hr/packages");
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
    revalidatePath("/hr/packages");
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
    revalidatePath("/hr");
    return { success: true, message: "تم حفظ الموظفين بنجاح" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateEmployeePersonalInfo(id: number, data: any) {
  try {
    await query(
      `UPDATE employees SET 
        iqama_number = ?, identity_number = ?, job_title = ?, user_code = ?, nationality = ?, 
        phone = ?, email = ?, vehicle_plate = ?, 
        birth_date = ?, passport_number = ?, operation_card_number = ?,
        basic_salary = ?, housing_allowance = ?
      WHERE id = ?`,
      [
        data.iqama_number, data.identity_number, data.job_title, data.user_code, data.nationality,
        data.phone, data.email, data.vehicle_plate,
        data.birth_date || null, data.passport_number, data.operation_card_number,
        data.basic_salary, data.housing_allowance,
        id
      ]
    );
    revalidatePath(`/hr/employees/${id}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateEmployeeBankInfo(id: number, data: any) {
  try {
    await query(
      `UPDATE employees SET bank_account = ?, iban = ?, bank_name = ? WHERE id = ?`,
      [data.bank_account, data.iban, data.bank_name, id]
    );
    revalidatePath(`/hr/employees/${id}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleEmployeeStatus(id: number, currentStatus: number) {
  try {
    const newStatus = currentStatus === 1 ? 0 : 1;
    await query("UPDATE employees SET is_active = ? WHERE id = ?", [newStatus, id]);
    revalidatePath("/hr");
    revalidatePath("/hr/packages");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleEmployeeFreeze(id: number, currentFrozen: number) {
  try {
    const newFrozen = currentFrozen === 1 ? 0 : 1;
    await query("UPDATE employees SET is_frozen = ? WHERE id = ?", [newFrozen, id]);
    revalidatePath("/hr/packages");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteEmployee(id: number) {
  try {
    await query("DELETE FROM employees WHERE id = ?", [id]);
    revalidatePath("/hr");
    revalidatePath("/hr/packages");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateEmployeeDocument(id: number, field: string, path: string) {
  try {
    const allowedFields = [
      'personal_photo', 'iqama_file', 'license_file', 'vehicle_file', 
      'agir_permit_file', 'work_contract_file', 'vehicle_operation_card'
    ];
    if (!allowedFields.includes(field)) throw new Error("Field not allowed");

    await query(`UPDATE employees SET ${field} = ? WHERE id = ?`, [path, id]);
    revalidatePath(`/hr/employees/${id}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateIqamaExpiry(id: number, expiryDate: string) {
  try {
    await query("UPDATE employees SET iqama_expiry = ? WHERE id = ?", [expiryDate, id]);
    revalidatePath("/hr");
    revalidatePath("/hr/packages");
    return { success: true };
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
    revalidatePath(`/hr/employees/${data.employee_id}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateViolation(id: number, employeeId: number, data: any) {
  try {
    const remaining_amount = data.violation_amount - data.deducted_amount;
    await query(
      `UPDATE employee_violations SET 
        violation_type = ?, violation_date = ?, violation_amount = ?, 
        deducted_amount = ?, remaining_amount = ?, status = ?, violation_description = ? 
      WHERE id = ?`,
      [
        data.violation_type, data.violation_date, data.violation_amount, 
        data.deducted_amount, remaining_amount, data.status, data.violation_description, 
        id
      ]
    );
    revalidatePath(`/hr/employees/${employeeId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteViolation(id: number, employeeId: number) {
  try {
    await query("DELETE FROM employee_violations WHERE id = ?", [id]);
    revalidatePath(`/hr/employees/${employeeId}`);
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
    revalidatePath(`/hr/employees/${data.employee_id}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateLetter(id: number, employeeId: number, data: any) {
  try {
    await query(
      `UPDATE employee_letters SET 
        letter_type = ?, start_date = ?, end_date = ?, 
        duration_days = ?, violation_amount = ?, letter_details = ? 
      WHERE id = ?`,
      [
        data.letter_type, data.start_date, data.end_date, 
        data.duration_days, data.violation_amount, data.letter_details, 
        id
      ]
    );
    revalidatePath(`/hr/employees/${employeeId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteLetter(id: number, employeeId: number) {
  try {
    await query("DELETE FROM employee_letters WHERE id = ?", [id]);
    revalidatePath(`/hr/employees/${employeeId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createTask(data: any) {
  try {
    await query(
      `INSERT INTO employee_tasks (title, description, assigned_to, company_id, due_date, priority, status, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.title, data.description, data.assigned_to || null, data.company_id, data.due_date, data.priority, data.status, data.created_by]
    );
    revalidatePath("/hr/tasks");
    revalidatePath("/hr");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTaskStatus(id: number, status: string) {
  try {
    await query("UPDATE employee_tasks SET status = ? WHERE id = ?", [status, id]);
    revalidatePath("/hr/tasks");
    revalidatePath("/hr");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTask(id: number) {
  try {
    await query("DELETE FROM employee_tasks WHERE id = ?", [id]);
    revalidatePath("/hr/tasks");
    revalidatePath("/hr");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getEmployeeBankAccounts(employeeId: number) {
  try {
    const accounts = await query(
      "SELECT * FROM employee_bank_accounts WHERE employee_id = ? ORDER BY is_primary DESC, created_at DESC",
      [employeeId]
    );
    return { success: true, data: accounts };
  } catch (error: any) {
    return { success: false, error: error.message, data: [] };
  }
}

export async function addBankAccount(data: {
  employee_id: number;
  bank_name: string;
  account_number: string;
  iban: string;
  is_primary?: boolean;
}) {
  try {
    if (data.is_primary) {
      await query(
        "UPDATE employee_bank_accounts SET is_primary = false WHERE employee_id = ?",
        [data.employee_id]
      );
    }
    await query(
      `INSERT INTO employee_bank_accounts (employee_id, bank_name, account_number, iban, is_primary) 
       VALUES (?, ?, ?, ?, ?)`,
      [data.employee_id, data.bank_name, data.account_number, data.iban, data.is_primary || false]
    );
    revalidatePath(`/hr/employees/${data.employee_id}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateBankAccount(id: number, employeeId: number, data: {
  bank_name: string;
  account_number: string;
  iban: string;
  is_primary?: boolean;
}) {
  try {
    if (data.is_primary) {
      await query(
        "UPDATE employee_bank_accounts SET is_primary = false WHERE employee_id = ?",
        [employeeId]
      );
    }
    await query(
      `UPDATE employee_bank_accounts SET bank_name = ?, account_number = ?, iban = ?, is_primary = ? WHERE id = ?`,
      [data.bank_name, data.account_number, data.iban, data.is_primary || false, id]
    );
    revalidatePath(`/hr/employees/${employeeId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteBankAccount(id: number, employeeId: number) {
  try {
    await query("DELETE FROM employee_bank_accounts WHERE id = ?", [id]);
    revalidatePath(`/hr/employees/${employeeId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function setPrimaryBankAccount(id: number, employeeId: number) {
  try {
    await query(
      "UPDATE employee_bank_accounts SET is_primary = false WHERE employee_id = ?",
      [employeeId]
    );
    await query(
      "UPDATE employee_bank_accounts SET is_primary = true WHERE id = ?",
      [id]
    );
    revalidatePath(`/hr/employees/${employeeId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

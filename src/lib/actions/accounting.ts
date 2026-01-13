"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createAccount(data: {
  account_code: string;
  account_name: string;
  type: string;
  company_id: number;
}) {
  try {
    await query(
      "INSERT INTO accounts (account_code, account_name, type, company_id) VALUES (?, ?, ?, ?)",
      [data.account_code, data.account_name, data.type, data.company_id]
    );
    revalidatePath("/accounts");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateAccount(id: number, data: {
  account_code: string;
  account_name: string;
  type: string;
}) {
  try {
    await query(
      "UPDATE accounts SET account_code = ?, account_name = ?, type = ? WHERE id = ?",
      [data.account_code, data.account_name, data.type, id]
    );
    revalidatePath("/accounts");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAccount(id: number) {
  try {
    // Check for expenses first
    const expenses = await query<{ count: string }>(
      "SELECT COUNT(*) as count FROM monthly_expenses WHERE account_id = ?",
      [id]
    );
    
    if (Number(expenses[0].count) > 0) {
      return { success: false, error: "لا يمكن حذف هذا الحساب لأنه مرتبط بمصروفات." };
    }

    await query("DELETE FROM accounts WHERE id = ?", [id]);
    revalidatePath("/accounts");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createCostCenter(data: {
  center_code: string;
  center_name: string;
  company_id: number;
}) {
  try {
    await query(
      "INSERT INTO cost_centers (center_code, center_name, company_id) VALUES (?, ?, ?)",
      [data.center_code, data.center_name, data.company_id]
    );
    revalidatePath("/cost-centers");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCostCenter(id: number, data: {
  center_code: string;
  center_name: string;
}) {
  try {
    await query(
      "UPDATE cost_centers SET center_code = ?, center_name = ? WHERE id = ?",
      [data.center_code, data.center_name, id]
    );
    revalidatePath("/cost-centers");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCostCenter(id: number) {
  try {
    // Check for expenses first
    const expenses = await query<{ count: string }>(
      "SELECT COUNT(*) as count FROM monthly_expenses WHERE cost_center_id = ?",
      [id]
    );
    
    if (Number(expenses[0].count) > 0) {
      return { success: false, error: "لا يمكن حذف مركز التكلفة لأنه مرتبط بمصروفات." };
    }

    await query("DELETE FROM cost_centers WHERE id = ?", [id]);
    revalidatePath("/cost-centers");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateCompanyProfile(companyId: number, data: any) {
  try {
    const fields = [
      "transport_license_number",
      "transport_license_type",
      "license_start",
      "license_end"
    ];
    
    let sql = "UPDATE companies SET ";
    const params = [];
    
    fields.forEach((field, index) => {
      sql += `${field} = ?${index < fields.length - 1 ? ", " : ""}`;
      params.push(data[field]);
    });
    
    if (data.logo_path) {
      sql += ", logo_path = ?";
      params.push(data.logo_path);
    }
    if (data.stamp_path) {
      sql += ", stamp_path = ?";
      params.push(data.stamp_path);
    }
    if (data.digital_seal_path) {
      sql += ", digital_seal_path = ?";
      params.push(data.digital_seal_path);
    }
    if (data.transport_license_image) {
      sql += ", transport_license_image = ?";
      params.push(data.transport_license_image);
    }
    
    sql += " WHERE id = ?";
    params.push(companyId);
    
    await query(sql, params);
    revalidatePath("/user_profile");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addBankAccount(companyId: number, data: any) {
  try {
    await query(
      "INSERT INTO company_bank_accounts (company_id, bank_beneficiary, bank_name, bank_account, bank_iban) VALUES (?, ?, ?, ?, ?)",
      [companyId, data.bank_beneficiary, data.bank_name, data.bank_account, data.bank_iban]
    );
    revalidatePath("/user_profile");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateBankAccount(id: number, companyId: number, data: any) {
  try {
    await query(
      "UPDATE company_bank_accounts SET bank_beneficiary = ?, bank_name = ?, bank_account = ?, bank_iban = ? WHERE id = ? AND company_id = ?",
      [data.bank_beneficiary, data.bank_name, data.bank_account, data.bank_iban, id, companyId]
    );
    revalidatePath("/user_profile");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteBankAccount(id: number, companyId: number) {
  try {
    await query("DELETE FROM company_bank_accounts WHERE id = ? AND company_id = ?", [id, companyId]);
    revalidatePath("/user_profile");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

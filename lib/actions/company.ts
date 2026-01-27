"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateCompanyProfile(companyId: number, data: any) {
  try {
    const allowedFields = [
      "transport_license_number",
      "transport_license_type",
      "license_start",
      "license_end",
      "logo_path",
      "stamp_path",
      "digital_seal_path",
      "transport_license_image",
      "commercial_register_image",
      "commercial_register_issue_date",
      "commercial_register_expiry_date",
      "vat_certificate_image",
      "bank_account_image"
    ];
    
    const updates: string[] = [];
    const params: any[] = [];
    
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);
        params.push(data[field] || null);
      }
    }
    
    if (updates.length === 0) {
      return { success: false, error: "No data to update" };
    }
    
    params.push(companyId);
    await query(`UPDATE companies SET ${updates.join(", ")} WHERE id = ?`, params);
    
    revalidatePath("/user_profile");
    return { success: true };
  } catch (error: any) {
    console.error("Update company error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateCompanyFile(companyId: number, field: string, filePath: string) {
  try {
    const allowedFields = [
      "logo_path",
      "stamp_path",
      "digital_seal_path",
      "transport_license_image",
      "commercial_register_image",
      "vat_certificate_image",
      "bank_account_image"
    ];
    
    if (!allowedFields.includes(field)) {
      return { success: false, error: "Invalid field" };
    }
    
    await query(`UPDATE companies SET ${field} = ? WHERE id = ?`, [filePath, companyId]);
    revalidatePath("/user_profile");
    return { success: true };
  } catch (error: any) {
    console.error("Update file error:", error);
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

export async function addLicense(companyId: number, data: any) {
  try {
    await query(
      "INSERT INTO company_licenses (company_id, license_number, license_type, start_date, end_date, license_image) VALUES (?, ?, ?, ?, ?, ?)",
      [companyId, data.license_number, data.license_type, data.start_date || null, data.end_date || null, data.license_image || null]
    );
    revalidatePath("/user_profile");
    return { success: true };
  } catch (error: any) {
    console.error("Add license error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateLicense(id: number, companyId: number, data: any) {
  try {
    await query(
      "UPDATE company_licenses SET license_number = ?, license_type = ?, start_date = ?, end_date = ?, license_image = ?, updated_at = NOW() WHERE id = ? AND company_id = ?",
      [data.license_number, data.license_type, data.start_date || null, data.end_date || null, data.license_image || null, id, companyId]
    );
    revalidatePath("/user_profile");
    return { success: true };
  } catch (error: any) {
    console.error("Update license error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteLicense(id: number, companyId: number) {
  try {
    await query("DELETE FROM company_licenses WHERE id = ? AND company_id = ?", [id, companyId]);
    revalidatePath("/user_profile");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

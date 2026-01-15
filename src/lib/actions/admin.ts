"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function approveCompany(id: number) {
  try {
    await query("UPDATE companies SET status = 'approved', is_active = 1 WHERE id = ?", [id]);
    revalidatePath("/admin/companies");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function rejectCompany(id: number) {
  try {
    await query("UPDATE companies SET status = 'rejected', is_active = 0 WHERE id = ?", [id]);
    revalidatePath("/admin/companies");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleCompanyStatus(id: number, currentStatus: number) {
  try {
    const newStatus = currentStatus === 1 ? 0 : 1;
    await query("UPDATE companies SET is_active = ? WHERE id = ?", [newStatus, id]);
    revalidatePath("/admin/companies");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function generateToken(id: number, duration: number) {
  try {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    let expiry = null;
    if (duration > 0) {
      const date = new Date();
      date.setDate(date.getDate() + duration);
      expiry = date.toISOString().split('T')[0];
    }
    
    await query("UPDATE companies SET access_token = ?, token_expiry = ? WHERE id = ?", [token, expiry, id]);
    revalidatePath("/admin/companies");
    return { success: true, token };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function sendAdminNotification(data: {
  title: string;
  message: string;
  sent_to_all: boolean;
  image_path?: string;
}) {
  try {
    await query(
      "INSERT INTO admin_notifications (title, message, sent_to_all, image_path) VALUES (?, ?, ?, ?)",
      [data.title, data.message, data.sent_to_all ? 1 : 0, data.image_path || null]
    );
    revalidatePath("/admin/notifications");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCompany(id: number, data: Record<string, any>) {
  try {
    const fields = Object.keys(data);
    const values = Object.values(data);
    
    if (fields.length === 0) {
      return { success: false, error: "No fields to update" };
    }
    
    const setClause = fields.map(field => `${field} = ?`).join(", ");
    await query(`UPDATE companies SET ${setClause} WHERE id = ?`, [...values, id]);
    
    revalidatePath("/admin/companies");
    revalidatePath(`/admin/companies/${id}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

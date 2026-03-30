"use server";

import { revalidatePath } from "next/cache";
import { query, execute } from "@/lib/db";

export async function addVehicleCategory(data: { company_id: number; name: string; description?: string }) {
  try {
    await query(
      "INSERT INTO vehicle_categories (company_id, name, description) VALUES (?, ?, ?)",
      [data.company_id, data.name, data.description]
    );
    revalidatePath("/fleet");
    return { success: true };
  } catch (error: any) {
    console.error("Error adding vehicle category:", error);
    return { success: false, error: error.message };
  }
}

export async function addVehicle(data: any) {
  // Remove empty/null/undefined values and ensure numeric fields are correctly formatted
  const processedData: Record<string, any> = {};
  for (const [key, val] of Object.entries(data)) {
    if (val === null || val === undefined || val === '') continue;
    processedData[key] = val;
  }
  if (processedData.category_id) processedData.category_id = parseInt(processedData.category_id);
  if (processedData.driver_id) processedData.driver_id = parseInt(processedData.driver_id);
  if (processedData.manufacture_year) processedData.manufacture_year = parseInt(processedData.manufacture_year);
  if (processedData.current_km) processedData.current_km = parseInt(processedData.current_km);
  if (processedData.last_oil_change_km) processedData.last_oil_change_km = parseInt(processedData.last_oil_change_km);
  if (processedData.oil_valid_km) processedData.oil_valid_km = parseInt(processedData.oil_valid_km);

  // Remove any NaN values
  for (const [key, val] of Object.entries(processedData)) {
    if (typeof val === 'number' && isNaN(val)) delete processedData[key];
  }

  const fields = Object.keys(processedData);
  const placeholders = fields.map(() => "?").join(", ");
  const values = Object.values(processedData);

  try {
    await query(
      `INSERT INTO vehicles (${fields.join(", ")}) VALUES (${placeholders})`,
      values
    );
    revalidatePath("/fleet");
    return { success: true };
  } catch (error: any) {
    console.error("Error adding vehicle:", error);
    return { success: false, error: error.message };
  }
}

export async function updateVehicle(id: number, data: any) {
  const fields = Object.keys(data);
  const setClause = fields.map((field) => `${field} = ?`).join(", ");
  const values = [...Object.values(data), id];

  try {
    await query(
      `UPDATE vehicles SET ${setClause} WHERE id = ?`,
      values
    );
    revalidatePath("/fleet");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating vehicle:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteVehicle(id: number) {
  try {
    // First delete associated records if any (accidents, violations, etc.)
    await query("DELETE FROM vehicle_accidents WHERE vehicle_id = ?", [id]);
    await query("DELETE FROM vehicle_violations WHERE vehicle_id = ?", [id]);
    await query("DELETE FROM maintenance_requests WHERE vehicle_id = ?", [id]);
    await query("DELETE FROM vehicles WHERE id = ?", [id]);
    revalidatePath("/fleet");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting vehicle:", error);
    return { success: false, error: error.message };
  }
}

export async function addSpareCategory(data: { company_id: number; name: string; description?: string }) {
  try {
    await query(
      "INSERT INTO spares_categories (company_id, name, description) VALUES (?, ?, ?)",
      [data.company_id, data.name, data.description]
    );
    revalidatePath("/fleet");
    return { success: true };
  } catch (error: any) {
    console.error("Error adding spare category:", error);
    return { success: false, error: error.message };
  }
}

export async function addSpare(data: any) {
  const fields = Object.keys(data);
  const placeholders = fields.map(() => "?").join(", ");
  const values = Object.values(data);

  try {
    await query(
      `INSERT INTO spares (${fields.join(", ")}) VALUES (${placeholders})`,
      values
    );
    revalidatePath("/fleet");
    return { success: true };
  } catch (error: any) {
    console.error("Error adding spare:", error);
    return { success: false, error: error.message };
  }
}

export async function createMaintenanceRequest(data: any, spares: any[]) {
  try {
    const res = await execute(
      `INSERT INTO maintenance_requests 
       (company_id, vehicle_id, maintenance_person, maintenance_date, current_km, notes, status, total_cost) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.company_id,
        data.vehicle_id,
        data.maintenance_person,
        data.maintenance_date,
        data.current_km,
        data.notes,
        'pending',
        data.total_cost
      ]
    );

    const maintenanceId = res.insertId;

    for (const spare of spares) {
      await query(
        `INSERT INTO maintenance_details (maintenance_id, spare_id, quantity_used, unit_price, total_price) 
         VALUES (?, ?, ?, ?, ?)`,
        [maintenanceId, spare.id, spare.quantity, spare.unit_price, spare.quantity * spare.unit_price]
      );

      // Update spare quantity
      await query(
        "UPDATE spares SET quantity = quantity - ? WHERE id = ?",
        [spare.quantity, spare.id]
      );
    }

    // Update vehicle km and maintenance count
    await query(
      "UPDATE vehicles SET current_km = ?, maintenance_count = COALESCE(maintenance_count, 0) + 1, last_maintenance_date = ? WHERE id = ?",
      [data.current_km, data.maintenance_date, data.vehicle_id]
    );

    revalidatePath("/fleet");
    return { success: true, maintenanceId: maintenanceId };
  } catch (error: any) {
    console.error("Error creating maintenance request:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteMaintenanceRequest(id: number) {
  try {
    // 1. Get the maintenance details to restore spare quantities if needed? 
    // Usually deletion should reverse the stock if it's a mistake.
    const details = await query("SELECT spare_id, quantity_used FROM maintenance_details WHERE maintenance_id = ?", [id]);
    
    // Restore quantities
    for (const item of details as any[]) {
      await query("UPDATE spares SET quantity = quantity + ? WHERE id = ?", [item.quantity_used, item.spare_id]);
    }

    // 2. Delete details
    await query("DELETE FROM maintenance_details WHERE maintenance_id = ?", [id]);
    
    // 3. Delete request
    await query("DELETE FROM maintenance_requests WHERE id = ?", [id]);
    
    revalidatePath("/fleet");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting maintenance request:", error);
    return { success: false, error: error.message };
  }
}

export async function getMaintenanceDetails(id: number) {
  try {
    const details = await query(
      `SELECT md.*, s.name as spare_name, s.code as spare_code 
       FROM maintenance_details md 
       JOIN spares s ON md.spare_id = s.id 
       WHERE md.maintenance_id = ?`,
      [id]
    );
    return { success: true, details };
  } catch (error: any) {
    console.error("Error fetching maintenance details:", error);
    return { success: false, error: error.message };
  }
}

export async function completeMaintenanceRequest(id: number) {
  try {
    await query(
      "UPDATE maintenance_requests SET status = 'completed' WHERE id = ?",
      [id]
    );
    revalidatePath("/fleet");
    return { success: true };
  } catch (error: any) {
    console.error("Error completing maintenance request:", error);
    return { success: false, error: error.message };
  }
}

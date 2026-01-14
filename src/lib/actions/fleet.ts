"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";

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
  // Ensure numeric fields are correctly formatted
  const processedData = { ...data };
  if (processedData.category_id) processedData.category_id = parseInt(processedData.category_id);
  if (processedData.driver_id) processedData.driver_id = parseInt(processedData.driver_id);
  if (processedData.manufacture_year) processedData.manufacture_year = parseInt(processedData.manufacture_year);
  if (processedData.current_km) processedData.current_km = parseInt(processedData.current_km);
  if (processedData.last_oil_change_km) processedData.last_oil_change_km = parseInt(processedData.last_oil_change_km);
  if (processedData.oil_valid_km) processedData.oil_valid_km = parseInt(processedData.oil_valid_km);

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
      "UPDATE vehicles SET current_km = ?, maintenance_count = maintenance_count + 1, last_maintenance_date = ? WHERE id = ?",
      [data.current_km, data.maintenance_date, data.vehicle_id]
    );

    revalidatePath("/fleet");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating maintenance request:", error);
    return { success: false, error: error.message };
  }
}

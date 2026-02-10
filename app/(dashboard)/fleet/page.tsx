import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { FleetClient } from "./fleet-client";

export default async function FleetPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");

  if (!sessionCookie) {
    redirect("/login");
  }

  const session = JSON.parse(sessionCookie.value);
  const companyId = session.company_id;
  const userId = session.id;

  if (!companyId) {
    redirect("/dashboard");
  }

  // Fetch initial data for the fleet dashboard
  const vehicles = await query<any>(
    `SELECT v.*, e.name as driver_name 
     FROM vehicles v 
     LEFT JOIN employees e ON v.driver_id = e.id 
     WHERE v.company_id = ? 
     ORDER BY v.created_at DESC`,
    [companyId]
  );

  const spares = await query<any>(
    `SELECT s.*, c.name as category_name 
     FROM spares s 
     LEFT JOIN spares_categories c ON s.category_id = c.id 
     WHERE s.company_id = ? 
     ORDER BY s.created_at DESC`,
    [companyId]
  );

  const categories = await query<any>(
    "SELECT * FROM spares_categories WHERE company_id = ? ORDER BY name",
    [companyId]
  );

  const maintenanceRequests = await query<any>(
    `SELECT mr.*, v.plate_number_ar, v.brand, v.model 
     FROM maintenance_requests mr 
     JOIN vehicles v ON mr.vehicle_id = v.id 
     WHERE mr.company_id = ? 
     ORDER BY mr.created_at DESC LIMIT 20`,
    [companyId]
  );

  const employees = await query<any>(
    `SELECT e.id, e.name, e.iqama_number, e.personal_photo, e.user_code, e.identity_number, e.job_title, e.package_id, 
     ep.group_name as package_name
     FROM employees e 
     LEFT JOIN employee_packages ep ON e.package_id = ep.id
     WHERE e.company_id = ? AND e.is_active = 1
     ORDER BY ep.group_name, e.name`,
    [companyId]
  );

    const vehicleCategories = await query<any>(
      "SELECT * FROM vehicle_categories WHERE company_id = ? ORDER BY name",
      [companyId]
    );

    const company = await query<any>(
      "SELECT name FROM companies WHERE id = ?",
      [companyId]
    );

    const user = await query<any>(
      "SELECT email FROM users WHERE id = ?",
      [userId || null]
    );

    return (
      <FleetClient 
        initialVehicles={vehicles}
        initialSpares={spares}
        categories={categories}
        vehicleCategories={vehicleCategories}
        initialMaintenance={maintenanceRequests}
        employees={employees}
        companyId={companyId}
        companyName={company[0]?.name || ""}
        companyEmail={user[0]?.email || ""}
      />
    );

}

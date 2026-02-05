import React from "react";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { DigitalIdClient } from "./digital-id-client";
import { notFound } from "next/navigation";

export default async function DigitalIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const employeeId = parseInt(id);

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  const session = JSON.parse(sessionCookie?.value || "{}");
  
  const companyId = session.company_id;

  // 1. Fetch Employee Data
  const employeeRes = await query(
    `SELECT e.*, ep.group_name, c.name as company_name, c.logo as company_logo
     FROM employees e 
     LEFT JOIN employee_packages ep ON e.package_id = ep.id 
     LEFT JOIN companies c ON e.company_id = c.id
     WHERE e.id = ? AND e.company_id = ?`,
    [employeeId, companyId]
  );

  const employee = employeeRes[0];
  if (!employee) {
    notFound();
  }

  // 2. Fetch all employees in same package for navigation
  const allEmployees = await query(
    `SELECT id, name, user_code, iqama_number
     FROM employees 
     WHERE package_id = ? AND company_id = ? AND is_active = 1
     ORDER BY user_code ASC`,
    [employee.package_id, companyId]
  );

  return (
    <DigitalIdClient 
      employee={employee}
      allEmployees={allEmployees}
    />
  );
}

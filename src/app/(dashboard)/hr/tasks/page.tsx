import React from "react";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { TasksClient } from "./tasks-client";

export default async function TasksPage({ searchParams }: { 
  searchParams: Promise<{ filter?: string, search?: string }>
}) {
  const params = await searchParams;
  const filter = params.filter || "all";
  const search = params.search || "";

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  const session = JSON.parse(sessionCookie?.value || "{}");
  
    const companyId = session.company_id;
    const userId = session.user_id;

  // 1. Fetch Stats
  const totalTasksRes = await query("SELECT COUNT(*) as count FROM employee_tasks WHERE company_id = ?", [companyId]);
  const pendingTasksRes = await query("SELECT COUNT(*) as count FROM employee_tasks WHERE company_id = ? AND status = 'pending'", [companyId]);
  const progressTasksRes = await query("SELECT COUNT(*) as count FROM employee_tasks WHERE company_id = ? AND status = 'in_progress'", [companyId]);
  const completedTasksRes = await query("SELECT COUNT(*) as count FROM employee_tasks WHERE company_id = ? AND status = 'completed'", [companyId]);
  const overdueTasksRes = await query("SELECT COUNT(*) as count FROM employee_tasks WHERE company_id = ? AND due_date < CURRENT_DATE AND status IN ('pending', 'in_progress')", [companyId]);

  const stats = {
    total: Number(totalTasksRes[0].count),
    pending: Number(pendingTasksRes[0].count),
    inProgress: Number(progressTasksRes[0].count),
    completed: Number(completedTasksRes[0].count),
    overdue: Number(overdueTasksRes[0].count)
  };

  // 2. Fetch Tasks with filter
  let condition = "et.company_id = ?";
  let sqlParams: any[] = [companyId];

  if (filter === 'pending') condition += " AND et.status = 'pending'";
  else if (filter === 'in_progress') condition += " AND et.status = 'in_progress'";
  else if (filter === 'completed') condition += " AND et.status = 'completed'";
  else if (filter === 'overdue') condition += " AND et.due_date < CURRENT_DATE AND et.status IN ('pending', 'in_progress')";

  if (search) {
    condition += " AND (et.title LIKE ? OR et.description LIKE ? OR e.name LIKE ?)";
    sqlParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const tasks = await query(
    `SELECT et.*, e.name as employee_name, e.iqama_number, u.name as created_by_name
     FROM employee_tasks et
     LEFT JOIN employees e ON et.assigned_to = e.id
     LEFT JOIN users u ON et.created_by = u.id
     WHERE ${condition}
     ORDER BY et.due_date ASC, et.priority DESC`,
    sqlParams
  );

  // 3. Fetch Employees for assignment
  const employees = await query(
    "SELECT id, name, user_code, iqama_number, email, job_title, personal_photo FROM employees WHERE company_id = ? AND is_active = 1",
    [companyId]
  );

  return (
    <TasksClient 
      initialTasks={tasks}
      stats={stats}
      employees={employees}
      companyId={companyId}
      userId={userId}
      activeFilter={filter}
      searchQuery={search}
    />
  );
}

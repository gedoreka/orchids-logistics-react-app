import { cookies } from "next/headers";
import { cachedQuery } from "@/lib/db";
import { NewBatchClient } from "./new-batch-client";

async function getEmployees(companyId: number) {
  try {
    const employees = await cachedQuery<any>(
      `SELECT e.id, e.name, e.identity_number, e.basic_salary, e.housing_allowance, e.other_allowances,
              eb.iban, eb.bank_name, eb.bank_code
       FROM employees e
       LEFT JOIN employee_bank_accounts eb ON e.id = eb.employee_id
       WHERE e.company_id = ? AND e.status = 'active'
       ORDER BY e.name`,
      [companyId]
    );
    return employees;
  } catch (error) {
    console.error("Error fetching employees:", error);
    return [];
  }
}

async function getAnbCredentials(companyId: number) {
  try {
    const rows = await cachedQuery<any>(
      `SELECT debit_account, mol_establishment_id, national_unified_no FROM anb_credentials WHERE company_id = ? AND is_active = 1`,
      [companyId]
    );
    return rows[0] || null;
  } catch {
    return null;
  }
}

export default async function NewBatchPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  const session = JSON.parse(sessionCookie?.value || "{}");
  const companyId = session.company_id;

  if (!companyId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">جاري التحميل...</p>
      </div>
    );
  }

  const [employees, credentials] = await Promise.all([
    getEmployees(companyId),
    getAnbCredentials(companyId),
  ]);

  return <NewBatchClient employees={employees} companyId={companyId} credentials={credentials} />;
}

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cachedQuery, query } from "@/lib/db";
import { NewInvoiceClient } from "./new-invoice-client";

type CompanyRow = { company_id: number | null };
type CountRow = { total: number | string };
type LastNumberRow = { last_number: number | string };

async function getCompanyId(userId: number) {
  const users = await cachedQuery<CompanyRow>("SELECT company_id FROM users WHERE id = ?", [userId]);
  return users[0]?.company_id;
}

async function getCustomers(companyId: number) {
  return await cachedQuery(
    "SELECT * FROM customers WHERE company_id = ? ORDER BY customer_name ASC",
    [companyId]
  );
}

async function getBankAccountsCount(companyId: number) {
  const rows = await cachedQuery<CountRow>(
    "SELECT COUNT(*) AS total FROM company_bank_accounts WHERE company_id = ?",
    [companyId]
  );
  return Number(rows[0]?.total || 0);
}

async function getNextInvoiceNumber(companyId: number) {
  const result = await query<LastNumberRow>(`
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number, 4) AS UNSIGNED)), 0) AS last_number
    FROM sales_invoices
    WHERE company_id = ?
      AND invoice_number REGEXP '^INV[0-9]+$'
  `, [companyId]);

  const lastNumber = Number(result[0]?.last_number || 0);
  return `INV${lastNumber + 1}`;
}

export default async function NewInvoicePage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  
  if (!sessionCookie) {
    redirect("/login");
  }
  
  const session = JSON.parse(sessionCookie.value);
  let companyId = session.company_id;
  const userName = session.user_name || session.name || 'مستخدم';
  
  if (!companyId && session.user_id) {
    companyId = await getCompanyId(session.user_id);
  }

  if (!companyId) {
    redirect("/login");
  }

  const [customers, invoiceNumber, bankAccountsCount] = await Promise.all([
    getCustomers(companyId),
    getNextInvoiceNumber(companyId),
    getBankAccountsCount(companyId)
  ]);

  return (
    <NewInvoiceClient 
      customers={customers} 
      invoiceNumber={invoiceNumber}
      companyId={companyId}
      userName={userName}
      hasBankAccounts={bankAccountsCount > 0}
    />
  );
}

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { NewInvoiceClient } from "./new-invoice-client";

async function getCompanyId(userId: number) {
  const users = await query<any>("SELECT company_id FROM users WHERE id = $1", [userId]);
  return users[0]?.company_id;
}

async function getCustomers(companyId: number) {
  return await query<any>(
    "SELECT * FROM customers WHERE company_id = $1 ORDER BY name ASC",
    [companyId]
  );
}

async function getNextInvoiceNumber(companyId: number) {
  const result = await query<any>(`
    SELECT invoice_number FROM sales_invoices 
    WHERE company_id = $1 AND invoice_number LIKE 'INV%'
    ORDER BY id DESC LIMIT 1
  `, [companyId]);
  
  if (result.length > 0 && result[0].invoice_number) {
    const lastNum = parseInt(result[0].invoice_number.replace('INV', '')) || 0;
    return 'INV' + (lastNum + 1);
  }
  return 'INV1';
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

  const [customers, invoiceNumber] = await Promise.all([
    getCustomers(companyId),
    getNextInvoiceNumber(companyId)
  ]);

  return (
    <NewInvoiceClient 
      customers={customers} 
      invoiceNumber={invoiceNumber}
      companyId={companyId}
      userName={userName}
    />
  );
}

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { NewQuotationClient } from "./new-quotation-client";

interface Customer {
  id: number;
  customer_name: string;
  company_name: string;
  vat_number: string;
}

async function getCustomers(companyId: number) {
  try {
    const customers = await query<Customer>(
      `SELECT id, customer_name, company_name, vat_number FROM customers WHERE company_id = ? ORDER BY id DESC`,
      [companyId]
    );
    return customers;
  } catch (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
}

async function getNextQuotationNumber() {
  try {
    const currentYear = new Date().getFullYear();
    const result = await query<any>(
      `SELECT MAX(CAST(SUBSTRING(quotation_number, 10) AS UNSIGNED)) as last_number 
       FROM quotations 
       WHERE quotation_number LIKE ?`,
      [`QTN-${currentYear}-%`]
    );
    const lastNumber = result[0]?.last_number || 0;
    return `QTN-${currentYear}-${String(lastNumber + 1).padStart(4, '0')}`;
  } catch (error) {
    const currentYear = new Date().getFullYear();
    return `QTN-${currentYear}-0001`;
  }
}

export default async function NewQuotationPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (!sessionCookie?.value) {
    redirect("/login");
  }

  let session;
  try {
    session = JSON.parse(sessionCookie.value);
  } catch {
    redirect("/login");
  }

  const companyId = session.company_id || 1;
  const [customers, nextQuotationNumber] = await Promise.all([
    getCustomers(companyId),
    getNextQuotationNumber()
  ]);

  return (
    <NewQuotationClient 
      customers={customers} 
      companyId={companyId}
      nextQuotationNumber={nextQuotationNumber}
    />
  );
}

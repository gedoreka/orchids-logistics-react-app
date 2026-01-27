import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { QuotationsClient } from "./quotations-client";

interface Quotation {
  id: number;
  quotation_number: string;
  client_id: number;
  client_name: string;
  client_vat: string;
  issue_date: string;
  due_date: string;
  expiry_date: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface Customer {
  id: number;
  customer_name: string;
  company_name: string;
  vat_number: string;
}

async function getQuotations(companyId: number) {
  try {
    const quotations = await query<Quotation>(
      `SELECT q.*, 
              COALESCE(q.client_name, c.customer_name, c.company_name) as client_name,
              COALESCE(q.client_vat, c.vat_number) as client_vat
       FROM quotations q
       LEFT JOIN customers c ON q.client_id = c.id
       WHERE q.company_id = ? 
       ORDER BY q.id DESC`,
      [companyId]
    );
    return quotations;
  } catch (error) {
    console.error("Error fetching quotations:", error);
    return [];
  }
}

async function getStats(companyId: number) {
  try {
    const stats = await query<any>(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
        SUM(CASE WHEN expiry_date < CURDATE() AND status != 'confirmed' THEN 1 ELSE 0 END) as expired
       FROM quotations WHERE company_id = ?`,
      [companyId]
    );
    return stats[0] || { total: 0, confirmed: 0, draft: 0, expired: 0 };
  } catch (error) {
    return { total: 0, confirmed: 0, draft: 0, expired: 0 };
  }
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

export default async function QuotationsPage() {
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

  const [quotations, stats, customers, nextQuotationNumber] = await Promise.all([
    getQuotations(companyId),
    getStats(companyId),
    getCustomers(companyId),
    getNextQuotationNumber()
  ]);

  return (
    <QuotationsClient 
      quotations={quotations} 
      stats={stats} 
      companyId={companyId} 
      customers={customers}
      nextQuotationNumber={nextQuotationNumber}
    />
  );
}

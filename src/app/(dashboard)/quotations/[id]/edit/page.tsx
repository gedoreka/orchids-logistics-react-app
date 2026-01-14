import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { query } from "@/lib/db";
import { EditQuotationClient } from "./edit-quotation-client";

interface Customer {
  id: number;
  customer_name: string;
  company_name: string;
  vat_number: string;
}

interface QuotationItem {
  id: number;
  product_name: string;
  description: string;
  quantity: number;
  price: number;
  vat_rate: number;
  vat_amount: number;
  total: number;
}

async function getQuotation(id: string, companyId: number) {
  try {
    const quotations = await query<any>(
      `SELECT * FROM quotations WHERE id = ? AND company_id = ?`,
      [id, companyId]
    );

    if (quotations.length === 0) return null;

    const items = await query<QuotationItem>(
      `SELECT * FROM quotation_items WHERE quotation_id = ?`,
      [id]
    );

    return { ...quotations[0], items };
  } catch (error) {
    console.error("Error fetching quotation:", error);
    return null;
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

export default async function EditQuotationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  const [quotation, customers] = await Promise.all([
    getQuotation(id, companyId),
    getCustomers(companyId)
  ]);

  if (!quotation) {
    notFound();
  }

  return <EditQuotationClient quotation={quotation} customers={customers} companyId={companyId} />;
}

import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { query } from "@/lib/db";
import { QuotationViewClient } from "./quotation-view-client";

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

async function getQuotation(id: string) {
  try {
    const quotations = await query<any>(
      `SELECT q.*, c.customer_name, c.company_name as client_company, c.vat_number as client_vat_full,
              c.short_address, c.email as client_email, c.phone as client_phone
       FROM quotations q
       LEFT JOIN customers c ON q.client_id = c.id
       WHERE q.id = ?`,
      [id]
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

async function getCompany(companyId: number) {
  try {
    const companies = await query<any>(
      `SELECT * FROM companies WHERE id = ?`,
      [companyId]
    );
    return companies[0] || { name: 'اسم الشركة', vat_number: 'غير محدد', short_address: 'غير محدد' };
  } catch (error) {
    return { name: 'اسم الشركة', vat_number: 'غير محدد', short_address: 'غير محدد' };
  }
}

export default async function QuotationViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const quotation = await getQuotation(id);

  if (!quotation) {
    notFound();
  }

  const company = await getCompany(quotation.company_id);

  return <QuotationViewClient quotation={quotation} company={company} companyId={quotation.company_id} />;
}

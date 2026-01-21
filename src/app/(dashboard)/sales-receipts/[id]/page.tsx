import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { query } from "@/lib/db";
import { SalesReceiptViewClient } from "./sales-receipt-view-client";

async function getSalesReceipt(id: string) {
  try {
    const receipts = await query<any>(
      `SELECT sr.*, 
              CASE WHEN sr.use_custom_client = 1 THEN sr.client_name ELSE c.customer_name END as client_name,
              CASE WHEN sr.use_custom_client = 1 THEN sr.client_vat ELSE c.vat_number END as client_vat,
              CASE WHEN sr.use_custom_client = 1 THEN sr.client_address ELSE c.short_address END as client_address,
              CASE WHEN sr.use_custom_client = 1 THEN sr.client_commercial_number ELSE c.commercial_number END as client_commercial_number,
              c.phone as client_phone, c.email as client_email
       FROM sales_receipts sr
       LEFT JOIN customers c ON sr.client_id = c.id
       WHERE sr.id = ?`,
      [id]
    );

    if (receipts.length === 0) return null;

    const receipt = receipts[0];

    // Fetch items
    const items = await query<any>(
      `SELECT * FROM sales_receipt_items WHERE receipt_id = ? ORDER BY id ASC`,
      [id]
    );

    receipt.items = items;

    return receipt;
  } catch (error) {
    console.error("Error fetching sales receipt:", error);
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

export default async function SalesReceiptViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const receipt = await getSalesReceipt(id);

  if (!receipt) {
    notFound();
  }

  const company = await getCompany(receipt.company_id);

  return <SalesReceiptViewClient receipt={receipt} company={company} companyId={receipt.company_id} />;
}

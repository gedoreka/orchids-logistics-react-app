import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { query } from "@/lib/db";
import { InvoiceViewClient } from "./invoice-view-client";

async function getInvoiceData(id: string) {
  const invoices = await query<any>(
    "SELECT * FROM sales_invoices WHERE id = ?",
    [id]
  );

  if (invoices.length === 0) return null;

  const invoice = invoices[0];
  const companyId = invoice.company_id;

  const items = await query<any>(
    "SELECT * FROM invoice_items WHERE invoice_id = ?",
    [id]
  );

  const adjustments = await query<any>(
    "SELECT * FROM invoice_adjustments WHERE invoice_id = ?",
    [id]
  );

  const companies = await query<any>(
    "SELECT * FROM companies WHERE id = ?",
    [companyId]
  );

  const bankAccounts = await query<any>(
    "SELECT * FROM company_bank_accounts WHERE company_id = ? ORDER BY id DESC",
    [companyId]
  );

  let customer = null;
  if (invoice.client_id) {
    const customers = await query<any>(
      "SELECT * FROM customers WHERE id = ?",
      [invoice.client_id]
    );
    customer = customers[0];
  }

  // Fetch representative (created_by user) info for photo
  let createdByUser = null;
  if (invoice.created_by) {
    const users = await query<any>(
      "SELECT id, name, company_logo FROM users WHERE id = ?",
      [invoice.created_by]
    );
    createdByUser = users[0] || null;
  }

  return {
    invoice,
    items,
    adjustments,
    company: companies[0],
    bankAccounts,
    customer,
    createdByUser
  };
}

export default async function InvoiceViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const data = await getInvoiceData(id);

  if (!data) {
    notFound();
  }

  const serializedData = JSON.parse(JSON.stringify(data, (key, value) => {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  }));

  return <InvoiceViewClient {...serializedData} />;
}

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { CustomersClient } from "./customers-client";

interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  vat_number?: string;
  commercial_number?: string;
  contact_person?: string;
  notes?: string;
  created_at?: string;
}

export default async function CustomersPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");

  if (!sessionCookie) {
    redirect("/login");
  }

  const session = JSON.parse(sessionCookie.value);
  const companyId = session.company_id;

  if (!companyId) {
    redirect("/dashboard");
  }

  let customers: Customer[] = [];

  try {
    customers = await query<Customer>(
      "SELECT * FROM customers WHERE company_id = ? ORDER BY name ASC",
      [companyId]
    );
  } catch (error) {
    console.error("Error fetching customers:", error);
  }

  return <CustomersClient customers={customers} companyId={companyId} />;
}

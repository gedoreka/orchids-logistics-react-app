import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { IncomeStatementClient } from "./income-statement-client";
import { query } from "@/lib/db";

export const metadata = {
  title: "قائمة الدخل - Logistics Systems Pro",
};

export default async function IncomeStatementPage() {
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

  const companies = await query<any>(
    "SELECT name, logo_path FROM companies WHERE id = ?",
    [companyId]
  );
  const companyInfo = companies[0] || { name: "اسم الشركة", logo_path: null };

  return (
    <IncomeStatementClient 
      companyId={companyId}
      companyInfo={companyInfo}
    />
  );
}

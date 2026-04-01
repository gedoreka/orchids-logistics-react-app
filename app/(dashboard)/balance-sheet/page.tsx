import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BalanceSheetClient } from "./balance-sheet-client";
import { cachedQuery } from "@/lib/db";

export const metadata = {
  title: "الميزانية العمومية - Logistics Hub",
};

export default async function BalanceSheetPage() {
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

  const companies = await cachedQuery<any>(
    "SELECT name, logo_path FROM companies WHERE id = ?",
    [companyId]
  );
  const companyInfo = companies[0] || { name: "اسم الشركة", logo_path: null };

  return (
    <BalanceSheetClient 
      companyId={companyId}
      companyInfo={companyInfo}
    />
  );
}

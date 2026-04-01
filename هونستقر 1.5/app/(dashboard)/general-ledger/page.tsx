import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { GeneralLedgerClient } from "./general-ledger-client";
import { cachedQuery } from "@/lib/db";

export const metadata = {
  title: "دفتر الأستاذ العام - Logistics Hub",
};

export default async function GeneralLedgerPage() {
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
    <GeneralLedgerClient 
      companyId={companyId}
      companyInfo={companyInfo}
    />
  );
}

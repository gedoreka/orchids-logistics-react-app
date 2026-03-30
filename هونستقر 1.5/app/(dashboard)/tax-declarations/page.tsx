import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TaxDeclarationsClient } from "./tax-declarations-client";

export const metadata = {
  title: "الإقرارات الضريبية - Logistics Systems Pro",
};

export default async function TaxDeclarationsPage() {
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

  return <TaxDeclarationsClient companyId={companyId} />;
}

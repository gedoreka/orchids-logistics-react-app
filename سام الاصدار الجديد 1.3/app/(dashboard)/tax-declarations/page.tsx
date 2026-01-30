import React from "react";
import { cookies } from "next/headers";
import { TaxDeclarationsClient } from "./tax-declarations-client";

export default async function TaxDeclarationsPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  const session = JSON.parse(sessionCookie?.value || "{}");
  const companyId = session.company_id;

  return (
    <TaxDeclarationsClient companyId={companyId} />
  );
}

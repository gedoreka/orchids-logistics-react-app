import React from "react";
import { cookies } from "next/headers";
import { TaxMatchingClient } from "./matching-client";

export default async function TaxMatchingPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  const session = JSON.parse(sessionCookie?.value || "{}");
  const companyId = session.company_id;

  return (
    <TaxMatchingClient companyId={companyId} />
  );
}

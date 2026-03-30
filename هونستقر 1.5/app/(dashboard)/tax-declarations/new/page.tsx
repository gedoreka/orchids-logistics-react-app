import React from "react";
import { cookies } from "next/headers";
import { NewTaxDeclarationClient } from "./new-declaration-client";

export default async function NewTaxDeclarationPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  const session = JSON.parse(sessionCookie?.value || "{}");
  const companyId = session.company_id;

  return (
    <NewTaxDeclarationClient companyId={companyId} />
  );
}

import React from "react";
import { cookies } from "next/headers";
import { TaxSettingsClient } from "./tax-settings-client";

export default async function TaxSettingsPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  const session = JSON.parse(sessionCookie?.value || "{}");
  const companyId = session.company_id;

  return (
    <TaxSettingsClient companyId={companyId} />
  );
}

import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { StoresManagementClient } from "./stores-management-client";

export const metadata = {
  title: "إدارة المتاجر - Logistics Systems Pro",
};

export default async function StoresManagementPage() {
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

  return <StoresManagementClient companyId={companyId} />;
}

import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { IndividualShipmentsClient } from "./individual-shipments-client";

export const metadata = {
  title: "شحنات الأفراد - Logistics Systems Pro",
};

export default async function IndividualShipmentsPage() {
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

  return <IndividualShipmentsClient companyId={companyId} />;
}

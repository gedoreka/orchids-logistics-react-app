import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DailyOrdersClient } from "./daily-orders-client";

export const metadata = {
  title: "عرض الطلبات اليومية - Logistics Systems Pro",
};

export default async function DailyOrdersPage() {
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

  return <DailyOrdersClient companyId={companyId} />;
}

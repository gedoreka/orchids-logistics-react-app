import React, { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CreateShipmentClient } from "./create-shipment-client";

export const metadata = {
  title: "إنشاء شحنة جديدة - Logistics Systems Pro",
};

export default async function CreateShipmentPage() {
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

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>}>
      <CreateShipmentClient companyId={companyId} />
    </Suspense>
  );
}

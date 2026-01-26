import { cookies } from "next/headers";
import { PaymentVouchersClient } from "./payment-vouchers-client";

export const metadata = {
  title: "سندات الصرف - Logistics Systems Pro",
};

export default async function PaymentVouchersPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  const session = JSON.parse(sessionCookie?.value || "{}");
  const companyId = session.company_id || "1";

  return <PaymentVouchersClient companyId={companyId} />;
}

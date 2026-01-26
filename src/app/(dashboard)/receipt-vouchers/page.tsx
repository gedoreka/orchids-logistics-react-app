import { cookies } from "next/headers";
import { ReceiptVouchersClient } from "./receipt-vouchers-client";

export const metadata = {
  title: "سندات القبض - Logistics Systems Pro",
};

export default async function ReceiptVouchersPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  const session = JSON.parse(sessionCookie?.value || "{}");
  const companyId = session.company_id || "1";

  return <ReceiptVouchersClient companyId={companyId} />;
}

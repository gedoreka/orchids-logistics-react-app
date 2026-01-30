import { cookies } from "next/headers";
import { ReceiptVouchersClient } from "./receipt-vouchers-client";

export const metadata = {
  title: "سندات القبض - Logistics Systems Pro",
};

export default async function ReceiptVouchersPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  const session = JSON.parse(sessionCookie?.value || "{}");
  const companyId = session.company_id;

  if (!companyId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 font-bold">جاري التحقق من الجلسة...</p>
        </div>
      </div>
    );
  }

  return <ReceiptVouchersClient companyId={companyId} />;
}

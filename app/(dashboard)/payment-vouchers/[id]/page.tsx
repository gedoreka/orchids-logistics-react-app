import { cookies } from "next/headers";
import { PaymentVoucherViewClient } from "./payment-voucher-view-client";
import { notFound } from "next/navigation";

export const metadata = {
  title: "عرض سند الصرف - Logistics Systems Pro",
};

async function getVoucherData(id: string, companyId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  
  try {
    const res = await fetch(
      `${baseUrl}/api/payment-vouchers/${id}?company_id=${companyId}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching voucher:", error);
    return null;
  }
}

export default async function PaymentVoucherViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  const session = JSON.parse(sessionCookie?.value || "{}");
  const companyId = session.company_id;

  if (!companyId) {
    notFound();
  }

  const data = await getVoucherData(id, companyId);

  if (!data || !data.voucher) {
    notFound();
  }

  return (
    <PaymentVoucherViewClient
      voucher={data.voucher}
      company={data.company}
      companyId={parseInt(companyId)}
    />
  );
}

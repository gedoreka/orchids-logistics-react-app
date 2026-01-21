import { cookies } from "next/headers";
import { ReceiptVoucherViewClient } from "./receipt-voucher-view-client";
import { notFound } from "next/navigation";

export const metadata = {
  title: "عرض سند القبض - Logistics Systems Pro",
};

async function getVoucherData(id: string, companyId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  
  try {
    const res = await fetch(
      `${baseUrl}/api/receipt-vouchers/${id}?company_id=${companyId}`,
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

export default async function ReceiptVoucherViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const companyId = cookieStore.get("company_id")?.value || "1";

  const data = await getVoucherData(id, companyId);

  if (!data || !data.voucher) {
    notFound();
  }

  return (
    <ReceiptVoucherViewClient
      voucher={data.voucher}
      company={data.company}
      companyId={parseInt(companyId)}
    />
  );
}

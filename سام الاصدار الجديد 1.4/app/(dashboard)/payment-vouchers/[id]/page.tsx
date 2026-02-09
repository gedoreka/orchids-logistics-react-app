import { cookies } from "next/headers";
import { PaymentVoucherViewClient } from "./payment-voucher-view-client";
import { notFound } from "next/navigation";
import { query } from "@/lib/db";

export const metadata = {
  title: "عرض سند الصرف - Logistics Systems Pro",
};

async function getVoucherData(id: string) {
  try {
    const vouchers = await query<any>(
      `SELECT * FROM payment_vouchers WHERE id = ?`,
      [id]
    );

    if (!vouchers || vouchers.length === 0) {
      return null;
    }

    const voucher = vouchers[0];

    const companyData = await query<any>(
      `SELECT id, name, commercial_number, vat_number, country, region, district, street, postal_code, short_address, logo_path, stamp_path, digital_seal_path FROM companies WHERE id = ?`,
      [voucher.company_id]
    );

    return {
      voucher,
      company: companyData?.[0] || {},
    };
  } catch (error) {
    console.error("Error fetching voucher data:", error);
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

  const data = await getVoucherData(id);

  if (!data || !data.voucher) {
    notFound();
  }

  const serializedData = JSON.parse(JSON.stringify(data, (key, value) => {
    if (value instanceof Date) return value.toISOString();
    return value;
  }));

  return (
    <PaymentVoucherViewClient
      voucher={serializedData.voucher}
      company={serializedData.company}
      companyId={parseInt(companyId)}
    />
  );
}

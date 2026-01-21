import { cookies } from "next/headers";
import { IncomeViewClient } from "./income-view-client";
import { notFound } from "next/navigation";

export const metadata = {
  title: "عرض سند الإيراد - Logistics Systems Pro",
};

async function getIncomeData(id: string, companyId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  
  try {
    const res = await fetch(
      `${baseUrl}/api/income/${id}?company_id=${companyId}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching income:", error);
    return null;
  }
}

export default async function IncomeViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const companyId = cookieStore.get("company_id")?.value || "1";

  const data = await getIncomeData(id, companyId);

  if (!data || !data.income) {
    notFound();
  }

  return (
    <IncomeViewClient
      income={data.income}
      company={data.company}
      companyId={parseInt(companyId)}
    />
  );
}

import { cookies } from "next/headers";
import { cachedQuery } from "@/lib/db";
import { AnbSettingsClient } from "./anb-settings-client";

async function getAnbCredentials(companyId: number) {
  try {
    const rows = await cachedQuery<any>(
      `SELECT id, company_id, client_id, 
              CASE WHEN client_secret IS NOT NULL AND client_secret != '' THEN '********' ELSE '' END as client_secret_masked,
              CASE WHEN mtls_certificate IS NOT NULL AND mtls_certificate != '' THEN 1 ELSE 0 END as has_certificate,
              CASE WHEN mtls_private_key IS NOT NULL AND mtls_private_key != '' THEN 1 ELSE 0 END as has_private_key,
              mol_establishment_id, national_unified_no, debit_account, bank_code, is_active, created_at, updated_at
       FROM anb_credentials WHERE company_id = ?`,
      [companyId]
    );
    return rows[0] || null;
  } catch (error) {
    console.error("Error fetching ANB credentials:", error);
    return null;
  }
}

export default async function AnbSettingsPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  const session = JSON.parse(sessionCookie?.value || "{}");
  const companyId = session.company_id;

  if (!companyId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">جاري التحميل...</p>
      </div>
    );
  }

  const credentials = await getAnbCredentials(companyId);

  return <AnbSettingsClient credentials={credentials} companyId={companyId} />;
}

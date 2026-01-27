import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { createClient } from "@supabase/supabase-js";
import { SettingsContent } from "./SettingsContent";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");

  if (!sessionCookie) {
    return <div>Not authenticated</div>;
  }

  const session = JSON.parse(sessionCookie.value);
  const companyId = session.company_id;
  const userId = session.user_id;

  // Fetch company info
  const companies = await query<any>(
    "SELECT name, currency, region, created_at, access_token FROM companies WHERE id = ?",
    [companyId]
  );
  const company = companies[0] || {};

  // Fetch tax settings from Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: taxSettings } = await supabase
    .from("tax_settings")
    .select("*")
    .eq("company_id", companyId)
    .single();

  // Fetch user email
  const users = await query<any>(
    "SELECT email FROM users WHERE id = ?",
    [userId]
  );
  const userEmail = users[0]?.email || "";

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <SettingsContent 
        company={company} 
        taxSettings={taxSettings || {}} 
        userEmail={userEmail}
        companyId={companyId}
      />
    </div>
  );
}

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase-client";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("auth_session");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const companyId = session.company_id;

    if (!companyId) {
      return NextResponse.json({ error: "Company ID not found" }, { status: 400 });
    }

    const { data: defaults, error } = await supabase
      .from("default_accounts")
      .select("id, account_key, account_id")
      .eq("company_id", companyId);

    if (error) throw error;

    const { data: accounts, error: accError } = await supabase
      .from("accounts")
      .select("id, account_code, account_name, type")
      .eq("company_id", companyId)
      .eq("is_active", true)
      .order("account_code");

    if (accError) throw accError;

    return NextResponse.json({ defaults: defaults || [], accounts: accounts || [] });
  } catch (error) {
    console.error("Error fetching default accounts:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("auth_session");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const companyId = session.company_id;

    if (!companyId) {
      return NextResponse.json({ error: "Company ID not found" }, { status: 400 });
    }

    const body = await request.json();
    const { mappings } = body as { mappings: { account_key: string; account_id: number }[] };

    if (!mappings || !Array.isArray(mappings)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Upsert each mapping
    for (const m of mappings) {
      const { data: existing } = await supabase
        .from("default_accounts")
        .select("id")
        .eq("company_id", companyId)
        .eq("account_key", m.account_key)
        .limit(1)
        .single();

      if (existing) {
        await supabase
          .from("default_accounts")
          .update({ account_id: m.account_id })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("default_accounts")
          .insert({ company_id: companyId, account_key: m.account_key, account_id: m.account_id });
      }
    }

    return NextResponse.json({ success: true, message: "تم حفظ الحسابات الافتراضية بنجاح" });
  } catch (error) {
    console.error("Error saving default accounts:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

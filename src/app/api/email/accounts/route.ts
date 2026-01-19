import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const EMAIL_PROVIDERS = {
  hostinger: {
    name: "Hostinger",
    imap_host: "imap.hostinger.com",
    imap_port: 993,
    smtp_host: "smtp.hostinger.com",
    smtp_port: 465,
  },
  gmail: {
    name: "Gmail",
    imap_host: "imap.gmail.com",
    imap_port: 993,
    smtp_host: "smtp.gmail.com",
    smtp_port: 465,
  },
  outlook: {
    name: "Outlook/Hotmail",
    imap_host: "outlook.office365.com",
    imap_port: 993,
    smtp_host: "smtp.office365.com",
    smtp_port: 587,
  },
  custom: {
    name: "Custom",
    imap_host: "",
    imap_port: 993,
    smtp_host: "",
    smtp_port: 465,
  },
};

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const companyId = cookieStore.get("company_id")?.value;

    if (!companyId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("company_email_accounts")
      .select("*")
      .eq("company_id", parseInt(companyId))
      .order("created_at", { ascending: false });

    if (error) throw error;

    const accounts = data.map((acc) => ({
      ...acc,
      password: "********",
    }));

    return NextResponse.json({ accounts, providers: EMAIL_PROVIDERS });
  } catch (error) {
    console.error("Error fetching email accounts:", error);
    return NextResponse.json(
      { error: "حدث خطأ في جلب حسابات البريد" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const companyId = cookieStore.get("company_id")?.value;

    if (!companyId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await request.json();
    const { email, password, provider, imap_host, imap_port, smtp_host, smtp_port } = body;

    if (!email || !password || !provider) {
      return NextResponse.json(
        { error: "البريد وكلمة المرور والمزود مطلوبين" },
        { status: 400 }
      );
    }

    const providerConfig = EMAIL_PROVIDERS[provider as keyof typeof EMAIL_PROVIDERS];
    
    const finalImapHost = provider === "custom" ? imap_host : providerConfig.imap_host;
    const finalImapPort = provider === "custom" ? imap_port : providerConfig.imap_port;
    const finalSmtpHost = provider === "custom" ? smtp_host : providerConfig.smtp_host;
    const finalSmtpPort = provider === "custom" ? smtp_port : providerConfig.smtp_port;

    const { data: existing } = await supabase
      .from("company_email_accounts")
      .select("id")
      .eq("company_id", parseInt(companyId))
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "هذا البريد مضاف مسبقاً" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("company_email_accounts")
      .insert({
        company_id: parseInt(companyId),
        email,
        password,
        provider,
        imap_host: finalImapHost,
        imap_port: finalImapPort,
        smtp_host: finalSmtpHost,
        smtp_port: finalSmtpPort,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      account: { ...data, password: "********" },
    });
  } catch (error) {
    console.error("Error adding email account:", error);
    return NextResponse.json(
      { error: "حدث خطأ في إضافة حساب البريد" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const companyId = cookieStore.get("company_id")?.value;

    if (!companyId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("id");

    if (!accountId) {
      return NextResponse.json({ error: "معرف الحساب مطلوب" }, { status: 400 });
    }

    const { error } = await supabase
      .from("company_email_accounts")
      .delete()
      .eq("id", accountId)
      .eq("company_id", parseInt(companyId));

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting email account:", error);
    return NextResponse.json(
      { error: "حدث خطأ في حذف حساب البريد" },
      { status: 500 }
    );
  }
}

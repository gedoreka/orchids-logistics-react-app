import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

async function getCompanyId() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  if (!sessionCookie) return null;
  const session = JSON.parse(sessionCookie.value);
  return session.company_id;
}

async function ensureSchema() {
  try { await execute("ALTER TABLE letter_templates ADD COLUMN company_id INT NULL", []); } catch { /* exists */ }
  try { await execute("ALTER TABLE letter_templates ADD COLUMN placeholder_labels TEXT NULL", []); } catch { /* exists */ }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId();
    if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await ensureSchema();

    const body = await request.json();
    const { template_name, template_content, placeholders, placeholder_labels } = body;

    if (!template_name || !template_content) {
      return NextResponse.json({ error: "اسم القالب والمحتوى مطلوبان" }, { status: 400 });
    }

    const templateKey = `custom_${companyId}_${Date.now()}`;

    await execute(
      `INSERT INTO letter_templates
       (template_key, template_name, template_name_ar, template_content, placeholders, is_system_template, company_id, placeholder_labels)
       VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
      [
        templateKey,
        template_name,
        template_name,
        template_content,
        JSON.stringify(placeholders || []),
        companyId,
        JSON.stringify(placeholder_labels || {}),
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error creating custom template:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const companyId = await getCompanyId();
    if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing template ID" }, { status: 400 });

    await execute(
      "DELETE FROM letter_templates WHERE id = ? AND company_id = ? AND is_system_template = 0",
      [parseInt(id), companyId]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting custom template:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

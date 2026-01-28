import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { cookies } from "next/headers";

async function getCompanyId() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  if (!sessionCookie) return null;
  const session = JSON.parse(sessionCookie.value);
  return session.company_id;
}

export async function GET() {
  try {
    const companyId = await getCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const templates = await query<any>(
      "SELECT * FROM letter_templates WHERE is_system_template = true ORDER BY id ASC"
    );

    const letters = await query<any>(
      `SELECT gl.*, lt.template_name_ar, lt.template_key 
       FROM generated_letters gl 
       JOIN letter_templates lt ON gl.template_id = lt.id 
       WHERE gl.company_id = ? 
       ORDER BY gl.created_at DESC`,
      [companyId]
    );

    return NextResponse.json({ 
      success: true, 
      templates: templates || [], 
      letters: letters || [] 
    });
  } catch (error: any) {
    console.error("Error fetching letters:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { template_id, letter_data, notes } = body;

    const year = new Date().getFullYear();
    const countResult = await query<{ count: number }>(
      "SELECT COUNT(*) as count FROM generated_letters WHERE company_id = ? AND EXTRACT(YEAR FROM created_at) = ?",
      [companyId, year]
    );
    const count = (countResult?.[0]?.count || 0) + 1;
    const letterNumber = `LTR-${year}-${String(count).padStart(4, "0")}`;

    await execute(
      `INSERT INTO generated_letters (company_id, template_id, letter_number, letter_data, notes) 
       VALUES (?, ?, ?, ?, ?)`,
      [companyId, template_id, letterNumber, JSON.stringify(letter_data), notes || null]
    );

    return NextResponse.json({ success: true, letter_number: letterNumber });
  } catch (error: any) {
    console.error("Error creating letter:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const companyId = await getCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, letter_data, notes, status } = body;

    await execute(
      `UPDATE generated_letters 
       SET letter_data = ?, notes = ?, status = ?, updated_at = NOW() 
       WHERE id = ? AND company_id = ?`,
      [JSON.stringify(letter_data), notes || null, status || "active", id, companyId]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating letter:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const companyId = await getCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing letter ID" }, { status: 400 });
    }

    await execute(
      "DELETE FROM generated_letters WHERE id = ? AND company_id = ?",
      [parseInt(id), companyId]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting letter:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

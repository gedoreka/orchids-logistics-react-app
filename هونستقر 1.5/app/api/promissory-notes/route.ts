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

export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const notes = await query<any>(
      `SELECT * FROM promissory_notes WHERE company_id = ? ORDER BY created_at DESC`,
      [companyId]
    );

    return NextResponse.json({ notes });
  } catch (error) {
    console.error("Error fetching promissory notes:", error);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const data = await request.json();

    const countResult = await query<any>(
      `SELECT COUNT(*) as count FROM promissory_notes WHERE company_id = ?`,
      [companyId]
    );
    const noteNumber = `PN-${String(countResult[0].count + 1).padStart(5, '0')}`;

    const result = await execute(
      `INSERT INTO promissory_notes (
        company_id, note_number, debtor_name, debtor_id_number, amount, amount_text,
        creation_date, due_date, creation_place, debtor_address, beneficiary_name,
        beneficiary_commercial_number, beneficiary_id_number, beneficiary_id_type,
        use_custom_beneficiary, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        companyId,
        noteNumber,
        data.debtor_name || null,
        data.debtor_id_number || null,
        data.amount || null,
        data.amount_text || null,
        data.creation_date || null,
        data.due_date || null,
        data.creation_place || null,
        data.debtor_address || null,
        data.beneficiary_name || null,
        data.beneficiary_commercial_number || null,
        data.beneficiary_id_number || null,
        data.beneficiary_id_type || 'commercial',
        data.use_custom_beneficiary ? 1 : 0,
        data.status || 'draft',
        data.notes || null
      ]
    );

    return NextResponse.json({ 
      success: true, 
      id: result.insertId,
      note_number: noteNumber 
    });
  } catch (error) {
    console.error("Error creating promissory note:", error);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const companyId = await getCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const data = await request.json();
    
    if (!data.id) {
      return NextResponse.json({ error: "Note ID required" }, { status: 400 });
    }

    await execute(
      `UPDATE promissory_notes SET 
        debtor_name = ?, debtor_id_number = ?, amount = ?, amount_text = ?,
        creation_date = ?, due_date = ?, creation_place = ?, debtor_address = ?,
        beneficiary_name = ?, beneficiary_commercial_number = ?, beneficiary_id_number = ?,
        beneficiary_id_type = ?, use_custom_beneficiary = ?, status = ?, notes = ?
      WHERE id = ? AND company_id = ?`,
      [
        data.debtor_name || null,
        data.debtor_id_number || null,
        data.amount || null,
        data.amount_text || null,
        data.creation_date || null,
        data.due_date || null,
        data.creation_place || null,
        data.debtor_address || null,
        data.beneficiary_name || null,
        data.beneficiary_commercial_number || null,
        data.beneficiary_id_number || null,
        data.beneficiary_id_type || 'commercial',
        data.use_custom_beneficiary ? 1 : 0,
        data.status || 'draft',
        data.notes || null,
        data.id,
        companyId
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating promissory note:", error);
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const companyId = await getCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Note ID required" }, { status: 400 });
    }

    await execute(
      `DELETE FROM promissory_notes WHERE id = ? AND company_id = ?`,
      [id, companyId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting promissory note:", error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}

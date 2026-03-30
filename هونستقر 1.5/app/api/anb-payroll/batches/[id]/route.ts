import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const batches = await query<any>(
      `SELECT b.* FROM anb_payroll_batches b WHERE b.id = ?`,
      [id]
    );

    if (batches.length === 0) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    const items = await query<any>(
      `SELECT * FROM anb_payroll_batch_items WHERE batch_id = ? ORDER BY id`,
      [id]
    );

    return NextResponse.json({ ...batches[0], items });
  } catch (error) {
    console.error("Error fetching ANB batch:", error);
    return NextResponse.json({ error: "Failed to fetch batch" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const batches = await query<any>(
      `SELECT status FROM anb_payroll_batches WHERE id = ?`,
      [id]
    );

    if (batches.length === 0) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    if (batches[0].status !== 'draft') {
      return NextResponse.json({ error: "لا يمكن حذف دفعة تم إرسالها" }, { status: 400 });
    }

    await execute(`DELETE FROM anb_payroll_batches WHERE id = ?`, [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting ANB batch:", error);
    return NextResponse.json({ error: "فشل في حذف الدفعة" }, { status: 500 });
  }
}

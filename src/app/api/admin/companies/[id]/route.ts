import { NextRequest, NextResponse } from "next/server";
import { execute } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const { action, duration } = body;

    if (action === "approve") {
      await execute("UPDATE companies SET status = 'approved', is_active = 1 WHERE id = ?", [id]);
    } else if (action === "reject") {
      await execute("UPDATE companies SET status = 'rejected', is_active = 0 WHERE id = ?", [id]);
    } else if (action === "toggle") {
      await execute("UPDATE companies SET is_active = NOT is_active WHERE id = ?", [id]);
    } else if (action === "generate_token") {
      const token = uuidv4().substring(0, 8).toUpperCase();
      let expiry = null;
      if (duration && parseInt(duration) > 0) {
        const date = new Date();
        date.setDate(date.getDate() + parseInt(duration));
        expiry = date.toISOString().split('T')[0];
      }
      await execute("UPDATE companies SET access_token = ?, token_expiry = ? WHERE id = ?", [token, expiry, id]);
      return NextResponse.json({ success: true, token, expiry });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating company:", error);
    return NextResponse.json({ error: "Failed to update company" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get("company_id");

    if (!company_id) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
    }

    const tickets = await query<any>(
      "SELECT * FROM support_tickets WHERE company_id = ? ORDER BY created_at DESC",
      [company_id]
    );

    return NextResponse.json({ success: true, tickets });
  } catch (error) {
    console.error("Fetch Tickets Error:", error);
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { company_id } = await request.json();

    if (!company_id) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
    }

    // Check if there is an active ticket (less than 24h old)
    const activeTickets = await query<any>(
      "SELECT * FROM support_tickets WHERE company_id = ? AND expires_at > NOW() AND status = 'open' LIMIT 1",
      [company_id]
    );

    if (activeTickets.length > 0) {
      return NextResponse.json({ 
        success: true, 
        ticket: activeTickets[0],
        message: "You already have an active ticket" 
      });
    }

    // Create new ticket
    const ticketNumber = `TKT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    const result = await execute(
      "INSERT INTO support_tickets (ticket_number, company_id, status, expires_at) VALUES (?, ?, 'open', ?)",
      [ticketNumber, company_id, expiresAt]
    );

    const newTicket = {
      id: result.insertId,
      ticket_number: ticketNumber,
      company_id,
      status: 'open',
      created_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString()
    };

    return NextResponse.json({ success: true, ticket: newTicket });
  } catch (error) {
    console.error("Create Ticket Error:", error);
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
  }
}

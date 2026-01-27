import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import SubscriptionsClient from "./subscriptions-client";

export default async function AdminSubscriptionsPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");

  if (!sessionCookie) {
    redirect("/login");
  }

  let session;
  try {
    session = JSON.parse(sessionCookie.value);
  } catch {
    redirect("/login");
  }

  if (session.role !== "admin") {
    redirect("/dashboard");
  }

  let plans: any[] = [];
  let bankAccounts: any[] = [];
  let payments: any[] = [];
  let stats = { totalPlans: 0, activePlans: 0, totalPayments: 0, pendingPayments: 0 };

  try {
    plans = await query(`SELECT * FROM subscription_plans ORDER BY sort_order ASC, id ASC`);
    
    bankAccounts = await query(`SELECT * FROM admin_bank_accounts ORDER BY sort_order ASC, id ASC`);
    
    payments = await query(`
      SELECT 
        pr.*,
        c.name as company_name,
        sp.name as plan_name,
        sp.price as plan_price,
        ba.bank_name
      FROM payment_requests pr
      LEFT JOIN companies c ON pr.company_id = c.id
      LEFT JOIN subscription_plans sp ON pr.plan_id = sp.id
      LEFT JOIN admin_bank_accounts ba ON pr.bank_account_id = ba.id
      ORDER BY pr.created_at DESC
      LIMIT 100
    `);

    const planStats = await query<any>(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active
      FROM subscription_plans
    `);
    
    const paymentStats = await query<any>(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
      FROM payment_requests
    `);

    stats = {
      totalPlans: planStats[0]?.total || 0,
      activePlans: planStats[0]?.active || 0,
      totalPayments: paymentStats[0]?.total || 0,
      pendingPayments: paymentStats[0]?.pending || 0
    };
  } catch (error) {
    console.error("Error fetching subscription data:", error);
  }

  const serializedPlans = plans.map((p: any) => ({
    ...p,
    price: parseFloat(p.price) || 0,
    created_at: p.created_at ? new Date(p.created_at).toISOString() : null,
    updated_at: p.updated_at ? new Date(p.updated_at).toISOString() : null,
  }));

  const serializedPayments = payments.map((p: any) => ({
    ...p,
    amount: parseFloat(p.amount) || 0,
    plan_price: parseFloat(p.plan_price) || 0,
    created_at: p.created_at ? new Date(p.created_at).toISOString() : null,
    processed_at: p.processed_at ? new Date(p.processed_at).toISOString() : null,
  }));

  const serializedBankAccounts = bankAccounts.map((b: any) => ({
    ...b,
    created_at: b.created_at ? new Date(b.created_at).toISOString() : null,
    updated_at: b.updated_at ? new Date(b.updated_at).toISOString() : null,
  }));

  return (
    <SubscriptionsClient
      initialPlans={serializedPlans}
      initialBankAccounts={serializedBankAccounts}
      initialPayments={serializedPayments}
      stats={stats}
      userId={session.user_id}
    />
  );
}

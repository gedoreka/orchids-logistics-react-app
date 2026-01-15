import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { User } from "@/lib/types";
import IncomeFormClient from "./income-form-client";

export default async function NewIncomePage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");

  if (!sessionCookie) {
    redirect("/login");
  }

  const session = JSON.parse(sessionCookie.value);
  const users = await query<User>(
    "SELECT id, name, email, role, company_id FROM users WHERE id = ?",
    [session.user_id]
  );

  if (users.length === 0) {
    redirect("/login");
  }

  const user = users[0];

  return (
    <div className="container mx-auto py-6">
      <IncomeFormClient user={user} />
    </div>
  );
}

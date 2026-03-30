import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SystemSettingsClient } from "./system-settings-client";

export default async function SystemSettingsPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  
  if (!sessionCookie) {
    redirect("/login");
  }
  
  try {
    const session = JSON.parse(sessionCookie.value);
    if (session.role !== "admin") {
      redirect("/dashboard");
    }
  } catch {
    redirect("/login");
  }

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <SystemSettingsClient />
    </div>
  );
}

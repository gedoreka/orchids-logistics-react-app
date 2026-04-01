import { cookies } from "next/headers";
import { DriverTrackingClient } from "./driver-tracking-client";

export default async function DriverTrackingPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  const session = JSON.parse(sessionCookie?.value || "{}");
  const companyId = session.company_id;

  return <DriverTrackingClient companyId={companyId} />;
}

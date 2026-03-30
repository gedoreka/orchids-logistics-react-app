import { cookies } from "next/headers";
import LoginWrapper from "./login-wrapper";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const initialEmail = cookieStore.get("user_email")?.value || "";

  return <LoginWrapper initialEmail={initialEmail} />;
}

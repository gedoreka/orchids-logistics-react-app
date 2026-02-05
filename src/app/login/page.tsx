import { cookies } from "next/headers";
import LoginForm from "./login-form";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const initialEmail = cookieStore.get("user_email")?.value || "";

  return <LoginForm initialEmail={initialEmail} />;
}

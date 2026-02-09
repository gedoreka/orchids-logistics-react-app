import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ResetForm from "./reset-form";

export const metadata = {
  title: "تعيين كلمة مرور جديدة - Logistics Systems Pro",
};

export default async function ResetPage() {
  const cookieStore = await cookies();
  const email = cookieStore.get("reset_email")?.value;
  const userName = cookieStore.get("reset_user_name")?.value || "المستخدم";
  const verified = cookieStore.get("token_verified")?.value === "true";

  if (!email || !verified) {
    redirect("/forgot-password");
  }

  return <ResetForm email={email} userName={userName} />;
}

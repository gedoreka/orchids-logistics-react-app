import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import VerifyForm from "./verify-form";

export const metadata = {
  title: "التحقق من الرمز - Logistics Systems Pro",
};

export default async function VerifyPage() {
  const cookieStore = await cookies();
  const email = cookieStore.get("reset_email")?.value;
  const userName = cookieStore.get("reset_user_name")?.value || "المستخدم";

  if (!email) {
    redirect("/forgot-password");
  }

  return <VerifyForm email={email} userName={userName} />;
}

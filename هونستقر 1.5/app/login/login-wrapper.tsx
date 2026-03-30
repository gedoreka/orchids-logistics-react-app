"use client";

import dynamic from "next/dynamic";

const LoginForm = dynamic(() => import("./login-form"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-500" />
    </div>
  ),
});

interface LoginWrapperProps {
  initialEmail?: string;
}

export default function LoginWrapper({ initialEmail = "" }: LoginWrapperProps) {
  return <LoginForm initialEmail={initialEmail} />;
}

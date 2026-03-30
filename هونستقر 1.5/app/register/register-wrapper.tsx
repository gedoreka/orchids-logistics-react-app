"use client";

import dynamic from "next/dynamic";

const RegisterForm = dynamic(() => import("./register-form"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-600 dark:text-slate-400 font-medium">جاري التحميل...</p>
      </div>
    </div>
  ),
});

export default function RegisterWrapper() {
  return <RegisterForm />;
}

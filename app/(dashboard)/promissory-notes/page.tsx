import { Suspense } from "react";
import PromissoryNotesClient from "./promissory-notes-client";

export default function PromissoryNotesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>}>
      <PromissoryNotesClient />
    </Suspense>
  );
}

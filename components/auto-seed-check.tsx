"use client";

import { useEffect } from "react";
import { toast } from "sonner";

interface AutoSeedCheckProps {
  companyId: number;
}

export function AutoSeedCheck({ companyId }: AutoSeedCheckProps) {
  useEffect(() => {
    if (!companyId) return;

    // Run once per browser session (cleared on tab/window close = after logout)
    const sessionKey = `auto_seeded_v1_${companyId}`;
    if (sessionStorage.getItem(sessionKey)) return;

    // Mark immediately to prevent duplicate calls if component re-mounts
    sessionStorage.setItem(sessionKey, "1");

    const runSeed = async () => {
      try {
        const [r1, r2] = await Promise.all([
          fetch("/api/accounts/seed", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ company_id: companyId }),
          }),
          fetch("/api/cost-centers/seed", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ company_id: companyId }),
          }),
        ]);

        const [d1, d2] = await Promise.all([r1.json(), r2.json()]);

        if (d1.success && d2.success) {
          toast.success("تم تهيئة وتحديث شجرة الحسابات ومراكز التكلفة بنجاح", {
            description: "يمكنك إضافة حساباتك ومراكزك الخاصة أيضاً",
            duration: 5000,
            position: "top-right",
          });
        }
      } catch {
        // Silent fail — remove flag so it retries next navigation
        sessionStorage.removeItem(sessionKey);
      }
    };

    runSeed();
  }, [companyId]);

  return null;
}

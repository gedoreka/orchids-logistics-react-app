import React from "react";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { UserProfileClient } from "./user-profile-client";
import { notFound } from "next/navigation";

export default async function UserProfilePage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  const session = JSON.parse(sessionCookie?.value || "{}");
  
  if (!session.user_id) {
    notFound();
  }

  const userId = session.user_id;
  const companyId = session.company_id;

  const userRes = await query("SELECT * FROM users WHERE id = ?", [userId]);
  const user = userRes[0];

  if (!user) {
    notFound();
  }

  let company = null;
  if (companyId) {
    const companyRes = await query("SELECT * FROM companies WHERE id = ?", [companyId]);
    company = companyRes[0];
  }

  let bankAccounts: any[] = [];
  if (companyId) {
    bankAccounts = await query(
      "SELECT * FROM company_bank_accounts WHERE company_id = ? ORDER BY id DESC",
      [companyId]
    );
  }

  let licenses: any[] = [];
  if (companyId) {
    licenses = await query(
      "SELECT * FROM company_licenses WHERE company_id = ? ORDER BY id DESC",
      [companyId]
    );
  }

  const formatDate = (obj: any) => {
    if (!obj) return obj;
    const newObj = { ...obj };
    for (const key in newObj) {
      if (newObj[key] instanceof Date) {
        const d = newObj[key] as Date;
        if (!isNaN(d.getTime())) {
          newObj[key] = d.toISOString().split('T')[0];
        } else {
          newObj[key] = null;
        }
      }
    }
    return newObj;
  };

  return (
    <UserProfileClient 
      user={formatDate(user)}
      company={formatDate(company)}
      bankAccounts={bankAccounts.map(b => formatDate(b))}
      licenses={licenses.map(l => formatDate(l))}
    />
  );
}

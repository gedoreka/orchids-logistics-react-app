import React from "react";
import { query } from "@/lib/db";
import { AdminNotificationsClient } from "./notifications-client";

export default async function AdminNotificationsPage() {
  const notifications = await query<any>(
    "SELECT * FROM admin_notifications ORDER BY created_at DESC"
  );

  return (
    <AdminNotificationsClient initialNotifications={notifications} />
  );
}

import { supabase } from "./supabase-client";

export async function logSubUserActivity({
  subUserId,
  companyId,
  actionType,
  actionDescription,
  ipAddress,
  metadata = {},
}: {
  subUserId: number;
  companyId: number;
  actionType: string;
  actionDescription: string;
  ipAddress?: string;
  metadata?: any;
}) {
  try {
    const { error } = await supabase.from("sub_user_activity_logs").insert({
      sub_user_id: subUserId,
      company_id: companyId,
      action_type: actionType,
      action_description: actionDescription,
      ip_address: ipAddress || null,
      metadata,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error logging sub-user activity:", error);
    }
  } catch (error) {
    console.error("Error in logSubUserActivity:", error);
  }
}

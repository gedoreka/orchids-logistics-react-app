export type UserType = 'admin' | 'owner' | 'sub_user';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  company_id: number;
  is_activated: number;
  user_type?: UserType;
}

export interface SubUser {
  id: number;
  company_id: number;
  name: string;
  email: string;
  password?: string;
  profile_image?: string;
  status: 'active' | 'suspended' | 'deleted';
  created_at: string;
  updated_at?: string;
  last_login_at?: string;
  created_by: number;
  max_sessions: number;
}

export interface SubUserPermission {
  id: number;
  sub_user_id: number;
  permission_key: string;
  granted_by: number;
  granted_at: string;
}

export interface SubUserSession {
  id: number;
  session_id: string;
  sub_user_id: number;
  ip_address?: string;
  user_agent?: string;
  device_info?: string;
  login_at: string;
  last_activity: string;
  is_active: boolean;
}

export interface SubUserActivityLog {
  id: number;
  sub_user_id: number;
  company_id: number;
  action_type: string;
  action_description?: string;
  ip_address?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface PermissionGroup {
  id: number;
  company_id: number;
  name: string;
  description?: string;
  permissions: string[];
  created_at: string;
  created_by: number;
}

export interface AuthSession {
  user_id: number;
  user_name: string;
  company_id: number;
  role: string;
  permissions: Record<string, number>;
  user_type: UserType;
  sub_user_id?: number;
}

export interface Company {
  id: number;
  name?: string;
  status: 'pending' | 'approved' | 'rejected';
  is_active: number;
  commercial_number?: string;
  vat_number?: string;
  phone?: string;
  email?: string;
  website?: string;
  currency?: string;
  logo?: string;
  logo_path?: string;
  stamp?: string;
  stamp_path?: string;
  digital_seal_path?: string;
  country?: string;
  region?: string;
  district?: string;
  street?: string;
  postal_code?: string;
  short_address?: string;
  bank_beneficiary?: string;
  bank_name?: string;
  bank_account?: string;
  bank_iban?: string;
  transport_license_number?: string;
  transport_license_type?: string;
  transport_license_image?: string;
  license_image?: string;
  license_start?: string;
  license_end?: string;
  access_token?: string;
  token_expiry?: string;
  created_at: string;
}

export interface ResetToken {
  id: number;
  email: string;
  token: string;
  created_at: string;
}

export interface Account {
  id: number;
  account_code: string;
  account_name: string;
  type: string;
  company_id: number;
  parent_id?: number | null;
  account_type?: 'main' | 'sub';
  created_at: string;
}

export interface CostCenter {
  id: number;
  center_code: string;
  center_name: string;
  company_id: number;
  created_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  company_id: number;
  is_activated: number;
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
  created_at: string;
}

export interface CostCenter {
  id: number;
  center_code: string;
  center_name: string;
  company_id: number;
  created_at: string;
}

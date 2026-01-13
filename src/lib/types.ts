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
  status: 'pending' | 'approved' | 'rejected';
  is_active: number;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: User;
  permissions?: Record<string, number>;
}

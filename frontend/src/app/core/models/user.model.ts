export interface User {
  id: string;
  email: string;
  fullName: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: 'estudiante' | 'profesional' | 'otro';
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

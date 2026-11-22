export interface UserSummary {
  userId: number;
  fullName: string;
  email: string;
  role: string;
}
export interface AuthResponse {
  token: string;
  userId: number;
  fullName: string;
  email: string;
  role: string;
}

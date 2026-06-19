export interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  is_active: number;
  created_at: Date;
}

export interface CreateUserInput {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

export interface LoginResult {
  user: User;
  token: string;
}

export interface PasswordResetRequestResult {
  userId: string;
  rawToken: string;
  expiresAt: Date;
}
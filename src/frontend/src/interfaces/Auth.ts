
export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  permissions: string[];
}

export interface RecoverPasswordRequest {
  username: string;
  masterKey: string;
  newPassword: string;
}
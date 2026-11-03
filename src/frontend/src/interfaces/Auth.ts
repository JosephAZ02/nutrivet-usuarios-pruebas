
export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  permissions: string[];
  name: string;  
  username: string;
}

export interface RecoverPasswordRequest {
  username: string;
  masterKey: string;
  newPassword: string;
}
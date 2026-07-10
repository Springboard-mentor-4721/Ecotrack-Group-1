export interface LoginRequest {
  email: string;
  password?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password?: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  message: string;
}

export interface MessageResponse {
  message: string;
}

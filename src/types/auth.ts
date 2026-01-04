/**
 * Authentication Types
 */

export interface AccountInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  roles: string[];
}

export interface AuthenticationResponse {
  authenticated: boolean;
  token?: string;
  refreshToken?: string;
  accountInfo?: AccountInfo;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errorCode?: string;
}

export interface OutboundAuthenticateRequest {
  code: string;
  redirectUri: string;
}

export interface MobileOutboundAuthenticateRequest {
  idToken: string;
  platform: 'ANDROID' | 'IOS';
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  token: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AccountInfo | null;
  accessToken: string | null;
  refreshToken: string | null;
}

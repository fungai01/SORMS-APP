import {Platform} from 'react-native';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {decode as atob} from 'base-64';
import apiClient from './apiClient';
import {API_ENDPOINTS} from '../config/api';
import {APP_CONSTANTS} from '../config/constants';
import {
  AuthenticationResponse,
  MobileOutboundAuthenticateRequest,
  RefreshTokenRequest,
  LogoutRequest,
} from '../types/auth';
import tokenManager from '../utils/tokenManager';

/**
 * Authentication Service
 */
class AuthService {
  /**
   * Khởi tạo Google Sign-In
   */
  async initializeGoogleSignIn(): Promise<void> {
    // NOTE:
    // For Google Sign-In, `webClientId` MUST be the OAuth Client ID of type "Web".
    // Using the Android client id here will often produce an idToken with an `aud`
    // that your backend will reject during verification (resulting in "Unauthenticated").
    const webClientId = APP_CONSTANTS.GOOGLE_WEB_CLIENT_ID;

    if (!webClientId) {
      throw new Error(
        'Missing GOOGLE_WEB_CLIENT_ID. Please set APP_CONSTANTS.GOOGLE_WEB_CLIENT_ID to your Google OAuth Web client id.',
      );
    }

    GoogleSignin.configure({
      webClientId,
      offlineAccess: true,
      scopes: ['openid', 'email', 'profile'],
      // forceCodeForRefreshToken: true, // enable only if your backend needs server auth code
    });
  }

  /**
   * Đăng nhập với Google (Mobile flow)
   */
  async loginWithGoogle(): Promise<AuthenticationResponse> {
    try {
      // Kiểm tra Google Play Services
      await GoogleSignin.hasPlayServices();

      // Đăng nhập với Google
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.idToken;

      if (!idToken) {
        throw new Error('Không thể lấy ID token từ Google');
      }

      // DEBUG: verify we really got a Google ID token (NOT your backend JWT)
      // Safe to log only header/payload fields; do NOT log the full token in production.
      try {
        const [h, p] = idToken.split('.');
        const decodePart = (s: string) => {
          // base64url to base64
          const base64 = s.replace(/-/g, '+').replace(/_/g, '/');
          // atob requires padding, but base64url often omits it
          const paddedBase64 = base64 + '==='.slice(0, (4 - (base64.length % 4)) % 4);
          const decoded = atob(paddedBase64);
          // Handle UTF-8 characters correctly
          const utf8Decoded = decodeURIComponent(
            Array.prototype.map
              .call(decoded, c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join(''),
          );
          return JSON.parse(utf8Decoded);
        };
        const header = decodePart(h);
        const payload = decodePart(p);
        console.log('Google idToken header.alg:', header?.alg);
        console.log('Google idToken payload.iss:', payload?.iss);
        console.log('Google idToken payload.aud:', payload?.aud);
        console.log('Google idToken payload.email:', payload?.email);
      } catch (e) {
        console.log('Could not decode idToken for debug');
      }

// Gọi API backend để authenticate
      const request: MobileOutboundAuthenticateRequest = {
        idToken,
        platform: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
      };

      // DEBUG: log what we send to backend (do not log full tokens)
      console.log('MOBILE_LOGIN request body:', request);
      console.log(
        'MOBILE_LOGIN Authorization Bearer (first 20):',
        idToken.slice(0, 20),
      );

      // Backend expects the Google idToken BOTH in the request body and as a Bearer token.
      // Also set X-Skip-Auth so apiClient won't overwrite Authorization with stored backend token.
      const response = await apiClient.post<AuthenticationResponse>(
        API_ENDPOINTS.AUTH.MOBILE_LOGIN,
        request,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            'X-Skip-Auth': '1',
          },
        } as any,
      );

      // apiClient.post() trả về ApiResponse<T>, không phải { data: ApiResponse<T> }
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Đăng nhập thất bại');
      }

      const authData = response.data;

      if (authData.authenticated && authData.token && authData.accountInfo) {
        // Lưu tokens và user info
        await tokenManager.saveAccessToken(authData.token);
        if (authData.refreshToken) {
          await tokenManager.saveRefreshToken(authData.refreshToken);
        }
        await tokenManager.saveUserInfo(authData.accountInfo);
      }

      return authData;
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'SIGN_IN_CANCELLED') {
        throw new Error('Đăng nhập bị hủy');
      }
      throw new Error(error.message || 'Đăng nhập thất bại');
    }
  }

  /**
   * Refresh token
   */
  async refreshToken(): Promise<AuthenticationResponse> {
    try {
      const refreshToken = await tokenManager.getRefreshToken();
      if (!refreshToken) {
        throw new Error('Không có refresh token');
      }

      const request: RefreshTokenRequest = {refreshToken};
      const response = await apiClient.post<AuthenticationResponse>(
        API_ENDPOINTS.AUTH.REFRESH,
        request,
      );

      // apiClient.post() trả về ApiResponse<T>, không phải { data: ApiResponse<T> }
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Làm mới token thất bại');
      }

      const authData = response.data;

      if (authData.token) {
        await tokenManager.saveAccessToken(authData.token);
        if (authData.refreshToken) {
          await tokenManager.saveRefreshToken(authData.refreshToken);
        }
      }

      return authData;
    } catch (error: any) {
      console.error('Refresh token error:', error);
      throw new Error(error.message || 'Làm mới token thất bại');
    }
  }

  /**
   * Đăng xuất
   */
  async logout(): Promise<void> {
    try {
      const token = await tokenManager.getAccessToken();
      if (token) {
        const request: LogoutRequest = {token};
        await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, request);
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Vẫn xóa local storage dù API call fail
    } finally {
      // Đăng xuất Google
      try {
        await GoogleSignin.signOut();
      } catch (error) {
        console.error('Google sign out error:', error);
      }

      // Xóa tokens và user info
      await tokenManager.clearAll();
    }
  }

  /**
   * Kiểm tra session hiện tại
   */
  async checkSession(): Promise<boolean> {
    try {
      const hasToken = await tokenManager.hasValidToken();
      if (!hasToken) {
        return false;
      }

      // Có thể thêm API call để verify token nếu cần
      return true;
    } catch (error) {
      console.error('Check session error:', error);
      return false;
    }
  }
}

export default new AuthService();

import {Platform} from 'react-native';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
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
    // webClientId là bắt buộc để lấy idToken
    // Nếu không có webClientId, sử dụng Android Client ID làm fallback
    const webClientId =
      APP_CONSTANTS.GOOGLE_WEB_CLIENT_ID ||
      APP_CONSTANTS.GOOGLE_ANDROID_CLIENT_ID;

    GoogleSignin.configure({
      webClientId: webClientId,
      offlineAccess: true,
      scopes: ['openid', 'email', 'profile'],
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

      // Gọi API backend để authenticate
      const request: MobileOutboundAuthenticateRequest = {
        idToken,
        platform: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
      };

      const response = await apiClient.post<AuthenticationResponse>(
        API_ENDPOINTS.AUTH.MOBILE_LOGIN,
        request,
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

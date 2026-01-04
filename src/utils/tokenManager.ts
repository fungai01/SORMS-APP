import AsyncStorage from '@react-native-async-storage/async-storage';
import {APP_CONSTANTS} from '../config/constants';
import {AccountInfo} from '../types/auth';

/**
 * Token Manager - Quản lý lưu trữ và đọc tokens
 */
class TokenManager {
  private static instance: TokenManager;

  private constructor() {}

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  /**
   * Lưu access token
   */
  async saveAccessToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(
        APP_CONSTANTS.STORAGE_KEYS.ACCESS_TOKEN,
        token,
      );
    } catch (error) {
      console.error('Error saving access token:', error);
      throw error;
    }
  }

  /**
   * Lưu refresh token
   */
  async saveRefreshToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(
        APP_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN,
        token,
      );
    } catch (error) {
      console.error('Error saving refresh token:', error);
      throw error;
    }
  }

  /**
   * Lưu user info
   */
  async saveUserInfo(userInfo: AccountInfo): Promise<void> {
    try {
      await AsyncStorage.setItem(
        APP_CONSTANTS.STORAGE_KEYS.USER_INFO,
        JSON.stringify(userInfo),
      );
    } catch (error) {
      console.error('Error saving user info:', error);
      throw error;
    }
  }

  /**
   * Lấy access token
   */
  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(
        APP_CONSTANTS.STORAGE_KEYS.ACCESS_TOKEN,
      );
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  /**
   * Lấy refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(
        APP_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN,
      );
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  /**
   * Lấy user info
   */
  async getUserInfo(): Promise<AccountInfo | null> {
    try {
      const userInfoString = await AsyncStorage.getItem(
        APP_CONSTANTS.STORAGE_KEYS.USER_INFO,
      );
      if (userInfoString) {
        return JSON.parse(userInfoString) as AccountInfo;
      }
      return null;
    } catch (error) {
      console.error('Error getting user info:', error);
      return null;
    }
  }

  /**
   * Xóa tất cả tokens và user info
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        APP_CONSTANTS.STORAGE_KEYS.ACCESS_TOKEN,
        APP_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN,
        APP_CONSTANTS.STORAGE_KEYS.USER_INFO,
      ]);
    } catch (error) {
      console.error('Error clearing tokens:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra xem có token hay không
   */
  async hasValidToken(): Promise<boolean> {
    const token = await this.getAccessToken();
    return token !== null && token.length > 0;
  }
}

export default TokenManager.getInstance();

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {AuthState} from '../types/auth';
import authService from '../services/authService';
import tokenManager from '../utils/tokenManager';
import {getUserRole, AppRole} from '../utils/roleUtils';

// Avoid name collision with AuthState.refreshToken (string|null)
interface AuthContextType {
  // state
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthState['user'];
  accessToken: string | null;
  refreshToken: string | null;

  // actions
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;

  // derived
  userRole: AppRole;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    accessToken: null,
    refreshToken: null,
  });

  // Get user role from user roles
  const userRole: AppRole = getUserRole(authState.user?.roles);

  const initializeAuth = async () => {
    try {
      // Khởi tạo Google Sign-In
      await authService.initializeGoogleSignIn();

      // Kiểm tra session hiện tại
      const hasSession = await authService.checkSession();
      if (hasSession) {
        const userInfo = await tokenManager.getUserInfo();
        const accessToken = await tokenManager.getAccessToken();
        const refreshToken = await tokenManager.getRefreshToken();

        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: userInfo,
          accessToken,
          refreshToken,
        });
      } else {
        setAuthState(prev => ({...prev, isLoading: false}));
      }
    } catch (error) {
      console.error('Initialize auth error:', error);
      setAuthState(prev => ({...prev, isLoading: false}));
    }
  };

  // Khởi tạo và kiểm tra session khi app start
  useEffect(() => {
    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async () => {
    try {
      setAuthState(prev => ({...prev, isLoading: true}));
      const authData = await authService.loginWithGoogle();

      if (authData.authenticated && authData.accountInfo) {
        const accessToken = await tokenManager.getAccessToken();
        const refreshToken = await tokenManager.getRefreshToken();

        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: authData.accountInfo,
          accessToken,
          refreshToken,
        });
      } else {
        throw new Error('Đăng nhập thất bại');
      }
    } catch (error: any) {
      setAuthState(prev => ({...prev, isLoading: false}));
      throw error;
    }
  };

  const logout = async () => {
    try {
      setAuthState(prev => ({...prev, isLoading: true}));
      await authService.logout();
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        accessToken: null,
        refreshToken: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Vẫn reset state dù có lỗi
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        accessToken: null,
        refreshToken: null,
      });
    }
  };

  const refreshAccessToken = async () => {
    try {
      const authData = await authService.refreshToken();
      if (authData.token) {
        const accessToken = await tokenManager.getAccessToken();
        const newRefreshToken = await tokenManager.getRefreshToken();

        setAuthState(prev => ({
          ...prev,
          accessToken,
          refreshToken: newRefreshToken,
        }));
      }
    } catch (error) {
      console.error('Refresh token error:', error);
      // Nếu refresh fail, logout user
      await logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        refreshAccessToken,
        userRole,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

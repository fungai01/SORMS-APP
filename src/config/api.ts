/**
 * API Configuration
 */
// API Configuration
// Note: For React Native, use react-native-config or hardcode values
// In production, use environment-specific config files
const getApiBaseUrl = (): string => {
  // You can use react-native-config here or hardcode
  // For now, using default backend URL
  return 'http://103.81.87.99:5656/api';
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: 30000,
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000,
  },
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/outbound/authentication',
    MOBILE_LOGIN: '/auth/mobile/outbound/authentication',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    OAUTH_REDIRECT_URL: '/auth/oauth2/google/redirect-url',
    INTROSPECT: '/auth/introspect',
  },
};

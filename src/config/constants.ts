/**
 * App Constants
 */
// App Constants
// Note: For React Native, configure these values in your app
// You can use react-native-config or hardcode values here
export const APP_CONSTANTS = {
  // Google OAuth
  GOOGLE_WEB_CLIENT_ID:
    '284260188230-61kromthtekhru3cmv3uj05nfa3c5g8p.apps.googleusercontent.com',
  GOOGLE_ANDROID_CLIENT_ID:
    '284260188230-uv04d0hibrjqrjikhp4elo8d58qorves.apps.googleusercontent.com',
  GOOGLE_IOS_CLIENT_ID: '', // Set your iOS client ID here
  OAUTH_REDIRECT_URI: 'com.sorms.app:/oauth2redirect',
  OAUTH_SCOPE: 'openid email profile',

  // Storage Keys
  STORAGE_KEYS: {
    ACCESS_TOKEN: '@sorms:access_token',
    REFRESH_TOKEN: '@sorms:refresh_token',
    USER_INFO: '@sorms:user_info',
  },
};

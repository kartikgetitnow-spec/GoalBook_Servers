export const APP_CONFIG = {
  appName: 'GoalBook',
  version: '1.0.0',
  api: {
    // Standard local development URLs for GoalBook microservers
    userServerUrl: process.env.EXPO_PUBLIC_USER_API_URL || 'http://localhost:5000/api',
    aiServerUrl: process.env.EXPO_PUBLIC_AI_API_URL || 'http://localhost:8000',
    timeoutMs: 15000,
  },
  ai: {
    openaiApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
    defaultModel: 'gpt-4o-mini',
  },
  reader: {
    defaultFontSize: 18,
    minFontSize: 12,
    maxFontSize: 32,
    defaultReadingSpeedWpm: 250,
    minReadingSpeedWpm: 100,
    maxReadingSpeedWpm: 600,
    defaultSpeechPitch: 1.0,
    defaultSpeechRate: 1.0,
  },
  storageKeys: {
    authToken: 'goalbook_auth_token',
    refreshToken: 'goalbook_refresh_token',
    userProfile: 'goalbook_user_profile',
    rememberMe: 'goalbook_remember_me',
    savedEmail: 'goalbook_saved_email',
    biometricEnabled: 'goalbook_biometric_enabled',
    tokenExpiry: 'goalbook_token_expiry',
    themePreference: 'goalbook_theme_preference',
    readerSettings: 'goalbook_reader_settings',
    cachedBooks: 'goalbook_cached_books',
  },
  monitoring: {
    sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
    environment: process.env.EXPO_PUBLIC_ENV || (typeof __DEV__ !== 'undefined' && __DEV__ ? 'development' : 'production'),
    enableSentry: process.env.EXPO_PUBLIC_ENABLE_SENTRY === 'true',
    tracesSampleRate: 1.0,
    vercelAnalyticsId: process.env.EXPO_PUBLIC_VERCEL_ANALYTICS_ID || '',
  },
};

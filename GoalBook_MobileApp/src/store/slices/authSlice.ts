import { StateCreator } from 'zustand';
import { User } from '../../types/models';
import { secureStorage } from '../../services/storage/secureStorage';
import { APP_CONFIG } from '../../constants/config';
import { biometricService } from '../../services/biometrics/biometricService';
import { registerUnauthorizedHandler } from '../../services/api/client';

export interface AuthSlice {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  rememberMe: boolean;
  savedEmail: string;
  isBiometricEnabled: boolean;

  setUser: (user: User | null) => void;
  setAuthToken: (token: string) => Promise<void>;
  setSession: (params: {
    user: User;
    token: string;
    refreshToken?: string;
    expiresInSeconds?: number;
  }) => Promise<void>;
  setRememberMe: (remember: boolean, email?: string) => Promise<void>;
  setBiometricEnabled: (enabled: boolean) => Promise<void>;
  restoreSession: () => Promise<boolean>;
  logout: () => Promise<void>;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set, get) => {
  // Listen to 401 Unauthorized from API client to automatically log out on token expiry
  registerUnauthorizedHandler(() => {
    console.log('[AuthSlice] Auto-logging out due to token expiry/unauthorized error');
    set({
      user: null,
      token: null,
      refreshToken: null,
      tokenExpiry: null,
      isAuthenticated: false,
    });
  });

  return {
    user: null,
    token: null,
    refreshToken: null,
    tokenExpiry: null,
    isAuthenticated: false,
    isLoadingAuth: false,
    rememberMe: false,
    savedEmail: '',
    isBiometricEnabled: false,

    setUser: (user) => {
      set({ user, isAuthenticated: !!user });
      if (user) {
        secureStorage.setItem(APP_CONFIG.storageKeys.userProfile, JSON.stringify(user));
      } else {
        secureStorage.deleteItem(APP_CONFIG.storageKeys.userProfile);
      }
    },

    setAuthToken: async (token: string) => {
      await secureStorage.setItem(APP_CONFIG.storageKeys.authToken, token);
      set({ token });
    },

    setSession: async ({ user, token, refreshToken, expiresInSeconds }) => {
      const now = Date.now();
      // Default token lifetime: 7 days if not provided
      const expiry = now + (expiresInSeconds ? expiresInSeconds * 1000 : 7 * 24 * 60 * 60 * 1000);

      await Promise.all([
        secureStorage.setItem(APP_CONFIG.storageKeys.authToken, token),
        secureStorage.setItem(APP_CONFIG.storageKeys.userProfile, JSON.stringify(user)),
        secureStorage.setItem(APP_CONFIG.storageKeys.tokenExpiry, String(expiry)),
        refreshToken
          ? secureStorage.setItem(APP_CONFIG.storageKeys.refreshToken, refreshToken)
          : Promise.resolve(),
      ]);

      const isBiometric = get().isBiometricEnabled;
      if (isBiometric) {
        await biometricService.saveBiometricCredential(user.email, token);
      }

      set({
        user,
        token,
        refreshToken: refreshToken || null,
        tokenExpiry: expiry,
        isAuthenticated: true,
      });
    },

    setRememberMe: async (remember: boolean, email?: string) => {
      await secureStorage.setItem(APP_CONFIG.storageKeys.rememberMe, remember ? 'true' : 'false');
      const savedEmail = remember && email ? email.trim() : '';
      if (savedEmail) {
        await secureStorage.setItem(APP_CONFIG.storageKeys.savedEmail, savedEmail);
      } else if (!remember) {
        await secureStorage.deleteItem(APP_CONFIG.storageKeys.savedEmail);
      }
      set({ rememberMe: remember, savedEmail });
    },

    setBiometricEnabled: async (enabled: boolean) => {
      await biometricService.setBiometricEnabled(enabled);
      const currentUser = get().user;
      const currentToken = get().token;
      if (enabled && currentUser && currentToken) {
        await biometricService.saveBiometricCredential(currentUser.email, currentToken);
      }
      set({ isBiometricEnabled: enabled });
    },

    restoreSession: async () => {
      try {
        set({ isLoadingAuth: true });

        // Load rememberMe and savedEmail
        const [rememberMeRaw, savedEmail, biometricRaw] = await Promise.all([
          secureStorage.getItem(APP_CONFIG.storageKeys.rememberMe),
          secureStorage.getItem(APP_CONFIG.storageKeys.savedEmail),
          secureStorage.getItem(APP_CONFIG.storageKeys.biometricEnabled),
        ]);

        const rememberMe = rememberMeRaw === 'true';
        const isBiometricEnabled = biometricRaw === 'true';

        // Load token, user profile, and expiry
        const [token, userProfileRaw, expiryRaw, refreshToken] = await Promise.all([
          secureStorage.getItem(APP_CONFIG.storageKeys.authToken),
          secureStorage.getItem(APP_CONFIG.storageKeys.userProfile),
          secureStorage.getItem(APP_CONFIG.storageKeys.tokenExpiry),
          secureStorage.getItem(APP_CONFIG.storageKeys.refreshToken),
        ]);

        let user: User | null = null;
        let tokenExpiry: number | null = expiryRaw ? parseInt(expiryRaw, 10) : null;

        if (userProfileRaw) {
          try {
            user = JSON.parse(userProfileRaw);
          } catch {
            user = null;
          }
        }

        // Check token expiration
        const isExpired = tokenExpiry ? Date.now() > tokenExpiry : false;

        if (token && user && !isExpired) {
          set({
            user,
            token,
            refreshToken,
            tokenExpiry,
            isAuthenticated: true,
            rememberMe,
            savedEmail: savedEmail || '',
            isBiometricEnabled,
            isLoadingAuth: false,
          });
          return true;
        }

        if (isExpired) {
          console.log('[AuthSlice] Stored token expired, clearing session');
          await secureStorage.deleteItem(APP_CONFIG.storageKeys.authToken);
          await secureStorage.deleteItem(APP_CONFIG.storageKeys.userProfile);
          await secureStorage.deleteItem(APP_CONFIG.storageKeys.tokenExpiry);
        }

        set({
          user: null,
          token: null,
          refreshToken: null,
          tokenExpiry: null,
          isAuthenticated: false,
          rememberMe,
          savedEmail: savedEmail || '',
          isBiometricEnabled,
          isLoadingAuth: false,
        });
        return false;
      } catch (error) {
        console.warn('[AuthSlice] Error restoring session:', error);
        set({ isLoadingAuth: false });
        return false;
      }
    },

    logout: async () => {
      try {
        await Promise.all([
          secureStorage.deleteItem(APP_CONFIG.storageKeys.authToken),
          secureStorage.deleteItem(APP_CONFIG.storageKeys.refreshToken),
          secureStorage.deleteItem(APP_CONFIG.storageKeys.userProfile),
          secureStorage.deleteItem(APP_CONFIG.storageKeys.tokenExpiry),
          biometricService.clearCredentials(),
        ]);
      } catch (e) {
        console.warn('[AuthSlice] Error during logout:', e);
      } finally {
        set({
          user: null,
          token: null,
          refreshToken: null,
          tokenExpiry: null,
          isAuthenticated: false,
        });
      }
    },
  };
};

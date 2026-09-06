import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../store';
import { authApi } from '../services/api/auth';
import {
  biometricService,
  BiometricStatus,
} from '../services/biometrics/biometricService';
import {
  LoginPayload,
  RegisterPayload,
  SocialLoginPayload,
  ResetPasswordPayload,
} from '../types/api';

export const useAuth = () => {
  const user = useAppStore((state) => state.user);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const isLoadingAuth = useAppStore((state) => state.isLoadingAuth);
  const rememberMe = useAppStore((state) => state.rememberMe);
  const savedEmail = useAppStore((state) => state.savedEmail);
  const isBiometricEnabled = useAppStore((state) => state.isBiometricEnabled);

  const setSession = useAppStore((state) => state.setSession);
  const setRememberMeStore = useAppStore((state) => state.setRememberMe);
  const setBiometricEnabledStore = useAppStore((state) => state.setBiometricEnabled);
  const restoreSession = useAppStore((state) => state.restoreSession);
  const storeLogout = useAppStore((state) => state.logout);

  const [biometricStatus, setBiometricStatus] = useState<BiometricStatus>({
    hasHardware: false,
    isEnrolled: false,
    biometricType: 'none',
    biometricName: 'Biometrics',
    isEnabled: false,
  });

  const [actionLoading, setActionLoading] = useState(false);

  // Load device biometric capabilities
  const refreshBiometrics = useCallback(async () => {
    try {
      const status = await biometricService.getStatus();
      setBiometricStatus(status);
    } catch (e) {
      console.warn('[useAuth] Error getting biometric status:', e);
    }
  }, []);

  useEffect(() => {
    refreshBiometrics();
  }, [refreshBiometrics, isBiometricEnabled]);

  /**
   * Log in with Email and Password
   */
  const login = useCallback(
    async (
      payload: LoginPayload,
      remember: boolean = false
    ): Promise<{ success: boolean; error?: string }> => {
      setActionLoading(true);
      try {
        const response = await authApi.login(payload);
        await setSession({
          user: response.user,
          token: response.token,
          refreshToken: response.refreshToken,
        });

        await setRememberMeStore(remember, remember ? payload.email : '');
        await refreshBiometrics();

        return { success: true };
      } catch (error: any) {
        const message =
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.message ||
          'Failed to sign in. Please check your credentials.';
        return { success: false, error: message };
      } finally {
        setActionLoading(false);
      }
    },
    [setSession, setRememberMeStore, refreshBiometrics]
  );

  /**
   * Register a new user account and auto-login
   */
  const register = useCallback(
    async (
      payload: RegisterPayload
    ): Promise<{ success: boolean; error?: string }> => {
      setActionLoading(true);
      try {
        const response = await authApi.register(payload);
        // Auto-login after successful registration
        await setSession({
          user: response.user,
          token: response.token,
          refreshToken: response.refreshToken,
        });

        return { success: true };
      } catch (error: any) {
        const message =
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.message ||
          'Failed to create account. Please try again.';
        return { success: false, error: message };
      } finally {
        setActionLoading(false);
      }
    },
    [setSession]
  );

  /**
   * Social Login (Google / Apple)
   */
  const socialLogin = useCallback(
    async (
      provider: 'google' | 'apple',
      optionalInfo?: { idToken?: string; email?: string; name?: string }
    ): Promise<{ success: boolean; error?: string }> => {
      setActionLoading(true);
      try {
        const payload: SocialLoginPayload = {
          provider,
          idToken: optionalInfo?.idToken,
          email: optionalInfo?.email,
          name: optionalInfo?.name,
        };

        const response = await authApi.socialLogin(payload);
        await setSession({
          user: response.user,
          token: response.token,
          refreshToken: response.refreshToken,
        });

        return { success: true };
      } catch (error: any) {
        const message =
          error?.response?.data?.error ||
          error?.message ||
          `Failed to sign in with ${provider === 'google' ? 'Google' : 'Apple'}.`;
        return { success: false, error: message };
      } finally {
        setActionLoading(false);
      }
    },
    [setSession]
  );

  /**
   * Biometric Login with Face ID / Touch ID / Fingerprint
   */
  const biometricLogin = useCallback(async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    setActionLoading(true);
    try {
      const authResult = await biometricService.authenticate('Unlock GoalBook');
      if (!authResult.success) {
        return { success: false, error: authResult.error };
      }

      // Check for saved biometric credentials
      const cred = await biometricService.getSavedBiometricCredential();
      if (cred && cred.token) {
        // Authenticated with stored token
        const email = cred.email;
        const username = email.split('@')[0] || 'GoalBook User';
        const name = username.charAt(0).toUpperCase() + username.slice(1);

        await setSession({
          user: {
            id: 'biometric_user',
            email,
            name,
            createdAt: new Date().toISOString(),
          },
          token: cred.token,
        });
        return { success: true };
      }

      // If no stored biometric token, require standard login
      return {
        success: false,
        error: 'No saved credentials found for biometric login. Please sign in with email and password first.',
      };
    } catch (error: any) {
      return { success: false, error: error?.message || 'Biometric authentication failed.' };
    } finally {
      setActionLoading(false);
    }
  }, [savedEmail, setSession]);

  /**
   * Toggle biometric authentication setting
   */
  const enableBiometric = useCallback(
    async (enabled: boolean): Promise<boolean> => {
      try {
        if (enabled) {
          const auth = await biometricService.authenticate('Enable biometric login for GoalBook');
          if (!auth.success) return false;
        }
        await setBiometricEnabledStore(enabled);
        await refreshBiometrics();
        return true;
      } catch (e) {
        console.warn('[useAuth] Error enabling biometric:', e);
        return false;
      }
    },
    [setBiometricEnabledStore, refreshBiometrics]
  );

  /**
   * Forgot Password - Send OTP
   */
  const forgotPassword = useCallback(
    async (
      email: string
    ): Promise<{ success: boolean; message: string; demoOtp?: string; error?: string }> => {
      setActionLoading(true);
      try {
        const res = await authApi.forgotPassword(email);
        return {
          success: true,
          message: res.message,
          demoOtp: res.demoOtp,
        };
      } catch (error: any) {
        return {
          success: false,
          message: '',
          error: error?.message || 'Failed to send password reset code.',
        };
      } finally {
        setActionLoading(false);
      }
    },
    []
  );

  /**
   * Verify OTP Code
   */
  const verifyOtp = useCallback(
    async (
      email: string,
      otp: string
    ): Promise<{ success: boolean; message?: string; resetToken?: string; error?: string }> => {
      setActionLoading(true);
      try {
        const res = await authApi.verifyOtp({ email, otp });
        if (res.valid) {
          return { success: true, message: res.message, resetToken: res.resetToken };
        }
        return { success: false, error: res.message || 'Invalid verification code.' };
      } catch (error: any) {
        return { success: false, error: error?.message || 'Verification failed.' };
      } finally {
        setActionLoading(false);
      }
    },
    []
  );

  /**
   * Reset Password with OTP
   */
  const resetPassword = useCallback(
    async (
      payload: ResetPasswordPayload
    ): Promise<{ success: boolean; message?: string; error?: string }> => {
      setActionLoading(true);
      try {
        const res = await authApi.resetPassword(payload);
        return { success: res.success, message: res.message };
      } catch (error: any) {
        return { success: false, error: error?.message || 'Failed to update password.' };
      } finally {
        setActionLoading(false);
      }
    },
    []
  );

  /**
   * Set Remember Me preference
   */
  const setRememberMe = useCallback(
    async (remember: boolean, email?: string) => {
      await setRememberMeStore(remember, email);
    },
    [setRememberMeStore]
  );

  /**
   * Logout current session
   */
  const logout = useCallback(async () => {
    setActionLoading(true);
    try {
      await storeLogout();
    } finally {
      setActionLoading(false);
    }
  }, [storeLogout]);

  /**
   * Check session on launch
   */
  const checkAuthSession = useCallback(async () => {
    return await restoreSession();
  }, [restoreSession]);

  return {
    user,
    isAuthenticated,
    isLoading: isLoadingAuth || actionLoading,
    rememberMe,
    savedEmail,
    biometricStatus,
    isBiometricEnabled,
    login,
    register,
    socialLogin,
    biometricLogin,
    enableBiometric,
    forgotPassword,
    verifyOtp,
    resetPassword,
    setRememberMe,
    logout,
    checkAuthSession,
    refreshBiometrics,
  };
};

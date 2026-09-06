import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import { secureStorage } from '../storage/secureStorage';
import { APP_CONFIG } from '../../constants/config';

export type BiometricType = 'face' | 'fingerprint' | 'iris' | 'none';

export interface BiometricStatus {
  hasHardware: boolean;
  isEnrolled: boolean;
  biometricType: BiometricType;
  biometricName: string;
  isEnabled: boolean;
}

class BiometricService {
  private static BIOMETRIC_CRED_KEY = 'goalbook_biometric_user_credential';

  /**
   * Determine available biometric hardware, enrollment, and user preference
   */
  async getStatus(): Promise<BiometricStatus> {
    try {
      if (Platform.OS === 'web') {
        return {
          hasHardware: false,
          isEnrolled: false,
          biometricType: 'none',
          biometricName: 'Biometrics',
          isEnabled: false,
        };
      }

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        return {
          hasHardware: false,
          isEnrolled: false,
          biometricType: 'none',
          biometricName: 'Biometrics',
          isEnabled: false,
        };
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      let biometricType: BiometricType = 'none';
      let biometricName = 'Biometrics';

      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        biometricType = 'face';
        biometricName = Platform.OS === 'ios' ? 'Face ID' : 'Face Unlock';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        biometricType = 'fingerprint';
        biometricName = Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        biometricType = 'iris';
        biometricName = 'Iris Scan';
      } else if (hasHardware && isEnrolled) {
        biometricType = 'fingerprint';
        biometricName = 'Biometrics';
      }

      const isEnabledRaw = await secureStorage.getItem(APP_CONFIG.storageKeys.biometricEnabled);
      const isEnabled = isEnabledRaw === 'true';

      return {
        hasHardware,
        isEnrolled,
        biometricType,
        biometricName,
        isEnabled: isEnabled && isEnrolled,
      };
    } catch (error) {
      console.warn('[BiometricService] Error checking status:', error);
      return {
        hasHardware: false,
        isEnrolled: false,
        biometricType: 'none',
        biometricName: 'Biometrics',
        isEnabled: false,
      };
    }
  }

  /**
   * Prompt the user for biometric authentication with OS fallback to PIN/password
   */
  async authenticate(promptMessage: string = 'Log in to GoalBook'): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      if (Platform.OS === 'web') {
        return { success: false, error: 'Biometrics not supported on Web' };
      }

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        return { success: false, error: 'No biometric hardware detected on this device.' };
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        return { success: false, error: 'No biometrics enrolled. Set up Face ID or fingerprint in settings.' };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use Passcode',
        disableDeviceFallback: false, // Fallback to PIN/pattern/passcode
      });

      if (result.success) {
        return { success: true };
      }

      // Handle specific errors
      let errorMessage = 'Authentication failed. Please try again or use your password.';
      if (result.error === 'user_cancel' || result.error === 'app_cancel') {
        errorMessage = 'Authentication was cancelled.';
      } else if (result.error === 'lockout') {
        errorMessage = 'Too many attempts. Biometrics locked temporarily.';
      } else if (result.error === 'not_enrolled') {
        errorMessage = 'Biometrics not enrolled on device.';
      } else if (result.error === 'user_fallback') {
        errorMessage = 'Switched to fallback passcode.';
      }

      return { success: false, error: errorMessage };
    } catch (error: any) {
      return { success: false, error: error?.message || 'Biometric authentication error.' };
    }
  }

  /**
   * Store user session info for 1-tap biometric login
   */
  async saveBiometricCredential(email: string, token: string): Promise<void> {
    try {
      const data = JSON.stringify({ email, token, updatedAt: Date.now() });
      await secureStorage.setItem(BiometricService.BIOMETRIC_CRED_KEY, data);
      await secureStorage.setItem(APP_CONFIG.storageKeys.biometricEnabled, 'true');
    } catch (e) {
      console.warn('[BiometricService] Error saving biometric credential:', e);
    }
  }

  /**
   * Get saved biometric credential
   */
  async getSavedBiometricCredential(): Promise<{ email: string; token: string } | null> {
    try {
      const raw = await secureStorage.getItem(BiometricService.BIOMETRIC_CRED_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  /**
   * Set user biometric preference (enabled/disabled)
   */
  async setBiometricEnabled(enabled: boolean): Promise<void> {
    try {
      await secureStorage.setItem(APP_CONFIG.storageKeys.biometricEnabled, enabled ? 'true' : 'false');
      if (!enabled) {
        await secureStorage.deleteItem(BiometricService.BIOMETRIC_CRED_KEY);
      }
    } catch (e) {
      console.warn('[BiometricService] Error updating biometric preference:', e);
    }
  }

  /**
   * Clear biometric credentials upon user logout or account deletion
   */
  async clearCredentials(): Promise<void> {
    try {
      await secureStorage.deleteItem(BiometricService.BIOMETRIC_CRED_KEY);
    } catch (e) {
      console.warn('[BiometricService] Error clearing credentials:', e);
    }
  }
}

export const biometricService = new BiometricService();

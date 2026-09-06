import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AuthNavigationProp } from '../../navigation/types';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { colors, spacing, borderRadius } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/common/Toast';
import { Ionicons } from '@expo/vector-icons';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<AuthNavigationProp>();
  const {
    login,
    socialLogin,
    biometricLogin,
    biometricStatus,
    savedEmail,
    rememberMe: initialRememberMe,
  } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);
  const [biometricAuthLoading, setBiometricAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  // Animations
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const logoFloat = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(24)).current;
  const errorShake = useRef(new Animated.Value(0)).current;

  // Initialize saved email and remember preference
  useEffect(() => {
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    } else {
      setRememberMe(initialRememberMe);
    }
  }, [savedEmail, initialRememberMe]);

  // Entrance animations
  useEffect(() => {
    // Logo entrance
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(formTranslateY, {
        toValue: 0,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle gentle floating effect for branding badge
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, {
          toValue: -4,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(logoFloat, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [logoScale, formOpacity, formTranslateY, logoFloat]);

  const triggerErrorShake = () => {
    errorShake.setValue(0);
    Animated.sequence([
      Animated.timing(errorShake, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(errorShake, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(errorShake, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(errorShake, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(errorShake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      errors.email = 'Email address is required';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    setError(null);
    if (!validateForm()) {
      triggerErrorShake();
      return;
    }

    setLoading(true);
    try {
      const result = await login({ email: email.trim(), password }, rememberMe);
      if (!result.success) {
        setError(result.error || 'Invalid email or password');
        triggerErrorShake();
        showToast(result.error || 'Sign in failed', 'error');
      } else {
        showToast('Welcome back to GoalBook!', 'success');
      }
    } catch (err: any) {
      const msg = err?.message || 'Login failed. Please try again.';
      setError(msg);
      triggerErrorShake();
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setError(null);
    setSocialLoading(provider);
    try {
      const result = await socialLogin(provider);
      if (!result.success) {
        setError(result.error || `Could not sign in with ${provider}`);
        showToast(result.error || 'Sign in failed', 'error');
      } else {
        showToast(`Signed in with ${provider === 'google' ? 'Google' : 'Apple'}!`, 'success');
      }
    } catch (err: any) {
      setError(err?.message || 'Social sign-in failed');
      showToast('Social sign-in failed', 'error');
    } finally {
      setSocialLoading(null);
    }
  };

  const handleBiometricLogin = async () => {
    setError(null);
    setBiometricAuthLoading(true);
    try {
      const result = await biometricLogin();
      if (!result.success) {
        if (result.error && !result.error.includes('cancelled')) {
          setError(result.error);
          showToast(result.error, 'warning');
        }
      } else {
        showToast('Biometric authentication verified!', 'success');
      }
    } catch (err: any) {
      setError(err?.message || 'Biometric authentication failed');
    } finally {
      setBiometricAuthLoading(false);
    }
  };

  const biometricIconName =
    biometricStatus.biometricType === 'face'
      ? 'scan-outline'
      : biometricStatus.biometricType === 'iris'
      ? 'eye-outline'
      : 'finger-print-outline';

  const canUseBiometrics = biometricStatus.hasHardware && biometricStatus.isEnrolled;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Animated Branding Header */}
          <View style={styles.header}>
            <Animated.View
              style={[
                styles.logoOuter,
                {
                  transform: [{ scale: logoScale }, { translateY: logoFloat }],
                },
              ]}
            >
              <View style={styles.logoInner}>
                <Ionicons name="book" size={38} color="#3B82F6" />
              </View>
              <View style={styles.sparkleBadge}>
                <Ionicons name="sparkles" size={14} color="#F59E0B" />
              </View>
            </Animated.View>

            <Text style={styles.brandTitle}>GoalBook</Text>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to continue reading with AI-powered insights
            </Text>
          </View>

          {/* Form Content */}
          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: formOpacity,
                transform: [{ translateY: formTranslateY }],
              },
            ]}
          >
            {/* Error Banner with shake animation */}
            {error && (
              <Animated.View
                style={[
                  styles.errorBanner,
                  {
                    transform: [{ translateX: errorShake }],
                  },
                ]}
              >
                <Ionicons name="alert-circle" size={20} color={colors.dark.error} />
                <Text style={styles.errorBannerText}>{error}</Text>
                <TouchableOpacity onPress={() => setError(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close" size={18} color={colors.dark.error} />
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Email Field */}
            <Input
              label="Email Address"
              placeholder="you@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }}
              error={fieldErrors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon={<Ionicons name="mail-outline" size={20} color={colors.dark.textMuted} />}
            />

            {/* Password Field */}
            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }}
              error={fieldErrors.password}
              isPassword
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.dark.textMuted} />}
            />

            {/* Remember Me & Forgot Password Row */}
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.rememberMeContainer}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.8}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: rememberMe }}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                  {rememberMe && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                </View>
                <Text style={styles.rememberMeText}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
                style={styles.forgotPassButton}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotPassText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Primary Action */}
            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              size="lg"
              style={styles.signInButton}
            />

            {/* Biometric One-Tap Login Button (if device supports) */}
            {canUseBiometrics && (
              <TouchableOpacity
                style={styles.biometricButton}
                onPress={handleBiometricLogin}
                disabled={biometricAuthLoading || loading}
                activeOpacity={0.8}
              >
                {biometricAuthLoading ? (
                  <ActivityIndicator size="small" color="#3B82F6" />
                ) : (
                  <>
                    <Ionicons name={biometricIconName} size={22} color="#3B82F6" />
                    <Text style={styles.biometricButtonText}>
                      Sign in with {biometricStatus.biometricName}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Logins */}
            <View style={styles.socialButtonsContainer}>
              {/* Google Button */}
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialLogin('google')}
                disabled={!!socialLoading || loading}
                activeOpacity={0.8}
              >
                {socialLoading === 'google' ? (
                  <ActivityIndicator size="small" color={colors.dark.text} />
                ) : (
                  <>
                    <Ionicons name="logo-google" size={18} color="#EA4335" style={styles.socialIcon} />
                    <Text style={styles.socialButtonText}>Google</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Apple Button */}
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialLogin('apple')}
                disabled={!!socialLoading || loading}
                activeOpacity={0.8}
              >
                {socialLoading === 'apple' ? (
                  <ActivityIndicator size="small" color={colors.dark.text} />
                ) : (
                  <>
                    <Ionicons name="logo-apple" size={20} color="#FFFFFF" style={styles.socialIcon} />
                    <Text style={styles.socialButtonText}>Apple</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Footer: Register link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                activeOpacity={0.7}
                style={styles.signUpTouch}
              >
                <Text style={styles.signUpText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoOuter: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  logoInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#151D2F',
    borderWidth: 2,
    borderColor: '#243048',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  sparkleBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3B82F6',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
  formContainer: {
    width: '100%',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#F87171',
    lineHeight: 18,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#475569',
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  rememberMeText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
  },
  forgotPassButton: {
    paddingVertical: 4,
  },
  forgotPassText: {
    color: '#3B82F6',
    fontSize: 13,
    fontWeight: '600',
  },
  signInButton: {
    backgroundColor: '#2563EB',
    marginBottom: spacing.md,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(59, 130, 246, 0.4)',
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  biometricButtonText: {
    color: '#60A5FA',
    fontSize: 14,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#243048',
  },
  dividerText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: borderRadius.md,
    backgroundColor: '#151D2F',
    borderWidth: 1,
    borderColor: '#243048',
    gap: 8,
  },
  socialIcon: {
    marginRight: 2,
  },
  socialButtonText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xs,
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  signUpTouch: {
    marginLeft: 6,
    paddingVertical: 2,
  },
  signUpText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '700',
  },
});

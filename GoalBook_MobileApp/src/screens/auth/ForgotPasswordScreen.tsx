import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Animated,
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
const OTP_RESEND_SECONDS = 60;

type RecoveryStep = 'email' | 'otp' | 'newPassword' | 'success';

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<AuthNavigationProp>();
  const { forgotPassword, verifyOtp, resetPassword } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState<RecoveryStep>('email');
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [demoOtpHint, setDemoOtpHint] = useState<string | null>(null);

  // References for OTP digit inputs
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Success animation
  const successScale = useRef(new Animated.Value(0.5)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  // Resend OTP countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  const maskEmail = (str: string) => {
    const parts = str.split('@');
    if (parts.length !== 2) return str;
    const name = parts[0];
    const maskedName = name.length <= 2 ? `${name[0]}***` : `${name.slice(0, 2)}***${name.slice(-1)}`;
    return `${maskedName}@${parts[1]}`;
  };

  /**
   * Step 1: Send OTP to Email
   */
  const handleSendOtp = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Please enter your email address');
      return;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await forgotPassword(trimmed);
      if (res.success) {
        setStep('otp');
        setResendTimer(OTP_RESEND_SECONDS);
        if (res.demoOtp) {
          setDemoOtpHint(res.demoOtp);
        }
        showToast('Verification code sent!', 'success');
        // Auto focus first OTP input
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 300);
      } else {
        setError(res.error || 'Failed to send verification code');
        showToast(res.error || 'Could not send code', 'error');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resend OTP
   */
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await forgotPassword(email.trim());
      if (res.success) {
        setResendTimer(OTP_RESEND_SECONDS);
        if (res.demoOtp) setDemoOtpHint(res.demoOtp);
        showToast('New code sent to your email', 'info');
      } else {
        setError(res.error || 'Failed to resend code');
      }
    } catch (e: any) {
      setError(e?.message || 'Error resending code');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle OTP text input with auto-advance and backspace
   */
  const handleOtpChange = (text: string, index: number) => {
    setError(null);
    // Handle paste of 6 digits
    if (text.length > 1) {
      const clean = text.replace(/[^0-9]/g, '').slice(0, 6);
      const newDigits = [...otpDigits];
      for (let i = 0; i < clean.length; i++) {
        newDigits[i] = clean[i];
      }
      setOtpDigits(newDigits);
      const nextIndex = Math.min(clean.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const val = text.replace(/[^0-9]/g, '');
    const updated = [...otpDigits];
    updated[index] = val;
    setOtpDigits(updated);

    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  /**
   * Step 2: Verify OTP
   */
  const handleVerifyOtp = async () => {
    const code = otpDigits.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits of the verification code');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await verifyOtp(email.trim(), code);
      if (res.success) {
        setStep('newPassword');
        showToast('Code verified successfully', 'success');
      } else {
        setError(res.error || 'Invalid code. Please try again.');
        showToast(res.error || 'Invalid code', 'error');
      }
    } catch (err: any) {
      setError(err?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 3: Reset Password
   */
  const handleResetPassword = async () => {
    if (!newPassword) {
      setError('Please enter a new password');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await resetPassword({
        email: email.trim(),
        otp: otpDigits.join(''),
        newPassword,
      });

      if (res.success) {
        setStep('success');
        Animated.parallel([
          Animated.spring(successScale, {
            toValue: 1,
            friction: 6,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.timing(successOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        setError(res.error || 'Failed to update password');
      }
    } catch (err: any) {
      setError(err?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

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
          {/* Top navigation row */}
          {step !== 'success' && (
            <View style={styles.topRow}>
              <TouchableOpacity
                onPress={() => {
                  if (step === 'newPassword') setStep('otp');
                  else if (step === 'otp') setStep('email');
                  else navigation.goBack();
                }}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
              </TouchableOpacity>
            </View>
          )}

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons
                name={
                  step === 'email'
                    ? 'key-outline'
                    : step === 'otp'
                    ? 'mail-open-outline'
                    : step === 'newPassword'
                    ? 'lock-open-outline'
                    : 'checkmark-circle-outline'
                }
                size={36}
                color="#3B82F6"
              />
            </View>

            <Text style={styles.title}>
              {step === 'email' && 'Forgot Password'}
              {step === 'otp' && 'Verify Code'}
              {step === 'newPassword' && 'New Password'}
              {step === 'success' && 'Password Reset!'}
            </Text>

            <Text style={styles.subtitle}>
              {step === 'email' &&
                'Enter your registered email address and we will send you a 6-digit recovery code.'}
              {step === 'otp' &&
                `We have sent a 6-digit verification code to ${maskEmail(email)}`}
              {step === 'newPassword' &&
                'Create a strong, new password for your GoalBook account.'}
              {step === 'success' &&
                'Your password has been successfully updated. You can now sign in with your new credentials.'}
            </Text>
          </View>

          {/* Error Banner */}
          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={20} color={colors.dark.error} />
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          {/* STEP 1: EMAIL */}
          {step === 'email' && (
            <View style={styles.formSection}>
              <Input
                label="Email Address"
                placeholder="you@example.com"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setError(null);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Ionicons name="mail-outline" size={20} color={colors.dark.textMuted} />}
              />

              <Button
                title="Send Recovery Code"
                onPress={handleSendOtp}
                loading={loading}
                size="lg"
                style={styles.actionButton}
              />

              <Button
                title="Back to Sign In"
                variant="ghost"
                onPress={() => navigation.navigate('Login')}
                style={styles.secondaryButton}
              />
            </View>
          )}

          {/* STEP 2: OTP VERIFICATION */}
          {step === 'otp' && (
            <View style={styles.formSection}>
              {/* 6 Digit Input Row */}
              <View style={styles.otpContainer}>
                {otpDigits.map((digit, idx) => (
                  <TextInput
                    key={idx}
                    ref={(ref) => {
                      inputRefs.current[idx] = ref;
                    }}
                    style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
                    value={digit}
                    onChangeText={(text) => handleOtpChange(text, idx)}
                    onKeyPress={(e) => handleOtpKeyPress(e, idx)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    autoFocus={idx === 0}
                  />
                ))}
              </View>

              {demoOtpHint && (
                <View style={styles.demoHintBox}>
                  <Ionicons name="information-circle-outline" size={16} color="#60A5FA" />
                  <Text style={styles.demoHintText}>Demo Code: {demoOtpHint}</Text>
                </View>
              )}

              {/* Resend Timer / Button */}
              <View style={styles.resendRow}>
                {resendTimer > 0 ? (
                  <Text style={styles.timerText}>
                    Resend code in <Text style={styles.timerHighlight}>{resendTimer}s</Text>
                  </Text>
                ) : (
                  <TouchableOpacity onPress={handleResendOtp} disabled={loading}>
                    <Text style={styles.resendLink}>Resend Code</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Button
                title="Verify Code"
                onPress={handleVerifyOtp}
                loading={loading}
                size="lg"
                style={styles.actionButton}
              />

              <Button
                title="Change Email"
                variant="ghost"
                onPress={() => setStep('email')}
                style={styles.secondaryButton}
              />
            </View>
          )}

          {/* STEP 3: NEW PASSWORD */}
          {step === 'newPassword' && (
            <View style={styles.formSection}>
              <Input
                label="New Password"
                placeholder="••••••••"
                value={newPassword}
                onChangeText={(t) => {
                  setNewPassword(t);
                  setError(null);
                }}
                isPassword
                leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.dark.textMuted} />}
              />

              <Input
                label="Confirm New Password"
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={(t) => {
                  setConfirmPassword(t);
                  setError(null);
                }}
                isPassword
                leftIcon={<Ionicons name="shield-checkmark-outline" size={20} color={colors.dark.textMuted} />}
              />

              <Button
                title="Update Password"
                onPress={handleResetPassword}
                loading={loading}
                size="lg"
                style={styles.actionButton}
              />
            </View>
          )}

          {/* STEP 4: SUCCESS CONFIRMATION */}
          {step === 'success' && (
            <Animated.View
              style={[
                styles.successBox,
                {
                  opacity: successOpacity,
                  transform: [{ scale: successScale }],
                },
              ]}
            >
              <View style={styles.successBadge}>
                <Ionicons name="checkmark-done" size={48} color="#10B981" />
              </View>
              <Text style={styles.successTitle}>All Set!</Text>
              <Text style={styles.successBody}>
                Your password has been changed successfully. You can now use your new password to sign in.
              </Text>
              <Button
                title="Back to Sign In"
                size="lg"
                onPress={() => navigation.navigate('Login')}
                style={styles.actionButton}
              />
            </Animated.View>
          )}
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
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    justifyContent: 'center',
  },
  topRow: {
    marginBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#151D2F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#151D2F',
    borderWidth: 2,
    borderColor: '#243048',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#F87171',
    lineHeight: 18,
  },
  formSection: {
    width: '100%',
  },
  actionButton: {
    backgroundColor: '#2563EB',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  secondaryButton: {
    marginTop: spacing.xs,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.lg,
  },
  otpBox: {
    width: 46,
    height: 56,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: '#243048',
    backgroundColor: '#151D2F',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  otpBoxFilled: {
    borderColor: '#3B82F6',
    backgroundColor: '#1E293B',
  },
  demoHintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: borderRadius.sm,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
    marginBottom: spacing.md,
  },
  demoHintText: {
    color: '#60A5FA',
    fontSize: 12,
    fontWeight: '600',
  },
  resendRow: {
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  timerText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  timerHighlight: {
    color: '#3B82F6',
    fontWeight: '700',
  },
  resendLink: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '700',
  },
  successBox: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  successBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 2,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 6,
  },
  successBody: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
    marginBottom: spacing.lg,
  },
});

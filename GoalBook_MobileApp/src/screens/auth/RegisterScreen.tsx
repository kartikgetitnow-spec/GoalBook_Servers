import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Modal,
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

interface PasswordCritique {
  hasMinLength: boolean;
  hasLower: boolean;
  hasUpper: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  score: number; // 0 to 5
}

const checkPasswordStrength = (pass: string): PasswordCritique => {
  const hasMinLength = pass.length >= 8;
  const hasLower = /[a-z]/.test(pass);
  const hasUpper = /[A-Z]/.test(pass);
  const hasNumber = /[0-9]/.test(pass);
  const hasSpecial = /[^A-Za-z0-9]/.test(pass);

  let score = 0;
  if (hasMinLength) score++;
  if (hasLower) score++;
  if (hasUpper) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;

  return { hasMinLength, hasLower, hasUpper, hasNumber, hasSpecial, score };
};

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<AuthNavigationProp>();
  const { register } = useAuth();
  const { showToast } = useToast();

  // Multi-step state: 1 = Details, 2 = Password, 3 = Terms & Preferences
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [readingGoal, setReadingGoal] = useState<'15' | '30' | '60'>('30');

  // Status & validation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  // Password analysis
  const passwordCritique = checkPasswordStrength(password);

  // Animations
  const stepSlide = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0.4)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  const animateStepTransition = (direction: 'next' | 'back') => {
    stepSlide.setValue(direction === 'next' ? 40 : -40);
    Animated.spring(stepSlide, {
      toValue: 0,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) {
      errors.name = 'Please enter your full name (at least 2 characters)';
    }
    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    setError(null);
    if (currentStep === 1) {
      if (!validateStep1()) return;
      setCurrentStep(2);
      animateStepTransition('next');
    } else if (currentStep === 2) {
      if (!validateStep2()) return;
      setCurrentStep(3);
      animateStepTransition('next');
    }
  };

  const handleBackStep = () => {
    setError(null);
    if (currentStep === 2) {
      setCurrentStep(1);
      animateStepTransition('back');
    } else if (currentStep === 3) {
      setCurrentStep(2);
      animateStepTransition('back');
    }
  };

  const handleFinalSubmit = async () => {
    if (!termsAccepted) {
      setError('Please accept the Terms of Service & Privacy Policy to continue');
      showToast('You must accept the terms to continue', 'warning');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (!result.success) {
        setError(result.error || 'Registration failed');
        showToast(result.error || 'Failed to create account', 'error');
        setLoading(false);
        return;
      }

      // Show celebration animation
      setIsSuccessModalVisible(true);
      Animated.parallel([
        Animated.spring(successScale, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-login after brief celebration
      setTimeout(() => {
        setIsSuccessModalVisible(false);
      }, 2200);
    } catch (err: any) {
      setError(err?.message || 'Failed to complete registration');
      setLoading(false);
    }
  };

  const getStrengthMeta = () => {
    const score = passwordCritique.score;
    if (score <= 1) return { label: 'Weak', color: '#EF4444', percent: 20 };
    if (score === 2) return { label: 'Fair', color: '#F59E0B', percent: 40 };
    if (score === 3) return { label: 'Moderate', color: '#FBBF24', percent: 65 };
    if (score === 4) return { label: 'Good', color: '#3B82F6', percent: 85 };
    return { label: 'Strong', color: '#10B981', percent: 100 };
  };

  const strengthMeta = getStrengthMeta();

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
          {/* Header & Step Tracker */}
          <View style={styles.header}>
            <View style={styles.topRow}>
              {currentStep > 1 ? (
                <TouchableOpacity onPress={handleBackStep} style={styles.backButton}>
                  <Ionicons name="arrow-back" size={22} color="#F8FAFC" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                  <Ionicons name="close" size={22} color="#94A3B8" />
                </TouchableOpacity>
              )}
              <Text style={styles.stepIndicatorText}>Step {currentStep} of 3</Text>
              <View style={styles.placeholder} />
            </View>

            {/* Progress Bar Indicator */}
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(currentStep / 3) * 100}%` },
                ]}
              />
            </View>

            <Text style={styles.title}>
              {currentStep === 1 && 'Create Your Account'}
              {currentStep === 2 && 'Set Secure Password'}
              {currentStep === 3 && 'Personalize Reading'}
            </Text>
            <Text style={styles.subtitle}>
              {currentStep === 1 && 'Enter your details to join GoalBook'}
              {currentStep === 2 && 'Keep your reading library safe and encrypted'}
              {currentStep === 3 && 'Choose your daily reading target and agree to terms'}
            </Text>
          </View>

          {/* Error Banner */}
          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={20} color={colors.dark.error} />
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          {/* Animated Step Content */}
          <Animated.View
            style={[
              styles.stepContainer,
              { transform: [{ translateX: stepSlide }] },
            ]}
          >
            {/* STEP 1: Personal Details */}
            {currentStep === 1 && (
              <View>
                <Input
                  label="Full Name"
                  placeholder="Jane Doe"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: '' }));
                  }}
                  error={fieldErrors.name}
                  autoCapitalize="words"
                  leftIcon={<Ionicons name="person-outline" size={20} color={colors.dark.textMuted} />}
                />

                <Input
                  label="Email Address"
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: '' }));
                  }}
                  error={fieldErrors.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon={<Ionicons name="mail-outline" size={20} color={colors.dark.textMuted} />}
                />

                <Button
                  title="Continue to Password"
                  onPress={handleNextStep}
                  size="lg"
                  rightIcon={<Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
                  style={styles.actionButton}
                />
              </View>
            )}

            {/* STEP 2: Password & Strength Indicator */}
            {currentStep === 2 && (
              <View>
                <Input
                  label="Create Password"
                  placeholder="••••••••"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: '' }));
                  }}
                  error={fieldErrors.password}
                  isPassword
                  leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.dark.textMuted} />}
                />

                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <View style={styles.strengthBox}>
                    <View style={styles.strengthHeader}>
                      <Text style={styles.strengthLabel}>Password Strength:</Text>
                      <Text style={[styles.strengthValue, { color: strengthMeta.color }]}>
                        {strengthMeta.label}
                      </Text>
                    </View>

                    <View style={styles.strengthBarBg}>
                      <View
                        style={[
                          styles.strengthBarFill,
                          {
                            width: `${strengthMeta.percent}%`,
                            backgroundColor: strengthMeta.color,
                          },
                        ]}
                      />
                    </View>

                    {/* Requirement Checklist */}
                    <View style={styles.checklist}>
                      <View style={styles.checkItem}>
                        <Ionicons
                          name={passwordCritique.hasMinLength ? 'checkmark-circle' : 'ellipse-outline'}
                          size={14}
                          color={passwordCritique.hasMinLength ? '#10B981' : '#64748B'}
                        />
                        <Text style={[styles.checkText, passwordCritique.hasMinLength && styles.checkTextActive]}>
                          At least 8 characters
                        </Text>
                      </View>

                      <View style={styles.checkItem}>
                        <Ionicons
                          name={passwordCritique.hasUpper && passwordCritique.hasLower ? 'checkmark-circle' : 'ellipse-outline'}
                          size={14}
                          color={passwordCritique.hasUpper && passwordCritique.hasLower ? '#10B981' : '#64748B'}
                        />
                        <Text style={[styles.checkText, passwordCritique.hasUpper && passwordCritique.hasLower && styles.checkTextActive]}>
                          Uppercase & lowercase letters
                        </Text>
                      </View>

                      <View style={styles.checkItem}>
                        <Ionicons
                          name={passwordCritique.hasNumber ? 'checkmark-circle' : 'ellipse-outline'}
                          size={14}
                          color={passwordCritique.hasNumber ? '#10B981' : '#64748B'}
                        />
                        <Text style={[styles.checkText, passwordCritique.hasNumber && styles.checkTextActive]}>
                          At least one number (0-9)
                        </Text>
                      </View>

                      <View style={styles.checkItem}>
                        <Ionicons
                          name={passwordCritique.hasSpecial ? 'checkmark-circle' : 'ellipse-outline'}
                          size={14}
                          color={passwordCritique.hasSpecial ? '#10B981' : '#64748B'}
                        />
                        <Text style={[styles.checkText, passwordCritique.hasSpecial && styles.checkTextActive]}>
                          Special character (!@#$%)
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                <Input
                  label="Confirm Password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (fieldErrors.confirmPassword) setFieldErrors((p) => ({ ...p, confirmPassword: '' }));
                  }}
                  error={fieldErrors.confirmPassword}
                  isPassword
                  leftIcon={<Ionicons name="shield-checkmark-outline" size={20} color={colors.dark.textMuted} />}
                />

                <Button
                  title="Continue to Terms"
                  onPress={handleNextStep}
                  size="lg"
                  rightIcon={<Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
                  style={styles.actionButton}
                />
              </View>
            )}

            {/* STEP 3: Terms & Preferences */}
            {currentStep === 3 && (
              <View>
                {/* Daily Reading Target Selector */}
                <Text style={styles.sectionLabel}>Daily Reading Goal</Text>
                <View style={styles.goalRow}>
                  {[
                    { val: '15', label: '15 min/day', subtitle: 'Casual' },
                    { val: '30', label: '30 min/day', subtitle: 'Focused' },
                    { val: '60', label: '60 min/day', subtitle: 'Pro Reader' },
                  ].map((goal) => {
                    const isSelected = readingGoal === goal.val;
                    return (
                      <TouchableOpacity
                        key={goal.val}
                        style={[styles.goalCard, isSelected && styles.goalCardSelected]}
                        onPress={() => setReadingGoal(goal.val as any)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.goalValue, isSelected && styles.goalValueSelected]}>
                          {goal.label}
                        </Text>
                        <Text style={styles.goalSubtitle}>{goal.subtitle}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Account Summary Card */}
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryTitle}>Account Overview</Text>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Name:</Text>
                    <Text style={styles.summaryValue}>{name}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Email:</Text>
                    <Text style={styles.summaryValue}>{email}</Text>
                  </View>
                </View>

                {/* Terms and Conditions Checkbox */}
                <TouchableOpacity
                  style={styles.termsRow}
                  onPress={() => setTermsAccepted(!termsAccepted)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkbox, termsAccepted && styles.checkboxActive]}>
                    {termsAccepted && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                  </View>
                  <View style={styles.termsTextContainer}>
                    <Text style={styles.termsText}>
                      I agree to the{' '}
                      <Text
                        style={styles.termsLink}
                        onPress={() => setTermsModalVisible(true)}
                      >
                        Terms of Service
                      </Text>{' '}
                      and{' '}
                      <Text
                        style={styles.termsLink}
                        onPress={() => setTermsModalVisible(true)}
                      >
                        Privacy Policy
                      </Text>
                    </Text>
                  </View>
                </TouchableOpacity>

                <Button
                  title="Complete Registration"
                  onPress={handleFinalSubmit}
                  loading={loading}
                  size="lg"
                  style={styles.actionButton}
                />
              </View>
            )}

            {/* Footer Login Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.7}
                style={styles.signInTouch}
              >
                <Text style={styles.signInText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Terms & Conditions Modal */}
      <Modal
        visible={termsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setTermsModalVisible(false)}
      >
        <SafeAreaView style={styles.modalBackdrop} edges={['top', 'bottom', 'left', 'right']}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Terms & Privacy</Text>
              <TouchableOpacity onPress={() => setTermsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#F8FAFC" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalSectionTitle}>GoalBook Terms of Service</Text>
              <Text style={styles.modalText}>
                By creating a GoalBook account, you agree to follow our acceptable use guidelines.
                Your uploaded books, personal reading bookmarks, highlights, and voice notes remain
                your private data. We do not sell your personal data.
              </Text>
              <Text style={styles.modalSectionTitle}>AI & Privacy</Text>
              <Text style={styles.modalText}>
                When you use AI reader assistance (summaries, comprehension quizzes, and voice queries),
                only the excerpted text of your questions is processed securely.
              </Text>
            </ScrollView>
            <Button
              title="I Understand"
              onPress={() => {
                setTermsAccepted(true);
                setTermsModalVisible(false);
              }}
              style={styles.modalAgreeButton}
            />
          </View>
        </SafeAreaView>
      </Modal>

      {/* Success Celebration Overlay */}
      <Modal visible={isSuccessModalVisible} transparent={true} animationType="fade">
        <View style={styles.celebrationBackdrop}>
          <Animated.View
            style={[
              styles.celebrationCard,
              {
                opacity: successOpacity,
                transform: [{ scale: successScale }],
              },
            ]}
          >
            <View style={styles.celebrationIconOuter}>
              <Ionicons name="checkmark-circle" size={72} color="#10B981" />
            </View>
            <Text style={styles.celebrationTitle}>Account Created!</Text>
            <Text style={styles.celebrationSubtitle}>
              Welcome to GoalBook, {name}! Signing you in automatically...
            </Text>
          </Animated.View>
        </View>
      </Modal>
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
  header: {
    marginBottom: spacing.xl,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  backButton: {
    padding: 6,
  },
  stepIndicatorText: {
    color: '#60A5FA',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  placeholder: {
    width: 32,
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#1E293B',
    borderRadius: 2,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
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
  stepContainer: {
    width: '100%',
  },
  actionButton: {
    backgroundColor: '#2563EB',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  strengthBox: {
    backgroundColor: '#151D2F',
    borderWidth: 1,
    borderColor: '#243048',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginVertical: spacing.xs,
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  strengthLabel: {
    color: '#94A3B8',
    fontSize: 12,
  },
  strengthValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  strengthBarBg: {
    height: 6,
    backgroundColor: '#1E293B',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  checklist: {
    gap: 6,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkText: {
    color: '#64748B',
    fontSize: 12,
  },
  checkTextActive: {
    color: '#F8FAFC',
  },
  sectionLabel: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  goalRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  goalCard: {
    flex: 1,
    backgroundColor: '#151D2F',
    borderWidth: 1,
    borderColor: '#243048',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },
  goalCardSelected: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  goalValue: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  goalValueSelected: {
    color: '#60A5FA',
  },
  goalSubtitle: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: '#151D2F',
    borderWidth: 1,
    borderColor: '#243048',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryTitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  summaryLabel: {
    color: '#64748B',
    fontSize: 13,
  },
  summaryValue: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: spacing.xs,
    paddingHorizontal: 2,
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
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18,
  },
  termsLink: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  signInTouch: {
    marginLeft: 6,
    paddingVertical: 2,
  },
  signInText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#151D2F',
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  modalBody: {
    marginBottom: spacing.lg,
  },
  modalSectionTitle: {
    color: '#60A5FA',
    fontSize: 14,
    fontWeight: '700',
    marginTop: spacing.md,
    marginBottom: 4,
  },
  modalText: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 19,
  },
  modalAgreeButton: {
    backgroundColor: '#2563EB',
  },
  celebrationBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 15, 25, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  celebrationCard: {
    backgroundColor: '#151D2F',
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    maxWidth: 340,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  celebrationIconOuter: {
    marginBottom: spacing.md,
  },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: spacing.xs,
  },
  celebrationSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, borderRadius, spacing } from '../../constants/theme';
import * as Haptics from 'expo-haptics';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const SUBJECT_OPTIONS = [
  'General Inquiry',
  'Bug Report / Technical Issue',
  'Enterprise & Academic Licensing',
  'Custom AI / Voice Narration',
  'Feature Request',
];

const FAQS = [
  {
    question: 'How fast can I expect a response to my inquiry?',
    answer:
      'Our support and engineering teams review messages throughout the day. Typical response times are under 2 hours during normal business hours (9:00 AM – 6:00 PM EST), and within 24 hours on weekends.',
  },
  {
    question: 'Do you offer volume licensing for universities & research labs?',
    answer:
      'Yes! We provide custom site licenses with unified SSO, bulk student billing, and dedicated cloud storage quotas for research departments. Select "Enterprise & Academic Licensing" as your subject.',
  },
  {
    question: 'How do I report an issue with a specific PDF layout?',
    answer:
      'You can submit the issue directly through this contact form. Note the file size, number of columns, and page count so our parser engineers can reproduce and optimize the layout extraction engine.',
  },
  {
    question: 'Can I request a custom TTS neural voice or accent?',
    answer:
      'Yes! GoalBook Pro and Enterprise members can request additional multilingual neural voices or custom fine-tuned speech narration models.',
  },
];

export const ContactScreen: React.FC = () => {
  const navigation = useNavigation();

  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: SUBJECT_OPTIONS[0],
    message: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);

  const validateForm = (): boolean => {
    const errs: Partial<Record<keyof ContactFormData, string>> = {};

    if (!formData.name.trim()) {
      errs.name = 'Please enter your full name.';
    }

    if (!formData.email.trim()) {
      errs.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!formData.message.trim()) {
      errs.message = 'Please provide details about your inquiry.';
    } else if (formData.message.trim().length < 10) {
      errs.message = 'Message must be at least 10 characters long.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);
    // Simulate network submission to microserver
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1000);
  };

  const handleOpenMaps = () => {
    const address = '500 Howard St, San Francisco, CA 94105';
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(address)}`,
      android: `geo:0,0?q=${encodeURIComponent(address)}`,
      default: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
    });
    if (url) Linking.openURL(url).catch(() => Alert.alert('Notice', 'Unable to open maps.'));
  };

  const handleOpenMail = (email: string) => {
    Linking.openURL(`mailto:${email}`).catch(() => Alert.alert('Notice', `Email: ${email}`));
  };

  const handleOpenPhone = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/[^0-9+]/g, '')}`).catch(() => Alert.alert('Notice', `Phone: ${phone}`));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      {/* Navigation Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Contact Us</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Response Time Expectation Banner */}
        <View style={styles.responseBanner}>
          <View style={styles.bannerIconBox}>
            <Ionicons name="flash" size={16} color="#FBBF24" />
          </View>
          <View style={styles.bannerTextCol}>
            <Text style={styles.bannerTitle}>Fast Response Expectation</Text>
            <Text style={styles.bannerSubtitle}>
              Typical reply in &lt; 2 hours during EST business hours (9am - 6pm)
            </Text>
          </View>
        </View>

        {/* Contact Form or Success State */}
        <View style={styles.formCard}>
          {submitted ? (
            <View style={styles.successBox}>
              <View style={styles.successIconCircle}>
                <Ionicons name="checkmark-circle" size={48} color="#10B981" />
              </View>
              <Text style={styles.successTitle}>Message Dispatched!</Text>
              <Text style={styles.successDesc}>
                Thank you for reaching out, {formData.name}. Our support team has received your inquiry regarding "{formData.subject}" and will respond to {formData.email} shortly.
              </Text>
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() => {
                  setSubmitted(false);
                  setFormData({
                    name: '',
                    email: '',
                    subject: SUBJECT_OPTIONS[0],
                    message: '',
                  });
                }}
              >
                <Text style={styles.resetBtnText}>Send Another Message</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.formContent}>
              <Text style={styles.sectionHeader}>Get in Touch</Text>
              <Text style={styles.sectionDesc}>
                Have questions about GoalBook, custom speech models, or academic licenses? Send us a note.
              </Text>

              {/* Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={[styles.input, errors.name ? styles.inputError : null]}
                  placeholder="e.g. Alex Morgan"
                  placeholderTextColor={colors.dark.textMuted}
                  value={formData.name}
                  onChangeText={(text) => {
                    setFormData({ ...formData, name: text });
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address *</Text>
                <TextInput
                  style={[styles.input, errors.email ? styles.inputError : null]}
                  placeholder="alex@university.edu"
                  placeholderTextColor={colors.dark.textMuted}
                  value={formData.email}
                  onChangeText={(text) => {
                    setFormData({ ...formData, email: text });
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              {/* Subject Selector */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Subject</Text>
                <TouchableOpacity
                  style={styles.subjectSelector}
                  onPress={() => setShowSubjectPicker(!showSubjectPicker)}
                >
                  <Text style={styles.subjectText}>{formData.subject}</Text>
                  <Ionicons
                    name={showSubjectPicker ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.dark.textSecondary}
                  />
                </TouchableOpacity>

                {showSubjectPicker && (
                  <View style={styles.subjectDropdown}>
                    {SUBJECT_OPTIONS.map((opt) => (
                      <TouchableOpacity
                        key={opt}
                        style={[
                          styles.subjectOption,
                          formData.subject === opt && styles.subjectOptionActive,
                        ]}
                        onPress={() => {
                          setFormData({ ...formData, subject: opt });
                          setShowSubjectPicker(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.subjectOptionText,
                            formData.subject === opt && styles.subjectOptionTextActive,
                          ]}
                        >
                          {opt}
                        </Text>
                        {formData.subject === opt && (
                          <Ionicons name="checkmark" size={16} color={colors.dark.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Message Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Message *</Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    errors.message ? styles.inputError : null,
                  ]}
                  placeholder="Tell us about your project, issue, or request..."
                  placeholderTextColor={colors.dark.textMuted}
                  value={formData.message}
                  onChangeText={(text) => {
                    setFormData({ ...formData, message: text });
                    if (errors.message) setErrors({ ...errors, message: undefined });
                  }}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                {errors.message && <Text style={styles.errorText}>{errors.message}</Text>}
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitBtn, loading && styles.disabledBtn]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="send" size={16} color="#FFFFFF" />
                    <Text style={styles.submitBtnText}>Transmit Inquiry</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Contact Information Cards */}
        <Text style={styles.cardsHeader}>Direct Contact Channels</Text>
        <View style={styles.infoCardsGrid}>
          {/* Email Card */}
          <TouchableOpacity
            style={styles.infoCard}
            onPress={() => handleOpenMail('support@goalbook.app')}
            activeOpacity={0.7}
          >
            <View style={[styles.infoIconBox, { backgroundColor: 'rgba(37, 99, 235, 0.15)' }]}>
              <Ionicons name="mail-outline" size={20} color="#60A5FA" />
            </View>
            <View style={styles.infoMeta}>
              <Text style={styles.infoLabel}>Support & Operations</Text>
              <Text style={styles.infoValue}>support@goalbook.app</Text>
              <Text style={styles.infoSub}>24/7 ticket routing</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.dark.textMuted} />
          </TouchableOpacity>

          {/* Phone Card */}
          <TouchableOpacity
            style={styles.infoCard}
            onPress={() => handleOpenPhone('+18005554625')}
            activeOpacity={0.7}
          >
            <View style={[styles.infoIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Ionicons name="call-outline" size={20} color="#34D399" />
            </View>
            <View style={styles.infoMeta}>
              <Text style={styles.infoLabel}>Enterprise Desk</Text>
              <Text style={styles.infoValue}>+1 (800) 555-GOAL</Text>
              <Text style={styles.infoSub}>Mon - Fri: 9am - 6pm EST</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.dark.textMuted} />
          </TouchableOpacity>

          {/* Headquarters Card */}
          <TouchableOpacity
            style={styles.infoCard}
            onPress={handleOpenMaps}
            activeOpacity={0.7}
          >
            <View style={[styles.infoIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Ionicons name="business-outline" size={20} color="#FBBF24" />
            </View>
            <View style={styles.infoMeta}>
              <Text style={styles.infoLabel}>Global Headquarters</Text>
              <Text style={styles.infoValue}>500 Howard Street, Suite 400</Text>
              <Text style={styles.infoSub}>San Francisco, CA 94105</Text>
            </View>
            <Ionicons name="navigate-outline" size={16} color="#60A5FA" />
          </TouchableOpacity>
        </View>

        {/* Map Integration Card */}
        <View style={styles.mapCard}>
          <View style={styles.mapHeaderRow}>
            <View style={styles.mapHeaderLeft}>
              <Ionicons name="location" size={18} color="#EF4444" />
              <Text style={styles.mapTitle}>San Francisco Campus</Text>
            </View>
            <TouchableOpacity style={styles.openMapBtn} onPress={handleOpenMaps}>
              <Text style={styles.openMapBtnText}>Open in Maps</Text>
              <Ionicons name="arrow-forward" size={12} color="#60A5FA" />
            </TouchableOpacity>
          </View>
          <View style={styles.mapVisualContainer}>
            <View style={styles.mapGridPattern}>
              <View style={styles.radarPulse} />
              <View style={styles.pinBubble}>
                <Ionicons name="pin" size={22} color="#EF4444" />
                <Text style={styles.pinLabel}>GoalBook HQ</Text>
              </View>
            </View>
          </View>
          <Text style={styles.mapCoords}>Coordinates: 37.7891° N, 122.3995° W · SOMA District</Text>
        </View>

        {/* FAQ Accordion */}
        <Text style={styles.cardsHeader}>Frequently Asked Questions</Text>
        <View style={styles.faqList}>
          {FAQS.map((faq, idx) => {
            const isExpanded = expandedFaq === idx;
            return (
              <View key={idx} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqQuestionRow}
                  onPress={() => setExpandedFaq(isExpanded ? null : idx)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="help-circle-outline"
                    size={18}
                    color={isExpanded ? colors.dark.primary : colors.dark.textSecondary}
                  />
                  <Text style={[styles.faqQuestionText, isExpanded && styles.faqQuestionActive]}>
                    {faq.question}
                  </Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={colors.dark.textMuted}
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.faqAnswerBox}>
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  navHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
    backgroundColor: colors.dark.surface,
  },
  backBtn: {
    padding: spacing.xs,
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.dark.text,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  responseBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.25)',
    padding: spacing.md,
    gap: 12,
  },
  bannerIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FBBF24',
  },
  bannerSubtitle: {
    fontSize: 11,
    color: '#FDE68A',
    marginTop: 2,
  },
  formCard: {
    backgroundColor: colors.dark.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.dark.border,
    padding: spacing.lg,
  },
  formContent: {
    gap: spacing.sm,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.dark.text,
  },
  sectionDesc: {
    fontSize: 12,
    color: colors.dark.textSecondary,
    marginBottom: 6,
    lineHeight: 18,
  },
  inputGroup: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.dark.textSecondary,
  },
  input: {
    backgroundColor: colors.dark.surfaceVariant,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.dark.text,
    fontSize: 13,
  },
  inputError: {
    borderColor: colors.dark.error,
  },
  textArea: {
    minHeight: 90,
  },
  errorText: {
    fontSize: 11,
    color: colors.dark.error,
    marginTop: 2,
  },
  subjectSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.dark.surfaceVariant,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  subjectText: {
    fontSize: 13,
    color: colors.dark.text,
  },
  subjectDropdown: {
    backgroundColor: colors.dark.surfaceVariant,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
    marginTop: 4,
    overflow: 'hidden',
  },
  subjectOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  subjectOptionActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
  },
  subjectOptionText: {
    fontSize: 12,
    color: colors.dark.textSecondary,
  },
  subjectOptionTextActive: {
    color: colors.dark.primary,
    fontWeight: '700',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.dark.primary,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    marginTop: spacing.xs,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  successIconCircle: {
    marginBottom: 4,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.dark.text,
  },
  successDesc: {
    fontSize: 13,
    color: colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  resetBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.dark.surfaceVariant,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.dark.text,
  },
  cardsHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.dark.text,
    marginTop: spacing.sm,
  },
  infoCardsGrid: {
    gap: 10,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
    gap: 12,
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoMeta: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: colors.dark.textMuted,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.dark.text,
    marginTop: 1,
  },
  infoSub: {
    fontSize: 10,
    color: colors.dark.textSecondary,
    marginTop: 1,
  },
  mapCard: {
    backgroundColor: colors.dark.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.dark.border,
    padding: spacing.md,
    gap: 10,
  },
  mapHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mapHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mapTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.dark.text,
  },
  openMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  openMapBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#60A5FA',
  },
  mapVisualContainer: {
    height: 120,
    backgroundColor: '#0F172A',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  mapGridPattern: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  radarPulse: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
    position: 'absolute',
  },
  pinBubble: {
    alignItems: 'center',
  },
  pinLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  mapCoords: {
    fontSize: 10,
    color: colors.dark.textMuted,
    textAlign: 'center',
  },
  faqList: {
    gap: 8,
  },
  faqItem: {
    backgroundColor: colors.dark.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
    overflow: 'hidden',
  },
  faqQuestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: 10,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.dark.text,
  },
  faqQuestionActive: {
    color: colors.dark.primary,
  },
  faqAnswerBox: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 8,
  },
  faqAnswerText: {
    fontSize: 12,
    color: colors.dark.textSecondary,
    lineHeight: 18,
  },
});

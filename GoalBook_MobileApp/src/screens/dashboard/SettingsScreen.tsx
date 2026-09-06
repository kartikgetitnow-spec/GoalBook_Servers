import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../store';
import { useAuth } from '../../hooks/useAuth';
import { colors, spacing, borderRadius } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProp } from '../../navigation/types';
import { APP_CONFIG } from '../../constants/config';

export const SettingsScreen: React.FC = () => {
  const rootNav = useNavigation<RootNavigationProp>();
  const { user, logout, isBiometricEnabled, enableBiometric, biometricStatus } = useAuth();
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Settings</Text>

        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'G'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'GoalBook User'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'user@goalbook.local'}</Text>
          </View>
        </View>

        {/* Reading Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reading Preferences</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingTextGroup}>
              <Text style={styles.settingLabel}>Karaoke Word Tracking</Text>
              <Text style={styles.settingDesc}>Highlight words rhythmically with voice</Text>
            </View>
            <Switch
              value={settings.karaokeEnabled}
              onValueChange={(val) => updateSettings({ karaokeEnabled: val })}
              trackColor={{ false: colors.dark.surfaceVariant, true: colors.dark.primary }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingTextGroup}>
              <Text style={styles.settingLabel}>Auto Page Flip</Text>
              <Text style={styles.settingDesc}>Advance page when audio finishes</Text>
            </View>
            <Switch
              value={settings.autoScroll}
              onValueChange={(val) => updateSettings({ autoScroll: val })}
              trackColor={{ false: colors.dark.surfaceVariant, true: colors.dark.primary }}
            />
          </View>
        </View>

        {/* Security & Biometrics */}
        {biometricStatus.hasHardware && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Security & Sign In</Text>
            <View style={styles.settingItem}>
              <View style={styles.settingTextGroup}>
                <Text style={styles.settingLabel}>{biometricStatus.biometricName} Login</Text>
                <Text style={styles.settingDesc}>
                  {biometricStatus.isEnrolled
                    ? `Use ${biometricStatus.biometricName} for instant sign-in`
                    : `Configure ${biometricStatus.biometricName} in device settings`}
                </Text>
              </View>
              <Switch
                disabled={!biometricStatus.isEnrolled}
                value={isBiometricEnabled}
                onValueChange={(val) => {
                  enableBiometric(val);
                }}
                trackColor={{ false: colors.dark.surfaceVariant, true: colors.dark.primary }}
              />
            </View>
          </View>
        )}

        {/* Backend & AI Connection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connected Microservers</Text>
          <View style={styles.serviceRow}>
            <Ionicons name="server-outline" size={20} color={colors.dark.secondary} />
            <Text style={styles.serviceLabel}>User Interaction Server</Text>
            <Text style={styles.serviceStatus}>Online</Text>
          </View>
          <View style={styles.serviceRow}>
            <Ionicons name="hardware-chip-outline" size={20} color="#FBBF24" />
            <Text style={styles.serviceLabel}>AI Python Server</Text>
            <Text style={styles.serviceStatus}>Ready</Text>
          </View>
        </View>

        {/* Company & Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Company & Support</Text>
          <TouchableOpacity
            style={styles.serviceRow}
            onPress={() => rootNav.navigate('About')}
            activeOpacity={0.7}
          >
            <Ionicons name="information-circle-outline" size={20} color={colors.dark.primary} />
            <Text style={styles.serviceLabel}>About GoalBook & Team</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.dark.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.serviceRow}
            onPress={() => rootNav.navigate('Contact')}
            activeOpacity={0.7}
          >
            <Ionicons name="mail-outline" size={20} color="#34D399" />
            <Text style={styles.serviceLabel}>Contact Support & FAQ</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.dark.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={colors.dark.error} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>
          GoalBook Mobile v{APP_CONFIG.version} (Expo 54)
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.dark.text,
    marginBottom: spacing.xs,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.dark.border,
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.dark.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark.text,
  },
  userEmail: {
    fontSize: 13,
    color: colors.dark.textSecondary,
  },
  section: {
    backgroundColor: colors.dark.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.dark.textMuted,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
  },
  settingTextGroup: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.dark.text,
  },
  settingDesc: {
    fontSize: 12,
    color: colors.dark.textSecondary,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  serviceLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.dark.text,
  },
  serviceStatus: {
    fontSize: 12,
    color: colors.dark.success,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  logoutText: {
    color: colors.dark.error,
    fontSize: 15,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    color: colors.dark.textMuted,
    fontSize: 12,
    marginTop: spacing.sm,
  },
});

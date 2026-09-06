import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AuthNavigationProp } from '../../navigation/types';
import { Button } from '../../components/common/Button';
import { colors, spacing } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<AuthNavigationProp>();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.content}>
        <View style={styles.heroSection}>
          <View style={styles.iconCircle}>
            <Ionicons name="book" size={56} color={colors.dark.primary} />
          </View>
          <Text style={styles.appName}>GoalBook</Text>
          <Text style={styles.tagline}>
            Transform your reading with AI assistance & vocal karaoke speed reading
          </Text>
        </View>

        <View style={styles.actionSection}>
          <Button
            title="Get Started"
            size="lg"
            onPress={() => navigation.navigate('Features')}
            style={styles.primaryBtn}
          />
          <Button
            title="I already have an account"
            variant="outline"
            size="lg"
            onPress={() => navigation.navigate('Login')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'space-between',
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.dark.text,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    color: colors.dark.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 24,
    maxWidth: 280,
  },
  actionSection: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  primaryBtn: {
    shadowColor: colors.dark.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});

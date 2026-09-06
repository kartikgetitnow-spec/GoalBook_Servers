import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AuthNavigationProp } from '../../navigation/types';
import { Button } from '../../components/common/Button';
import { colors, borderRadius, spacing } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const featureList = [
  {
    icon: 'sparkles' as const,
    title: 'AI Companion',
    description: 'Ask questions, summarize long passages, and clarify confusing ideas in real time.',
  },
  {
    icon: 'mic-outline' as const,
    title: 'Karaoke Vocal Reader',
    description: 'Follow highlighted words in rhythm as audio guides your eyes to read 2x faster.',
  },
  {
    icon: 'stats-chart-outline' as const,
    title: 'Reading Streaks & Stats',
    description: 'Track your words per minute, daily habits, and retention milestones automatically.',
  },
];

export const FeaturesScreen: React.FC = () => {
  const navigation = useNavigation<AuthNavigationProp>();
  const [currentIndex, setCurrentIndex] = useState(0);

  const isLast = currentIndex === featureList.length - 1;

  const handleNext = () => {
    if (isLast) {
      navigation.navigate('Register');
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const feature = featureList[currentIndex];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name={feature.icon} size={48} color={colors.dark.primary} />
        </View>

        <Text style={styles.title}>{feature.title}</Text>
        <Text style={styles.description}>{feature.description}</Text>

        {/* Indicators */}
        <View style={styles.indicators}>
          {featureList.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                currentIndex === i ? styles.activeDot : null,
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title={isLast ? 'Get Started' : 'Next'}
          size="lg"
          onPress={handleNext}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    alignItems: 'flex-end',
    paddingVertical: spacing.md,
  },
  skipText: {
    color: colors.dark.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.dark.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.dark.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  indicators: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.dark.border,
  },
  activeDot: {
    width: 24,
    backgroundColor: colors.dark.primary,
  },
  footer: {
    padding: spacing.xl,
  },
});

import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ViewStyle,
  Animated,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../constants/colors';
import { borderRadius, shadows, spacing } from '../../constants/theme';

export interface CardProps {
  children?: React.ReactNode;
  onPress?: () => void;
  elevation?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  padding?: number;
  margin?: number;
  loading?: boolean;
  style?: ViewStyle;
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  elevation = 'md',
  padding = spacing.md,
  margin = 0,
  loading = false,
  style,
  accessible = true,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (loading) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.8,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [loading, pulseAnim]);

  const handlePress = () => {
    if (!onPress || loading) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const containerStyle = [
    styles.card,
    shadows[elevation],
    { padding, margin },
    style,
  ];

  if (loading) {
    return (
      <View style={containerStyle}>
        <Animated.View style={[styles.skeletonLine, { opacity: pulseAnim, width: '65%' }]} />
        <Animated.View style={[styles.skeletonLine, { opacity: pulseAnim, width: '90%' }]} />
        <Animated.View style={[styles.skeletonLine, { opacity: pulseAnim, width: '45%' }]} />
      </View>
    );
  }

  if (onPress) {
    return (
      <Pressable
        onPress={handlePress}
        android_ripple={{ color: 'rgba(255, 255, 255, 0.08)' }}
        accessible={accessible}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        style={({ pressed }) => [
          containerStyle,
          pressed && Platform.OS === 'ios' && styles.iosPressed,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View
      style={containerStyle}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.dark.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.dark.border,
    overflow: 'hidden',
  },
  iosPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  skeletonLine: {
    height: 16,
    backgroundColor: colors.dark.surfaceVariant,
    borderRadius: borderRadius.xs,
    marginVertical: spacing.xs,
  },
});

import React, { Suspense, ComponentType } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, borderRadius, spacing } from '../../constants/theme';

interface LazyComponentProps {
  fallbackHeight?: number;
  message?: string;
}

export const SkeletonPlaceholder: React.FC<{ height?: number }> = ({ height = 180 }) => (
  <View style={[styles.skeleton, { height }]}>
    <ActivityIndicator size="small" color={colors.dark.primary} />
  </View>
);

/**
 * Higher Order Component to wrap heavy dynamic/lazy components
 * with a lightweight animated fallback skeleton.
 */
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  fallbackProps?: LazyComponentProps
) {
  return function LazyWrapper(props: P) {
    return (
      <Suspense
        fallback={<SkeletonPlaceholder height={fallbackProps?.fallbackHeight} />}
      >
        <Component {...props} />
      </Suspense>
    );
  };
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.dark.surface,
    borderRadius: borderRadius.md,
    marginVertical: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
});

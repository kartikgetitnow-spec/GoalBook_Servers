import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  PanResponder,
  TouchableOpacity,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../constants/colors';
import { borderRadius, spacing, touchTargets } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export interface ListItemProps {
  title: string;
  subtitle?: string;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  trailingIcon?: keyof typeof Ionicons.glyphMap;
  showCheckbox?: boolean;
  checked?: boolean;
  onToggleCheck?: (checked: boolean) => void;
  onPress?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  accessibilityLabel?: string;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  leftComponent,
  rightComponent,
  trailingIcon = 'chevron-forward',
  showCheckbox = false,
  checked = false,
  onToggleCheck,
  onPress,
  onDelete,
  onArchive,
  accessibilityLabel,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;

  const hasSwipeActions = Boolean(onDelete || onArchive);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return hasSwipeActions && Math.abs(gestureState.dx) > 15;
      },
      onPanResponderMove: (_, gestureState) => {
        if (!hasSwipeActions) return;
        // Limit swipe range
        if (gestureState.dx < 0 && onDelete) {
          translateX.setValue(Math.max(-140, gestureState.dx));
        } else if (gestureState.dx > 0 && onArchive) {
          translateX.setValue(Math.min(100, gestureState.dx));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -70 && onDelete) {
          Animated.timing(translateX, {
            toValue: -140,
            duration: 150,
            useNativeDriver: true,
          }).start();
        } else if (gestureState.dx > 60 && onArchive) {
          Animated.timing(translateX, {
            toValue: 80,
            duration: 150,
            useNativeDriver: true,
          }).start();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const resetSwipe = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (showCheckbox) {
      if (Platform.OS !== 'web') {
        Haptics.selectionAsync();
      }
      onToggleCheck?.(!checked);
    } else {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress?.();
    }
  };

  return (
    <View style={styles.outerContainer}>
      {/* Background Actions */}
      {hasSwipeActions && (
        <View style={styles.actionsBackground}>
          {onArchive && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.archiveBtn]}
              onPress={() => {
                resetSwipe();
                onArchive();
              }}
            >
              <Ionicons name="archive-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }} />
          {onDelete && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.deleteBtn]}
              onPress={() => {
                resetSwipe();
                onDelete();
              }}
            >
              <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Foreground Content */}
      <Animated.View
        {...(hasSwipeActions ? panResponder.panHandlers : {})}
        style={[styles.itemContainer, { transform: [{ translateX }] }]}
      >
        <Pressable
          onPress={handlePress}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.08)' }}
          accessible={true}
          accessibilityRole={showCheckbox ? 'checkbox' : 'button'}
          accessibilityState={showCheckbox ? { checked } : undefined}
          accessibilityLabel={accessibilityLabel || title}
          style={({ pressed }) => [
            styles.pressable,
            pressed && Platform.OS === 'ios' && styles.iosPressed,
          ]}
        >
          {showCheckbox && (
            <View style={styles.checkboxContainer}>
              <Ionicons
                name={checked ? 'checkbox' : 'square-outline'}
                size={22}
                color={checked ? colors.dark.primary : colors.dark.textMuted}
              />
            </View>
          )}

          {leftComponent && <View style={styles.leftComp}>{leftComponent}</View>}

          <View style={styles.textGroup}>
            <Text numberOfLines={1} style={styles.title}>
              {title}
            </Text>
            {subtitle && (
              <Text numberOfLines={1} style={styles.subtitle}>
                {subtitle}
              </Text>
            )}
          </View>

          {rightComponent ? (
            <View style={styles.rightComp}>{rightComponent}</View>
          ) : (
            <Ionicons name={trailingIcon} size={18} color={colors.dark.textMuted} />
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: borderRadius.md,
    marginVertical: spacing.xs,
  },
  actionsBackground: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  actionBtn: {
    width: 70,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  archiveBtn: {
    backgroundColor: colors.dark.accent,
  },
  deleteBtn: {
    backgroundColor: colors.dark.error,
  },
  itemContainer: {
    backgroundColor: colors.dark.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  pressable: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: touchTargets.minHeight + 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  iosPressed: {
    opacity: 0.85,
  },
  checkboxContainer: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftComp: {
    justifyContent: 'center',
  },
  textGroup: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.dark.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.dark.textSecondary,
    marginTop: 2,
  },
  rightComp: {
    justifyContent: 'center',
  },
});

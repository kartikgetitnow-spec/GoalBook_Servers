import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { colors } from '../../constants/colors';
import { borderRadius, spacing, touchTargets } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  isPassword = false,
  value,
  defaultValue,
  style,
  autoFocus,
  onFocus,
  onBlur,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!isPassword);
  const animatedIsFocused = useRef(new Animated.Value(value || defaultValue ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: isFocused || (value && value.length > 0) ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value, animatedIsFocused]);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const labelStyle = {
    top: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [16, -9],
    }),
    fontSize: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [14, 11],
    }),
    color: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.dark.textMuted, error ? colors.dark.error : colors.dark.primary],
    }),
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focusedContainer,
          error ? styles.errorContainer : null,
        ]}
      >
        <Animated.Text
          style={[styles.floatingLabel, labelStyle, leftIcon ? { left: 40 } : { left: 14 }]}
          pointerEvents="none"
        >
          {label}
        </Animated.Text>

        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}

        <TextInput
          autoFocus={autoFocus}
          value={value}
          defaultValue={defaultValue}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isPassword && !showPassword}
          placeholderTextColor="transparent" // using floating label
          style={[styles.textInput, style]}
          accessible={true}
          accessibilityLabel={label}
          accessibilityHint={error || undefined}
          {...rest}
        />

        {isPassword && (
          <TouchableOpacity
            style={styles.rightAction}
            onPress={() => setShowPassword(!showPassword)}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.dark.textMuted}
            />
          </TouchableOpacity>
        )}

        {!isPassword && rightIcon && (
          <View style={styles.rightAction}>{rightIcon}</View>
        )}
      </View>

      {error ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={14} color={colors.dark.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.surfaceVariant,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.dark.border,
    minHeight: 56,
    paddingHorizontal: spacing.md,
    position: 'relative',
  },
  focusedContainer: {
    borderColor: colors.dark.primary,
    backgroundColor: colors.dark.surface,
  },
  errorContainer: {
    borderColor: colors.dark.error,
  },
  floatingLabel: {
    position: 'absolute',
    backgroundColor: colors.dark.surfaceVariant,
    paddingHorizontal: 4,
    borderRadius: 2,
    fontWeight: '500',
    zIndex: 1,
  },
  leftIconContainer: {
    marginRight: spacing.sm,
    width: 24,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    minHeight: touchTargets.minHeight,
    color: colors.dark.text,
    fontSize: 15,
    paddingTop: 6,
  },
  rightAction: {
    padding: spacing.xs,
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  errorText: {
    color: colors.dark.error,
    fontSize: 12,
    fontWeight: '500',
  },
});

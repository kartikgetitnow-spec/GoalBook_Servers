import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';
import { borderRadius, shadows, spacing } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queue, setQueue] = useState<ToastItem[]>([]);
  const [current, setCurrent] = useState<ToastItem | null>(null);
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const dismiss = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrent(null);
    });
  }, [translateY, opacity]);

  // Process next item in queue when current is empty
  useEffect(() => {
    if (!current && queue.length > 0) {
      const next = queue[0];
      setQueue((prev) => prev.slice(1));
      setCurrent(next);

      translateY.setValue(-100);
      opacity.setValue(0);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      timerRef.current = setTimeout(() => {
        dismiss();
      }, next.duration || 3000);
    }
  }, [current, queue, translateY, opacity, dismiss]);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 3000) => {
    const newItem: ToastItem = {
      id: `toast_${Date.now()}_${Math.random()}`,
      message,
      type,
      duration,
    };
    setQueue((prev) => [...prev, newItem]);
  }, []);

  const hideToast = useCallback((id: string) => {
    if (current?.id === id) {
      dismiss();
    } else {
      setQueue((prev) => prev.filter((t) => t.id !== id));
    }
  }, [current, dismiss]);

  const getToastStyle = (type: ToastType = 'info') => {
    switch (type) {
      case 'success':
        return {
          bg: colors.dark.successBg,
          borderColor: colors.dark.success,
          icon: 'checkmark-circle' as const,
          iconColor: colors.dark.success,
        };
      case 'error':
        return {
          bg: colors.dark.errorBg,
          borderColor: colors.dark.error,
          icon: 'alert-circle' as const,
          iconColor: colors.dark.error,
        };
      case 'warning':
        return {
          bg: colors.dark.warningBg,
          borderColor: colors.dark.warning,
          icon: 'warning' as const,
          iconColor: colors.dark.warning,
        };
      default:
        return {
          bg: colors.dark.infoBg,
          borderColor: colors.dark.info,
          icon: 'information-circle' as const,
          iconColor: colors.dark.info,
        };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {current && (
        <SafeAreaView style={styles.safeContainer} pointerEvents="box-none" edges={['top', 'left', 'right']}>
          <Animated.View
            style={[
              styles.toastBox,
              shadows.lg,
              {
                backgroundColor: colors.dark.surface,
                borderColor: getToastStyle(current.type).borderColor,
                transform: [{ translateY }],
                opacity,
              },
            ]}
          >
            <Ionicons
              name={getToastStyle(current.type).icon}
              size={22}
              color={getToastStyle(current.type).iconColor}
            />
            <Text style={styles.message} numberOfLines={2}>
              {current.message}
            </Text>
            <TouchableOpacity onPress={dismiss} style={styles.closeBtn}>
              <Ionicons name="close" size={18} color={colors.dark.textMuted} />
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      )}
    </ToastContext.Provider>
  );
};

// Standalone Toast component for simple inline use
export const Toast: React.FC<{ visible: boolean; message: string; type?: ToastType }> = ({
  visible,
  message,
  type = 'info',
}) => {
  if (!visible) return null;
  return (
    <View style={[styles.inlineToast, shadows.md]}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: 8,
  },
  toastBox: {
    width: '100%',
    maxWidth: 420,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    gap: spacing.sm,
  },
  message: {
    flex: 1,
    color: colors.dark.text,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  inlineToast: {
    padding: spacing.md,
    backgroundColor: colors.dark.surface,
    borderRadius: borderRadius.md,
  },
});

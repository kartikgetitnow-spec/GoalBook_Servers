import { Animated, Easing } from 'react-native';

export const animationDuration = {
  fast: 150,
  normal: 250,
  slow: 350,
};

export const animationEasing = {
  easeInOut: Easing.bezier(0.4, 0, 0.2, 1),
  easeOut: Easing.bezier(0, 0, 0.2, 1),
  easeIn: Easing.bezier(0.4, 0, 1, 1),
  spring: Easing.bounce,
};

export const animationPresets = {
  fadeIn: (value: Animated.Value, duration: number = animationDuration.normal) => {
    return Animated.timing(value, {
      toValue: 1,
      duration,
      easing: animationEasing.easeOut,
      useNativeDriver: true,
    });
  },

  fadeOut: (value: Animated.Value, duration: number = animationDuration.fast) => {
    return Animated.timing(value, {
      toValue: 0,
      duration,
      easing: animationEasing.easeIn,
      useNativeDriver: true,
    });
  },

  slideUp: (value: Animated.Value, duration: number = animationDuration.normal) => {
    return Animated.timing(value, {
      toValue: 0,
      duration,
      easing: animationEasing.easeOut,
      useNativeDriver: true,
    });
  },

  slideDown: (value: Animated.Value, toValue: number = 300, duration: number = animationDuration.normal) => {
    return Animated.timing(value, {
      toValue,
      duration,
      easing: animationEasing.easeIn,
      useNativeDriver: true,
    });
  },

  scaleIn: (value: Animated.Value, duration: number = animationDuration.normal) => {
    return Animated.spring(value, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    });
  },

  scaleOut: (value: Animated.Value, duration: number = animationDuration.fast) => {
    return Animated.timing(value, {
      toValue: 0.95,
      duration,
      easing: animationEasing.easeIn,
      useNativeDriver: true,
    });
  },
};

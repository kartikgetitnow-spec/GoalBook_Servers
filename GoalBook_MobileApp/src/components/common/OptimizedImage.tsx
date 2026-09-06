import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Animated,
  ImageStyle,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius } from '../../constants/theme';

interface OptimizedImageProps {
  source: { uri: string } | number;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  fallbackIcon?: keyof typeof Ionicons.glyphMap;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  priority?: 'low' | 'normal' | 'high';
  alt?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  containerStyle,
  fallbackIcon = 'image-outline',
  resizeMode = 'cover',
}) => {
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const shimmerAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (!loaded && !hasError) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 0.8,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0.3,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [loaded, hasError, shimmerAnim]);

  if (hasError) {
    return (
      <View style={[styles.fallbackContainer, containerStyle, style as any]}>
        <Ionicons name={fallbackIcon} size={28} color={colors.dark.textMuted} />
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Blur/Shimmer Placeholder */}
      {!loaded && (
        <Animated.View
          style={[
            styles.placeholder,
            style as any,
            { opacity: shimmerAnim },
          ]}
        />
      )}

      {/* Actual Image */}
      <Image
        source={source}
        style={[style, !loaded && styles.hiddenImage]}
        resizeMode={resizeMode}
        onLoad={() => setLoaded(true)}
        onError={() => setHasError(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  placeholder: {
    backgroundColor: colors.dark.surfaceVariant,
    borderRadius: borderRadius.sm,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  hiddenImage: {
    opacity: 0,
  },
  fallbackContainer: {
    backgroundColor: colors.dark.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.sm,
  },
});

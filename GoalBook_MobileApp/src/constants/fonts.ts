import { Platform, PixelRatio } from 'react-native';

export const fontFamilies = {
  sans: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'sans-serif',
  }),
  serif: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'serif',
  }),
  mono: Platform.select({
    ios: 'Courier New',
    android: 'monospace',
    default: 'monospace',
  }),
  dyslexic: Platform.select({
    ios: 'ArialRoundedMTBold',
    android: 'sans-serif-medium',
    default: 'sans-serif',
  }),
};

export const typographyScale = {
  caption: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
    fontWeight: '400' as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    fontWeight: '400' as const,
  },
  bodyLarge: {
    fontSize: 18,
    lineHeight: 28,
    letterSpacing: 0.15,
    fontWeight: '400' as const,
  },
  titleSmall: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.1,
    fontWeight: '600' as const,
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0,
    fontWeight: '600' as const,
  },
  titleLarge: {
    fontSize: 22,
    lineHeight: 30,
    letterSpacing: 0,
    fontWeight: '700' as const,
  },
  headline: {
    fontSize: 26,
    lineHeight: 34,
    letterSpacing: -0.2,
    fontWeight: '700' as const,
  },
  display: {
    fontSize: 34,
    lineHeight: 42,
    letterSpacing: -0.5,
    fontWeight: '800' as const,
  },
};

/**
 * Calculates accessible font size respecting device font scale capped to prevent breaking UI
 */
export function scaleFont(size: number, maxFactor: number = 1.35): number {
  const fontScale = PixelRatio.getFontScale();
  const clampedScale = Math.min(fontScale, maxFactor);
  return Math.round(size * clampedScale);
}

export const fonts = {
  family: fontFamilies,
  scale: typographyScale,
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    title: 28,
    hero: 34,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2.0,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
};

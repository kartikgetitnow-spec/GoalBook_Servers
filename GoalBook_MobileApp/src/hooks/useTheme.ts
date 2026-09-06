import { useColorScheme } from 'react-native';
import { colors, readingModes } from '../constants/colors';
import { spacing, borderRadius, shadows, touchTargets } from '../constants/theme';
import { fonts, typographyScale, scaleFont } from '../constants/fonts';
import { useAppStore } from '../store';

export function useTheme() {
  const systemScheme = useColorScheme();
  const readerTheme = useAppStore((state) => state.settings.theme);
  const updateSettings = useAppStore((state) => state.updateSettings);

  const isDark = readerTheme === 'dark' || (readerTheme !== 'light' && readerTheme !== 'sepia' && systemScheme === 'dark');
  const activeColors = isDark ? colors.dark : colors.light;

  const activeReadingMode = readerTheme === 'sepia'
    ? readingModes.sepia
    : isDark
    ? readingModes.dark
    : readingModes.normal;

  const setTheme = (mode: 'light' | 'dark' | 'sepia') => {
    updateSettings({ theme: mode });
  };

  return {
    isDark,
    theme: readerTheme,
    colors: activeColors,
    readingColors: activeReadingMode,
    spacing,
    borderRadius,
    shadows,
    touchTargets,
    fonts,
    typographyScale,
    scaleFont,
    setTheme,
  };
}

import { useWindowDimensions, Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Standard design baseline: 375 x 812 (iPhone 13 / modern phone standard)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

export const breakpoints = {
  phone: 0,
  tablet: 768,
  desktop: 1024,
};

export function scaleWidth(size: number): number {
  return Math.round((SCREEN_WIDTH / BASE_WIDTH) * size);
}

export function scaleHeight(size: number): number {
  return Math.round((SCREEN_HEIGHT / BASE_HEIGHT) * size);
}

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const isLandscape = width > height;
  const isTablet = Math.min(width, height) >= breakpoints.tablet;
  const isPhone = !isTablet;

  const wp = (percent: number) => (width * percent) / 100;
  const hp = (percent: number) => (height * percent) / 100;

  return {
    width,
    height,
    isLandscape,
    isTablet,
    isPhone,
    wp,
    hp,
    scaleWidth,
    scaleHeight,
  };
}

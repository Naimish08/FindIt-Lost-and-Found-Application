/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const brandPrimary = '#2563EB';
const brandPrimaryDark = '#1D4ED8';
const brandSecondary = '#10B981';
const danger = '#EF4444';
const warning = '#F59E0B';
const success = '#10B981';
const surface = '#FFFFFF';
const surfaceDark = '#111827';
const border = '#E5E7EB';
const borderDark = '#1F2937';
const textPrimary = '#111827';
const textSecondary = '#6B7280';
const textPrimaryDark = '#F3F4F6';
const textSecondaryDark = '#9CA3AF';

export const Colors = {
  light: {
    text: textPrimary,
    textMuted: textSecondary,
    background: '#F9FAFB',
    surface,
    border,
    primary: brandPrimary,
    primaryAlt: brandPrimaryDark,
    secondary: brandSecondary,
    success,
    warning,
    danger,
    icon: '#9CA3AF',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: brandPrimary,
    cardShadow: 'rgba(17, 24, 39, 0.06)'
  },
  dark: {
    text: textPrimaryDark,
    textMuted: textSecondaryDark,
    background: '#0B1220',
    surface: surfaceDark,
    border: borderDark,
    primary: '#60A5FA',
    primaryAlt: '#3B82F6',
    secondary: '#34D399',
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',
    icon: '#9CA3AF',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#60A5FA',
    cardShadow: 'rgba(0, 0, 0, 0.25)'
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const Spacing = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 28,
};

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  floating: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 16,
  },
};

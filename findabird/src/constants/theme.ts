/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#151B33',     
    background: '#EDF1F6', 
    backgroundElement: '#DCE6FA',
    backgroundSelected: '#C8D7F5',
    textSecondary: '#5A6378',

    surface: '#FFFFFF',
    primary: '#2A57D6',
    accent: '#F4D03F',
    success: '#8AA34E',
    danger: '#E2505E',
    onPrimary: '#FFFFFF',
    onAccent: '#151B33',
    tabIconDefault: '#9AA3B8',
    successSoft: '#E1E9CB',
    onSuccessSoft: '#4F6320',
    accentSoft: '#FBEDB0',
    onAccentSoft: '#6B5600',
  },
  dark: {
    text: '#EDF1F6',
    background: '#151B33',
    backgroundElement: '#1F2747',
    backgroundSelected: '#2B3560',
    textSecondary: '#A5AEC4',

    surface: '#1A2140',
    primary: '#5B82E8',
    accent: '#F4D03F',
    success: '#8AA34E',
    danger: '#E2505E',
    onPrimary: '#FFFFFF',
    onAccent: '#151B33',
    tabIconDefault: '#6B7592',
    successSoft: '#2C3820',
    onSuccessSoft: '#C5D89A',
    accentSoft: '#4A4116',
    onAccentSoft: '#F4D03F'
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

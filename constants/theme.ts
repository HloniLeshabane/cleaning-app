/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Brand colors for cleaning services app
const primaryOrange = '#FF6B35';
const secondaryBlue = '#2A9D8F';
const white = '#FFFFFF';

export const Colors = {
  light: {
    text: '#11181C',
    background: white,
    tint: primaryOrange,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: primaryOrange,
    primary: primaryOrange,
    secondary: secondaryBlue,
    card: white,
    border: '#E5E5E5',
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: primaryOrange,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: primaryOrange,
    primary: primaryOrange,
    secondary: secondaryBlue,
    card: '#1E1E1E',
    border: '#2C2C2C',
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
  },
};

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
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

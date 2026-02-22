import { Platform } from 'react-native';

export const Colors = {
  light: {
    background: '#FCF7F0',
    text: '#3A2C1C',
    primary: '#FF6B00',
    secondary: '#FF8A1F',
    tint: '#FF6B00',
    icon: '#B2561A',
    tabIconDefault: '#B9814A',
    tabIconSelected: '#FF6B00',
    card: 'rgba(255, 255, 255, 0.9)',
    border: '#FFD7AF',
    iconBg: '#FFE4CC',
    shadow: '#FF974F',
    tabBg: 'rgba(255, 245, 235, 0.97)',
    tabBorder: '#FFCA9A',
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#E53935',
  },
  dark: {
    background: '#1A1108',
    text: '#F5E8D6',
    primary: '#FF6B00',
    secondary: '#FF8A1F',
    tint: '#FF6B00',
    icon: '#C8905A',
    tabIconDefault: '#A87050',
    tabIconSelected: '#FF6B00',
    card: 'rgba(50, 30, 10, 0.9)',
    border: '#6B3D1A',
    iconBg: '#3D1E08',
    shadow: '#FF6B00',
    tabBg: 'rgba(30, 15, 5, 0.97)',
    tabBorder: '#5A2D0C',
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#E53935',
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

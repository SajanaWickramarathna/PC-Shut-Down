import { DefaultTheme, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { useColorScheme } from 'react-native';

export const lightColors = {
  primary: '#3b82f6', // Premium blue
  primaryHover: '#2563eb',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  surfaceHighlight: '#EFF6FF',
};

export const darkColors = {
  primary: '#3b82f6',
  primaryHover: '#60a5fa',
  background: '#0F172A',
  surface: '#1E293B',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#334155',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  surfaceHighlight: '#1e3a8a',
};

export const LightAppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: lightColors.primary,
    background: lightColors.background,
    card: lightColors.surface,
    text: lightColors.text,
    border: lightColors.border,
    notification: lightColors.error,
  },
};

export const DarkAppTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    primary: darkColors.primary,
    background: darkColors.background,
    card: darkColors.surface,
    text: darkColors.text,
    border: darkColors.border,
    notification: darkColors.error,
  },
};

export const useAppTheme = () => {
  const isDark = useColorScheme() === 'dark';
  return {
    isDark,
    colors: isDark ? darkColors : lightColors,
    navigationTheme: isDark ? DarkAppTheme : LightAppTheme,
  };
};

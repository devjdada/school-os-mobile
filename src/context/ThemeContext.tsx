import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceHighlight: string;
  surfaceMuted: string;
  border: string;
  borderLight: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  danger: string;
  dangerLight: string;
  info: string;
  infoLight: string;
  cardShadow: string;
}

export const lightColors: ThemeColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceHighlight: '#F1F5F9',
  surfaceMuted: '#E2E8F0',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  primary: '#465FFF',
  primaryLight: '#EEF2FF',
  primaryDark: '#3641F5',
  secondary: '#0D9488',
  success: '#059669',
  successLight: '#ECFDF5',
  warning: '#D97706',
  warningLight: '#FFFBEB',
  danger: '#DC2626',
  dangerLight: '#FEF2F2',
  info: '#3B82F6',
  infoLight: '#EFF6FF',
  cardShadow: 'rgba(15, 23, 42, 0.06)',
};

export const darkColors: ThemeColors = {
  background: '#0F172A',
  surface: '#1E293B',
  surfaceHighlight: '#334155',
  surfaceMuted: '#0F172A',
  border: '#334155',
  borderLight: '#1E293B',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  primary: '#465FFF',
  primaryLight: 'rgba(70, 95, 255, 0.15)',
  primaryDark: '#3641F5',
  secondary: '#0D9488',
  success: '#059669',
  successLight: 'rgba(5, 150, 105, 0.15)',
  warning: '#D97706',
  warningLight: 'rgba(217, 119, 6, 0.15)',
  danger: '#DC2626',
  dangerLight: 'rgba(220, 38, 38, 0.15)',
  info: '#3B82F6',
  infoLight: 'rgba(59, 130, 246, 0.15)',
  cardShadow: 'rgba(0, 0, 0, 0.35)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const typography = {
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },
  weights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
};

export const radii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  pill: 9999,
};

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  spacing: typeof spacing;
  typography: typeof typography;
  radii: typeof radii;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  setCustomBrandColor: (primaryColor: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  isDark: true,
  colors: darkColors,
  spacing,
  typography,
  radii,
  setMode: () => {},
  toggleTheme: () => {},
  setCustomBrandColor: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [customPrimary, setCustomPrimary] = useState<string | null>(null);

  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';

  const baseColors = isDark ? darkColors : lightColors;
  const colors: ThemeColors = customPrimary
    ? {
        ...baseColors,
        primary: customPrimary,
      }
    : baseColors;

  const toggleTheme = () => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setCustomBrandColor = (primaryColor: string) => {
    setCustomPrimary(primaryColor);
  };

  return (
    <ThemeContext.Provider
      value={{
        mode,
        isDark,
        colors,
        spacing,
        typography,
        radii,
        setMode,
        toggleTheme,
        setCustomBrandColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

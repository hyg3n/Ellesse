// styles/theme.js
import {StyleSheet} from 'react-native';
import {useContext} from 'react';
import {ThemeContext} from '../context/ThemeContext';

// Define light and dark color palettes
const LightColors = {
  primary: '#007BFF',
  background: '#FFFFFF',
  backgroundLight: '#F5F5F5',
  sectionBackground: '#E8E8E8',
  card: '#FFFFFF',
  border: '#DDDDDD',
  text: '#333333',
  placeholder: '#888888',
  error: '#FF3B30',
  shadow: 'rgba(0,0,0,0.1)',
};

const DarkColors = {
  primary: '#0A84FF',
  background: '#1C1C1E',
  backgroundLight: '#121212',
  sectionBackground: '#2A2A2A',
  card: '#1C1C1E',
  border: '#333333',
  text: '#EEEEEE',
  placeholder: '#AAAAAA',
  error: '#FF453A',
  shadow: 'rgba(255,255,255,0.1)',
};

// Export a Colors object
export const Colors = {
  light: LightColors,
  dark: DarkColors,
};

// Typography scale
export const Typography = {
  h1: {fontSize: 28, fontWeight: '700'},
  h2: {fontSize: 24, fontWeight: '600'},
  subtitle: {fontSize: 18, fontWeight: '500'},
  body: {fontSize: 16, fontWeight: '400'},
  caption: {fontSize: 14, fontWeight: '300'},
};

// Spacing scale
export const Spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
};

// Function to create global styles based on a palette
export const createGlobalStyles = palette =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: palette.backgroundLight,
    },
    container: {
      flex: 1,
      padding: Spacing.m,
      backgroundColor: palette.backgroundLight,
    },
    section: {
      backgroundColor: palette.card,
      paddingVertical: Spacing.m,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: palette.border,
    },
    input: {
      borderWidth: 1,
      borderColor: palette.border,
      borderRadius: 6,
      padding: Spacing.s,
      marginBottom: Spacing.m,
      backgroundColor: palette.background,
      color: palette.text,
    },
    row: {
      paddingVertical: Spacing.s,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: palette.border,
      backgroundColor: palette.card,
    },
  });

// Custom hook to get the current theme and global styles
export const useTheme = () => {
  const {scheme, palette, styles, override, toggleOverride} =
    useContext(ThemeContext);
  return {scheme, palette, styles, override, setOverride: toggleOverride};
};

import React, { createContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, createGlobalStyles } from '../styles/theme';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const deviceScheme = Appearance.getColorScheme();
  const [override, setOverride] = useState(null);

  // On mount, load saved override
  useEffect(() => {
    AsyncStorage.getItem('themeOverride').then(val => {
      if (val) setOverride(val);
    });
  }, []);

  const scheme = override || deviceScheme || 'light';
  const palette = Colors[scheme];
  const styles = createGlobalStyles(palette);

  const toggleOverride = async (next) => {
    await AsyncStorage.setItem('themeOverride', next);
    setOverride(next);
  };

  return (
    <ThemeContext.Provider value={{ scheme, palette, styles, override, toggleOverride }}>
      {children}
    </ThemeContext.Provider>
  );
};

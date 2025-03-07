import React, { createContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemTheme = useColorScheme(); // Thème du système
  const [theme, setTheme] = useState(systemTheme); // Thème actif

  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await AsyncStorage.getItem('theme');
      if (storedTheme) {
        setTheme(storedTheme);
      } else {
        setTheme(systemTheme);
      }
    };
    loadTheme();
  }, [systemTheme]);

  const toggleTheme = async (selectedTheme) => {
    setTheme(selectedTheme);
    await AsyncStorage.setItem('theme', selectedTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

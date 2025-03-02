import React, { createContext, useState, useContext } from "react";
import { Provider as PaperProvider, DefaultTheme, DarkTheme } from "react-native-paper";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  const theme = darkMode ? DarkTheme : DefaultTheme;

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      <PaperProvider theme={theme}>{children}</PaperProvider>
    </ThemeContext.Provider>
  );
};

// Hook personnalisé pour accéder au thème
export const useTheme = () => useContext(ThemeContext);

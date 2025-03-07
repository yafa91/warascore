import { Context, createContext } from "react";

type ThemeContextType = {
  isDarkmode: boolean;
  setIsDarkmode: (prev: boolean) => void;
  useDeviceSetting: boolean;
  setUseDeviceSetting: (prev: boolean) => void;
};

const ThemeContext: Context<ThemeContextType> = createContext<ThemeContextType>(
  {
    isDarkmode: false,
    useDeviceSetting: true,
    setIsDarkmode: () => {},
    setUseDeviceSetting: () => {},
  }
);

export const ThemeProvider = ThemeContext.Provider;
export const ThemeConsumer = ThemeContext.Consumer;

export default ThemeContext
import { useContext } from "react";
import ThemeContext from "@/utils/context/theme";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";

export default () => {
  const themeContext = useContext(ThemeContext);
  if (!themeContext)
    throw new Error("This hook should be used within ThemeProvider");

  return {
    ...themeContext,
    colors: themeContext.isDarkmode ? DarkTheme.colors : DefaultTheme.colors,
  };
};
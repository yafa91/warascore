import React from "react";
import { View, Switch, Text } from "react-native";
import { useTheme } from "../context/ThemeContext"; // Import corrigé
import { Appbar, List } from "react-native-paper";

export default function SettingsScreen() {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: darkMode ? "#121212" : "#FFFFFF" }}>
      <Appbar.Header style={{ backgroundColor: darkMode ? "#1E1E1E" : "#F0F0F0" }}>
        <Appbar.Content title="Paramètres" titleStyle={{ color: darkMode ? "#FFFFFF" : "#000000" }} />
      </Appbar.Header>

      <List.Section>
        <List.Subheader style={{ color: darkMode ? "#FFFFFF" : "#000000" }}>Thème</List.Subheader>
        <List.Item
          title="Mode clair / mode sombre"
          titleStyle={{ color: darkMode ? "#FFFFFF" : "#000000" }}
          left={() => <List.Icon icon="weather-sunny" color={darkMode ? "#FFFFFF" : "#000000"} />}
          right={() => <Switch value={darkMode} onValueChange={toggleTheme} />}
        />
      </List.Section>
    </View>
  );
}




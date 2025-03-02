import { View, Text } from "react-native";

export default function NewsPage() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#121212" }}>
      <Text style={{ fontSize: 36 }}></Text>
    </View>
  );
}



import React, { useState } from "react";
import { Switch } from "react-native";
import { Appbar, List, Button } from "react-native-paper";

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <View style={{ flex: 1, backgroundColor: darkMode ? "#121212" : "#FFFFFF" }}>
      {/* Barre de navigation */}
      <Appbar.Header style={{ backgroundColor: darkMode ? "#1E1E1E" : "#F0F0F0" }}>
        <Appbar.Content title="Paramètres" titleStyle={{ color: darkMode ? "#FFFFFF" : "#000000" }} />
      </Appbar.Header>
      
      {/* Section Notifications */}
      <List.Section>
        <List.Subheader style={{ color: darkMode ? "#FFFFFF" : "#000000" }}>Notifications Push</List.Subheader>
        <List.Item
          title="Paramètres de notifications"
          titleStyle={{ color: darkMode ? "#FFFFFF" : "#000000" }}
          left={() => <List.Icon icon="bell-outline" color={darkMode ? "#FFFFFF" : "#000000"} />}
          onPress={() => {}}
        />
      </List.Section>

      {/* Section Utilisateur */}
      <List.Section>
        <List.Subheader style={{ color: darkMode ? "#FFFFFF" : "#000000" }}>Utilisateur</List.Subheader>
        <List.Item
          title="Non connecté"
          titleStyle={{ color: darkMode ? "#FFFFFF" : "#000000" }}
          left={() => <List.Icon icon="account-outline" color={darkMode ? "#FFFFFF" : "#FFFFFF"} />}
          right={() => <Button mode="contained" color={darkMode ? "#FFFFFF" : "#FFFFFF"}>CONNEXION</Button>}
        />
      </List.Section>
      {/* Section Thème */}
      <List.Section>
        <List.Subheader style={{ color: darkMode ? "#FFFFFF" : "#000000" }}>Thème</List.Subheader>
        <List.Item
          title="Mode clair / mode sombre"
          titleStyle={{ color: darkMode ? "#FFFFFF" : "#000000" }}
          left={() => <List.Icon icon="weather-sunny" color={darkMode ? "#FFFFFF" : "#000000"} />}
          right={() => (
            <Switch value={darkMode} onValueChange={() => setDarkMode(!darkMode)} />
          )}
        />
      </List.Section>
    </View>
  );
}




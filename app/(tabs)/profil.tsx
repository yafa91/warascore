import { View, Text, useColorScheme, StyleSheet } from "react-native";


{/*
export default function NewsPage() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#121212" }}>
      <Text style={{ fontSize: 36 }}></Text>
    </View>
  );
}

*/} 



import React, { useContext, useState } from "react";
import { Switch } from "react-native";
import { Appbar, List, Button } from "react-native-paper";
import useTheme from "@/hooks/use-theme";
import { ThemeContext, ThemeProvider } from "@/context/ThemeContext";

export default function SettingsScreen() {
  return (
    <ThemeProvider>
      <SettingsContent />
    </ThemeProvider>
  );
}

function SettingsContent() {
  const isdark = useColorScheme() === 'dark';
  /*
  if(isdark){
    console.log('dark');
  }else{
    console.log('light');
  }
    */
  const isDarkmode = useTheme();
  //console.log(isDarkmode);

  if (isDarkmode) {
    console.log('dark');
  } else {
    console.log('light');
  }
  const [darkMode, setDarkMode] = useState(true);

  ///////
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
      <View style={[styles.container, isDark ? styles.dark : styles.light]}>
      <Text style={isDark ? styles.darkText : styles.lightText}>
        Thème actuel : {theme}
      </Text>
      <Button
        mode="contained"
        onPress={() => toggleTheme(isDark ? 'light' : 'dark')}
      >
        {isDark ? 'Passer en Light Mode' : 'Passer en Dark Mode'}
      </Button>
    </View>
    
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dark: {
    backgroundColor: '#333',
  },
  light: {
    backgroundColor: '#fff',
  },
  darkText: {
    color: '#fff',
  },
  lightText: {
    color: '#000',
  },
});





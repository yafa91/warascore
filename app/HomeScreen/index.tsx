import React from 'react'
import {View, Text, StyleSheet} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';

function HomeScreen() {
    return (
      <View>
        <Text>va la bas</Text>
      </View>
    );
  }


  import { ThemeProvider } from "../../context/ThemeContext";
  import SettingsScreen from "../../screens/SettingsScreen";
  
  export default function App() {
    return (
      <ThemeProvider>
        <SettingsScreen />
      </ThemeProvider>
    );
  }
  

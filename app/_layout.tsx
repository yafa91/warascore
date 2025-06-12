import { ThemeProvider } from "@/context/ThemeContext";
import { Stack } from "expo-router/stack";
import { useEffect, useState } from "react";
import { Image, View } from "react-native";
import warasplash from "../assets/images/wara2.png";
import { FavoritesProvider } from "@/context/FavoritesContext";

export default function Layout() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppReady(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);
  if (!appReady) {
    return (
      <View
        style={{
          flex: 1,
        }}
      >
        <Image
          source={warasplash}
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
          }}
          resizeMode="cover"
        />
      </View>
    );
  }
  return (
    <FavoritesProvider>
      <ThemeProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </FavoritesProvider>
  );
}

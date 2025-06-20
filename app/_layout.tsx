import { ThemeProvider } from "@/context/ThemeContext";
import { Stack } from "expo-router/stack";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { FavoritesProvider } from "@/context/FavoritesContext";
import NetInfo from "@react-native-community/netinfo";

export default function Layout() {
  const [appReady, setAppReady] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  const checkConnection = async () => {
    setChecking(true);
    const state = await NetInfo.fetch();
    setIsConnected(state.isConnected && state.isInternetReachable);
    setChecking(false);
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected && state.isInternetReachable);
    });

    const timer = setTimeout(() => {
      setAppReady(true);
    }, 1000);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  if (!appReady) {
    return (
      <View style={styles.splashContainer}>
        <Text style={styles.splashText}>WaraScore</Text>
      </View>
    );
  }

  if (isConnected === false) {
    return (
      <View style={styles.offlineContainer}>
        <Text style={styles.offlineText}>
          Pas de connexion internet. Veuillez vérifier votre réseau.
        </Text>
        <TouchableOpacity
          onPress={checkConnection}
          style={styles.retryButton}
          disabled={checking}
        >
          <Text style={styles.retryButtonText}>
            {checking ? "Vérification..." : "Réessayer"}
          </Text>
        </TouchableOpacity>
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

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  splashText: {
    color: "#fff",
    fontWeight: "400",
    fontSize: Math.min(width * 0.15, 60),
  },
  offlineContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  offlineText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "red",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

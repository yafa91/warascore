import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import NetInfo from '@react-native-community/netinfo';

export default function NetworkOverlay() {
  const [isConnected, setIsConnected] = useState(true);
  const [retryKey, setRetryKey] = useState(0); 

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected && state.isInternetReachable);
    });

    return () => unsubscribe();
  }, [retryKey]);

  const handleRetry = () => {
    setRetryKey((prev) => prev + 1);
  };

  if (isConnected) return null;

  return (
    <View style={styles.overlay}>
      <Text style={styles.title}>Aucune connexion Internet</Text>
      <Text style={styles.subtitle}>Veuillez vérifier votre réseau</Text>
      <TouchableOpacity onPress={handleRetry} style={styles.button}>
        <Text style={styles.buttonText}>Ressayer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    padding: 20,
  },
  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    color: "#aaa",
    fontSize: 14,
    marginBottom: 30,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#f33",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

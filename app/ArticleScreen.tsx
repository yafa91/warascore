import { router, useLocalSearchParams } from 'expo-router';
import React, { useLayoutEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ArticleScreen = () => {
  const { url }: { url: string } = useLocalSearchParams();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerTitleAlign: "center",
      headerStyle: {
        backgroundColor: "#121212",
      },
      headerTitleStyle: {
        color: "white",
        fontWeight: "bold",
        fontSize: 18,
      },
      headerLeft: () => (
        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      ),
      headerShown: true,
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: url }}
        startInLoadingState={true}
        renderLoading={() => (
          <ActivityIndicator size="large" color="#1e90ff" style={{ flex: 1 }} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ArticleScreen;

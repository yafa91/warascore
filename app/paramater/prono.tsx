import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const WaraScoreScreen = () => {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Mes pronos",
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 10 }}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      ),
      headerShown: true,
    });
  }, [navigation]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.container}>
    <Text style={styles.text}>Pas encore de pronostics à afficher !</Text>
   </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',   
    alignItems: 'center',
   },
  text: {
    color: 'white',
    fontSize: 16,
  },
});

export default WaraScoreScreen;


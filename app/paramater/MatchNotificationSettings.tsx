import React, { useLayoutEffect, useState } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const MatchNotificationSettings = () => {
  const navigation = useNavigation();

  const [switches, setSwitches] = useState({
    debut: true,
    miTemps: true,
    goal: true,
    redCard: true,
    fin: true,
    media: true,
    rappel: true,
    lineups: true,
    penaltyManque: true,
  });

  const toggleSwitch = (key: string) => {
    setSwitches(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Notifications de match",
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
    <ScrollView style={styles.container}>
      {Object.entries({
        debut: 'Début',
        miTemps: 'Mi-temps',
        goal: 'But',
        redCard: 'Carton rouge',
        fin: 'Fin',
        media: 'Contenus média',
        rappel: 'Rappel de match',
        lineups: 'Compositions',
        penaltyManque: 'Penalty manqué',
      }).map(([key, label]) => (
        <View key={key} style={styles.row}>
          <Text style={styles.label}>{label}</Text>
          <Switch
            value={switches[key as keyof typeof switches]}
            onValueChange={() => toggleSwitch(key)}
            trackColor={{ false: '#3a3a3a', true: '#6a74ff' }}
            thumbColor={'#f4f3f4'}
          />
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
    flex: 1,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomColor: '#2a2a2a',
    borderBottomWidth: 1,
  },
  label: {
    color: 'white',
    fontSize: 16,
  },
});

export default MatchNotificationSettings;

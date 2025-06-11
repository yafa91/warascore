import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import axios from 'axios';
import moment from 'moment';
import { useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const API_URL = 'https://v3.football.api-sports.io/fixtures';
const API_KEY = 'b8b570d6f3ff7a8653dee3fb8922d929';

export default function ProgrammeTVScreen() {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Programme TV",
      headerTitleAlign: "center",
      headerStyle: { backgroundColor: "#121212" },
      headerTitleStyle: { color: "white", fontWeight: "bold", fontSize: 18 },
      headerLeft: () => (
        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      ),
      headerShown: true
    });
  }, [navigation]);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const today = moment().format('YYYY-MM-DD');
      const tomorrow = moment().add(1, 'day').format('YYYY-MM-DD');

      // Matchs en live
      const liveRes = await axios.get(`${API_URL}?live=all`, {
        headers: { 'x-apisports-key': API_KEY },
      });

      const liveData = liveRes.data.response.filter(
        (item) =>
          Array.isArray(item.fixture.broadcasts) &&
          item.fixture.broadcasts.length > 0
      );

      // Matchs à venir (aujourd'hui et demain)
      const upcomingRes = await axios.get(`${API_URL}?from=${today}&to=${tomorrow}`, {
        headers: { 'x-apisports-key': API_KEY },
      });

      const upcomingData = upcomingRes.data.response.filter(
        (item) =>
          Array.isArray(item.fixture.broadcasts) &&
          item.fixture.broadcasts.length > 0
      );

      // Fusionner et trier par date
      const allMatches = [...liveData, ...upcomingData].sort(
        (a, b) => new Date(a.fixture.date) - new Date(b.fixture.date)
      );

      setFixtures(allMatches);
    } catch (error) {
      console.error('Erreur lors de la récupération des matchs :', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Chargement des matchs TV...</Text>
      </View>
    );
  }

  if (fixtures.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Aucune chaîne trouvée pour les matchs aujourd'hui ou en direct.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📺 Matchs TV (Live + À venir)</Text>
      <FlatList
        data={fixtures}
        keyExtractor={(item) => item.fixture.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.match}>
              {item.teams.home.name} vs {item.teams.away.name}
            </Text>
            <Text style={styles.time}>
              🕒 {moment(item.fixture.date).format('DD/MM HH:mm')}
            </Text>
            <Text style={styles.channel}>
              📺 {item.fixture.broadcasts.map((b) => b.station).join(', ')}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  title: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
  },
  match: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  time: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 2,
  },
  channel: {
    color: '#00bfff',
    fontSize: 15,
    marginTop: 6,
    fontWeight: 'bold',
  },
});

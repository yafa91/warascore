import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';

const LiveNowScreen = () => {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    fetchLiveMatches();
  }, []);

  const fetchLiveMatches = async () => {
    try {
      const response = await axios.get('https://api.football-data.org/v2/matches?status=LIVE', {
        headers: { 'X-Auth-Token': '26ed6598240b4a39b1522f826539b998' },
      });
      setMatches(response.data.matches);
    } catch (error) {
      console.error(error);
    }
  };

  const renderMatchCard = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => console.log('Navigate to details')}>
      <Text style={styles.league}>{item.competition?.name || 'League'}</Text>
      <View style={styles.matchRow}>
        <View style={styles.teamContainer}>
          <Image source={{ uri: item.homeTeam?.crest || 'https://via.placeholder.com/30' }} style={styles.logo} />
          <Text style={styles.teamName}>{item.homeTeam?.name || 'Home'}</Text>
        </View>
        <Text style={styles.score}>{item.score?.fullTime?.homeTeam ?? 0} - {item.score?.fullTime?.awayTeam ?? 0}</Text>
        <View style={styles.teamContainer}>
          <Image source={{ uri: item.awayTeam?.crest || 'https://via.placeholder.com/30' }} style={styles.logo} />
          <Text style={styles.teamName}>{item.awayTeam?.name || 'Away'}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.detailsButton} onPress={() => console.log('Details clicked')}>
        <Text style={styles.detailsText}>Details</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#121212' }}>
      <FlatList
        data={matches}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderMatchCard}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 10,
  },
  card: {
    backgroundColor: '#1c1c1e',
    padding: 15,
    marginVertical: 10,
    borderRadius: 15,
  },
  league: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  matchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    marginBottom: 5,
  },
  teamName: {
    color: '#fff',
    fontSize: 14,
  },
  score: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  detailsButton: {
    marginTop: 15,
    backgroundColor: '#e63946',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  detailsText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default LiveNowScreen;

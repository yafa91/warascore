import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { useRoute } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLayoutEffect } from 'react';
import { useRef } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";

const API_KEY = "b8b570d6f3ff7a8653dee3fb8922d929";


export default function MatchDetails() {
  const { matchId } = useLocalSearchParams();
  const [stats, setStats] = useState(null);
  const [fixture, setFixture] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
  navigation.setOptions({
    headerTitle: "",
    headerTitleAlign: "center",
    headerStyle: { backgroundColor: "#121212" },
    headerTitleStyle: { color: "white", fontWeight: "bold", fontSize: 18 },
    headerLeft: () => (
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 10 }}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
    ),
    headerRight: () => (
      <TouchableOpacity onPress={() => {
        console.log("Match ajouté aux favoris ou notification activée");
      }} style={{ marginRight: 10 }}>
        <Ionicons name="notifications-outline" size={24} color="white" />
      </TouchableOpacity>
    ),
    headerShown: true,
  });
}, [navigation]);

useLayoutEffect(() => {
  navigation.setOptions({
    headerTitle: '',
    headerTitleAlign: 'center',
    headerStyle: {
      backgroundColor: '#121212',
    },
    headerTitleStyle: {
      color: 'white',
      fontWeight: 'bold',
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

useEffect(() => {
  let intervalId;

  const fetchMatchDetails = async () => {
    try {
      const fixtureRes = await fetch(
        `https://v3.football.api-sports.io/fixtures?id=${matchId}`,
        { headers: { "x-apisports-key": API_KEY } }
      );
      const fixtureData = await fixtureRes.json();
      if (!fixtureData.response.length) return setLoading(false);

      setFixture(fixtureData.response[0]);

      const [statsRes, eventsRes] = await Promise.all([
        fetch(
          `https://v3.football.api-sports.io/fixtures/statistics?fixture=${matchId}`,
          { headers: { "x-apisports-key": API_KEY } }
        ),
        fetch(
          `https://v3.football.api-sports.io/fixtures/events?fixture=${matchId}`,
          { headers: { "x-apisports-key": API_KEY } }
        ),
      ]);

      const statsData = await statsRes.json();
      const eventsData = await eventsRes.json();

      if (!statsData.response.length) return setLoading(false);

      const [homeStats, awayStats] = statsData.response;

      const getStat = (teamStats, type) =>
        teamStats.statistics.find((s) => s.type === type)?.value ?? 0;

      const yellowCards = eventsData.response.filter(
        (e) => e.type === "Card" && e.detail === "Yellow Card"
      );
      const redCards = eventsData.response.filter(
        (e) => e.type === "Card" && e.detail === "Red Card"
      );

      setStats({
        possession: {
          home: parseInt(getStat(homeStats, "Ball Possession")) || 0,
          away: parseInt(getStat(awayStats, "Ball Possession")) || 0,
        },
        totalShots: {
          home: getStat(homeStats, "Total Shots"),
          away: getStat(awayStats, "Total Shots"),
        },
        shotsOnTarget: {
          home: getStat(homeStats, "Shots on Goal"),
          away: getStat(awayStats, "Shots on Goal"),
        },
        corners: {
          home: getStat(homeStats, "Corner Kicks"),
          away: getStat(awayStats, "Corner Kicks"),
        },
        fouls: {
          home: getStat(homeStats, "Fouls"),
          away: getStat(awayStats, "Fouls"),
        },
        offsides: {
          home: getStat(homeStats, "Offsides"),
          away: getStat(awayStats, "Offsides"),
        },
        yellowCards: {
          home: yellowCards.filter((c) => c.team.name === homeStats.team.name).length,
          away: yellowCards.filter((c) => c.team.name === awayStats.team.name).length,
        },
        redCards: {
          home: redCards.filter((c) => c.team.name === homeStats.team.name).length,
          away: redCards.filter((c) => c.team.name === awayStats.team.name).length,
        },
        passSuccess: {
          home: parseInt(getStat(homeStats, "Passes %")) || 0,
          away: parseInt(getStat(awayStats, "Passes %")) || 0,
        },
      });

      setEvents(eventsData.response);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (matchId) {
    fetchMatchDetails();

    intervalId = setInterval(() => {
      fetchMatchDetails();
    }, 30000);
  }

  return () => clearInterval(intervalId);
}, [matchId]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#f33" />
        <Text style={{ color: "#fff", marginTop: 10 }}>Chargement...</Text>
      </View>
    );
  }

  if (!fixture || !stats) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: "#fff" }}>Aucune donnée disponible.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <MatchCard fixture={fixture} events={events} />
      <Text style={styles.sectionTitle}>Statistiques</Text>
      <StatRow label="Possession de balle" home={stats.possession.home} away={stats.possession.away} isPercent />
      <StatRow label="Tirs totaux" home={stats.totalShots.home} away={stats.totalShots.away} />
      <StatRow label="Tirs cadrés" home={stats.shotsOnTarget.home} away={stats.shotsOnTarget.away} />
      <StatRow label="Corners" home={stats.corners.home} away={stats.corners.away} />
      <StatRow label="Fautes" home={stats.fouls.home} away={stats.fouls.away} />
      <StatRow label="Hors-jeu" home={stats.offsides.home} away={stats.offsides.away} />
      <StatRow label="Cartons jaunes" home={stats.yellowCards.home} away={stats.yellowCards.away} />
      <StatRow label="Cartons rouges" home={stats.redCards.home} away={stats.redCards.away} />
      <StatRow label="Passes réussies" home={stats.passSuccess.home} away={stats.passSuccess.away} isPercent />
    </ScrollView>
  );
}

const MatchCard = ({ fixture, events }) => {
  const { teams, goals, league, fixture: fix } = fixture;

  const now = new Date();
  const fixtureStartTime = new Date(fix.date); 
  const secondsElapsed = Math.floor((now - fixtureStartTime) / 1000); 

const currentMinute = fix.status.elapsed;
const extraMinute = fix.status.extra;

const displayMinute = currentMinute !== null 
  ? (extraMinute ? `${currentMinute}+${extraMinute}` : `${currentMinute}`) 
  : null;



const secondsAhead = 3;
const hasUpcomingGoal = events.some((event) => {
  if (event.type !== "Goal" || !event.time.elapsed) return false;
  const eventSeconds = event.time.elapsed * 60 + (event.time.extra ?? 0);
  return eventSeconds > secondsElapsed && eventSeconds <= secondsElapsed + 3;
});

  const isPenaltyShootout = fix.status.short === "P" || fix.status.long === "Penalty Shootout";

const homeGoals = events.filter(
  (e) =>
    e.type === "Goal" &&
    e.team.id === teams.home.id &&
    (!isPenaltyShootout || e.detail !== "Penalty")
);

const awayGoals = events.filter(
  (e) =>
    e.type === "Goal" &&
    e.team.id === teams.away.id &&
    (!isPenaltyShootout || e.detail !== "Penalty")
);

  return (
    <View style={styles.card}>
      <View style={styles.leagueContainer}>
        <Image source={{ uri: league.logo }} style={styles.leagueLogo} />
        <Text style={styles.league}>{league.name}</Text>
      </View>

      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>
          {fix.status.short === "HT"
            ? "Mi-temps"
            : currentMinute !== null
            ? `${currentMinute}'`
            : fix.status.long}
        </Text>
      </View>

      <View style={styles.teamsRow}>
        <View style={styles.teamContainer}>
          <Image source={{ uri: teams.home.logo }} style={styles.teamLogo} />
          <Text style={styles.teamName}>{teams.home.name}</Text>

<View style={{ height: 8 }} />

{homeGoals.map((goal, i) => (
   <Text key={`home-goal-${i}`} style={styles.goalEvent}>
  ⚽ {goal.player.name} - {goal.time.elapsed}{goal.time.extra ? `+${goal.time.extra}` : ''}'
</Text>
))}
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.score}>{goals.home ?? 0}</Text>
          <Text style={styles.scoreSeparator}> - </Text>
          <Text style={styles.score}>{goals.away ?? 0}</Text>
        </View>

        <View style={styles.teamContainer}>
          <Image source={{ uri: teams.away.logo }} style={styles.teamLogo} />
           <Text style={styles.teamName}>{teams.away.name}</Text>

<View style={{ height: 8 }} />

{awayGoals.map((goal, i) => (
   <Text key={`away-goal-${i}`} style={styles.goalEvent}>
  ⚽ {goal.player.name} - {goal.time.elapsed}{goal.time.extra ? `+${goal.time.extra}` : ''}'
</Text>
))}

        </View>
      </View>
        
      {hasUpcomingGoal && (
        <View style={{ marginTop: 10 }}>
          <Text style={{ color: "#FFD700", fontWeight: "bold", textAlign: "center" }}>
            🔥 Grosse occasion de but !
          </Text>
        </View>
      )}
    </View>
  );
};

const StatRow = ({ label, home, away, isPercent }) => {
  const total = Number(home) + Number(away);
  const homeWidth = total ? (Number(home) / total) * 100 : 50;
  const awayWidth = 100 - homeWidth;

  return (
    <View style={{ marginBottom: -15 }}>
      <Text style={styles.statLabelTitle}>{label}</Text>
      <View style={styles.statRow}>
        <Text style={styles.teamStat}>{isPercent ? `${home}%` : home}</Text>
        <View style={styles.statBarContainer}>
          <View style={[styles.bar, { width: `${homeWidth}%`, backgroundColor: "#F54040" }]} />
          <View style={[styles.bar, { width: `${awayWidth}%`, backgroundColor: "#FEFEFE" }]} />
        </View>
        <Text style={styles.teamStat}>{isPercent ? `${away}%` : away}</Text>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 15,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  card: {
    backgroundColor: "#222",
    padding: 6,
    borderRadius: 10,
    marginBottom: 20,
  },
  league: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  timeContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  timeText: {
    color: "#f33",
    fontSize: 16,
    fontWeight: "600",
  },
  teamsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    alignSelf: "stretch",
  },
  teamContainer: {
    flex: 4,
    alignItems: "center",
  },
  teamLogo: {
    width: 40,
    height: 40,
    resizeMode: "contain",
    marginBottom: 6,
  },
  teamName: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 2,
  },
  score: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 56,
  },
  scoreSeparator: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "bold",
    marginHorizontal: 5,
    marginBottom: 56, 
  },
 goalEvent: {
  color: "#fff",
  fontSize: 11,
  marginBottom: 3,
  textAlign: "center",
  fontStyle: "italic",
  textShadowColor: "#000",
  textShadowOffset: { width: 0.5, height: 0.5 },
  textShadowRadius: 1,
},
  sectionTitle: {
    color: "#f33",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  statBarContainer: {
    flex: 1,
    height: 12,
    flexDirection: "row",
    backgroundColor: "#333",
    borderRadius: 6,
    overflow: "hidden",
    marginHorizontal: 10,
    position: "relative",
  },
  bar: {
    height: 12,
  },
  statLabel: {
    position: "absolute",
    width: "100%",
    textAlign: "center",
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
    top: -16,
  },
  teamStat: {
    color: "#fff",
    width: 40,
    textAlign: "center",
  },
  statLabelTitle: {
  color: "#fff",
  fontSize: 14,
  marginBottom: 5,
  textAlign: "center",
},

});

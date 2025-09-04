import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const translateTeamName = (name: string) => {
  const translations: { [key: string]: string } = {
    "Paris Saint Germain": "PSG",
    "Manchester United": "Man United",
  
  };
  return translations[name] || name;
};

export default function MatchCard({ item }: { item: any }) {
  const router = useRouter();

  const { teams, goals, league, fixture } = item;

  const handlePress = () => {
    router.push(`/MatchDetailsScreen/${fixture.id}`);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.header}>
        <Image source={{ uri: league.logo }} style={styles.leagueLogo} />
        <Text style={styles.leagueText}>{league.name}</Text>
      </View>

      <View style={styles.teamsRow}>
        <View style={styles.team}>
          <Image source={{ uri: teams.home.logo }} style={styles.teamLogo} />
          <Text style={styles.teamName}>{translateTeamName(teams.home.name)}</Text>
        </View>

        <Text style={styles.score}>
          {goals.home !== null ? goals.home : "-"} - {goals.away !== null ? goals.away : "-"}
        </Text>

        <View style={styles.team}>
          <Image source={{ uri: teams.away.logo }} style={styles.teamLogo} />
          <Text style={styles.teamName}>{translateTeamName(teams.away.name)}</Text>
        </View>
      </View>

      <Text style={styles.dateText}>{new Date(fixture.date).toLocaleString("fr-FR")}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  leagueLogo: {
    width: 18,
    height: 18,
    marginRight: 6,
  },
  leagueText: {
    color: "#aaa",
    fontSize: 12,
  },
  teamsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  team: {
    flexDirection: "row",
    alignItems: "center",
    width: "40%",
  },
  teamLogo: {
    width: 24,
    height: 24,
    marginRight: 6,
  },
  teamName: {
    color: "#fff",
    fontSize: 14,
    flexShrink: 1,
  },
  score: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  dateText: {
    color: "#777",
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
});

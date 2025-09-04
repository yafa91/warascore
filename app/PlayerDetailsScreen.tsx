import React, { useEffect, useState, useLayoutEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";

const API_KEY = "b8b570d6f3ff7a8653dee3fb8922d929";

export default function PlayerDetailsScreen() {
  const { playerId, teamId, season: seasonParam } = useLocalSearchParams();
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const season = currentMonth < 7 ? currentYear - 1 : currentYear;

  
  const [playerStats, setPlayerStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerTitleAlign: "center",
      headerStyle: { backgroundColor: "#121212" },
      headerTitleStyle: { color: "white", fontWeight: "bold", fontSize: 18 },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginLeft: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      ),
      headerShown: true,
    });
  }, [navigation]);

  function translatePosition(position: string | null | undefined) {
  switch (position) {
    case "Goalkeeper":
      return "Gardien";
    case "Defender":
      return "Défenseur";
    case "Midfielder":
      return "Milieu de terrain";
    case "Attacker":
      return "Attaquant";
    default:
      return position ?? "N/A";
  }
}

  useEffect(() => {
    const fetchPlayerStats = async () => {
      try {
        const res = await fetch(
          `https://v3.football.api-sports.io/players?id=${playerId}&team=${teamId}&season=${season}`,
          {
            headers: { "x-apisports-key": API_KEY },
          }
        );
        const data = await res.json();
        setPlayerStats(data.response[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayerStats();
  }, [playerId, teamId, season]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#f33" />
      </View>
    );
  }

  if (!playerStats) {
    return <Text style={styles.error}>Aucune donnée disponible.</Text>;
  }

  const stats = playerStats.statistics?.[0];

  if (!stats) {
  return <Text style={styles.error}>Statistiques indisponibles.</Text>;
 }

  const player = playerStats.player;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ alignItems: "center", paddingBottom: 40 }}>
      <Image source={{ uri: player.photo }} style={styles.photo} />
      <Text style={styles.name}>{player.name}</Text>

      <View style={styles.infoRow}>
        <MaterialCommunityIcons name="account" size={20} color="#f33" />
        <Text style={styles.infoText}>Âge : {player.age ?? "N/A"}</Text>
      </View>
      <View style={styles.infoRow}>
        <FontAwesome5 name="flag" size={20} color="#f33" />
        <Text style={styles.infoText}>Nationalité : {player.nationality ?? "N/A"}</Text>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="football" size={20} color="#f33" />
       <Text style={styles.infoText}>Poste : {translatePosition(stats.games.position)}</Text>
      </View>
      <View style={styles.infoRow}>
      </View>

      <View style={styles.separator} />

      {/* Stats */}
      <StatRow icon="checkmark-done-circle" label="Matchs joués" value={stats.games.appearences} />
      <StatRow icon="timer" label="Minutes jouées" value={stats.games.minutes} />
      <StatRow icon="football" label="Buts" value={stats.goals.total} />
      <StatRow icon="medal" label="Passes décisives" value={stats.goals.assists ?? 0} />
      <StatRow icon="eye-outline" label="Tirs cadrés" value={stats.shots.on ?? 0} />
      <StatRow icon="swap-vertical" label="Passes clés" value={stats.passes.key ?? 0} />
      <StatRow
        icon="stats-chart"
        label="Ratio buts/match"
        value={
          stats.goals.total && stats.games.appearences
            ? ((stats.goals.total / stats.games.appearences).toFixed(2))
            : "0.00"
        }
      />
    </ScrollView>
  );
}

function StatRow({ icon, label, value, color = "#aaa" }: { icon: string; label: string; value: any; color?: string }) {
  return (
    <View style={styles.statRow}>
      <Ionicons name={icon as any} size={22} color={color} style={{ width: 30 }} />
      <Text style={[styles.statText, { color }]}>{label} : {value ?? 0}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#121212" },
  error: { color: "#fff", textAlign: "center", marginTop: 20 },
  photo: {
    width: 130,
    height: 130,
    borderRadius: 65,
    marginTop: 25,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#f33",
  },
  name: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  infoText: {
    color: "#ddd",
    fontSize: 16,
    marginLeft: 8,
  },
  separator: {
    borderBottomColor: "#444",
    borderBottomWidth: 1,
    width: "90%",
    marginVertical: 20,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
    paddingHorizontal: 20,
    width: "100%",
  },
  statText: {
    fontSize: 17,
    marginLeft: 12,
  },
});

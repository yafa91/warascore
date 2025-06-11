import React, { useContext, useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { ThemeContext } from "@/context/ThemeContext";

type Match = {
  fixture: {
    id: number;
    date: string;
    status: { short: string; elapsed: number | null };
  };
  league: {
    id: number;
    name: string;
    logo: string;
  };
  teams: {
    home: { name: string; logo: string };
    away: { name: string; logo: string };
  };
  goals: {
    home: number;
    away: number;
  };
};

export default function FavoritesScreen() {
  const [favoriteMatches, setFavoriteMatches] = useState<Match[]>([]);
  const { theme } = useContext(ThemeContext);
  const router = useRouter();

  const fetchFavoriteMatches = async () => {
    try {
      const stored = await AsyncStorage.getItem("favorites");
      const ids: number[] = stored ? JSON.parse(stored) : [];

      if (ids.length === 0) {
        setFavoriteMatches([]);
        return;
      }

      const responses = await Promise.all(
        ids.map((id) =>
          fetch(`https://v3.football.api-sports.io/fixtures?id=${id}`, {
            headers: {
              "x-apisports-key": "b8b570d6f3ff7a8653dee3fb8922d929",
            },
          }).then((res) => res.json())
        )
      );

      const matches = responses
        .map((res) => res.response[0])
        .filter((match) => !!match);

      setFavoriteMatches(matches);
    } catch (error) {
      console.error("Erreur chargement favoris :", error);
    }
  };

  useEffect(() => {
    fetchFavoriteMatches();
  }, []);

  const renderMatch = ({ item }: { item: Match }) => {
    const time = new Date(item.fixture.date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <TouchableOpacity
        onPress={() => router.push(`/MatchDetailsScreen/${item.fixture.id}`)}
        style={styles.card}
      >
        <View style={styles.row}>
          <Image source={{ uri: item.teams.home.logo }} style={styles.logo} />
          <Text style={styles.team}>{item.teams.home.name}</Text>
          <Text style={styles.score}>
            {item.goals.home} - {item.goals.away}
          </Text>
          <Text style={styles.team}>{item.teams.away.name}</Text>
          <Image source={{ uri: item.teams.away.logo }} style={styles.logo} />
        </View>
        <View style={styles.rowBottom}>
          <Image source={{ uri: item.league.logo }} style={styles.leagueLogo} />
          <Text style={styles.league}>{item.league.name}</Text>
          <Text style={styles.time}>{time}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#121212" }}>
      <Text style={styles.header}>Favoris</Text>
      <FlatList
        data={favoriteMatches}
        keyExtractor={(item) => item.fixture.id.toString()}
        renderItem={renderMatch}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aucun match ajouté aux favoris</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  card: {
    backgroundColor: "#222",
    marginHorizontal: 15,
    marginVertical: 8,
    padding: 15,
    borderRadius: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowBottom: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    justifyContent: "space-between",
  },
  logo: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  leagueLogo: {
    width: 20,
    height: 20,
    resizeMode: "contain",
    marginRight: 5,
  },
  team: {
    color: "#fff",
    fontSize: 14,
    flex: 1,
    textAlign: "center",
  },
  score: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    width: 50,
    textAlign: "center",
  },
  league: {
    color: "#aaa",
    fontSize: 12,
    flex: 1,
  },
  time: {
    color: "#ccc",
    fontSize: 12,
  },
  empty: {
    marginTop: 50,
    alignItems: "center",
  },
  emptyText: {
    color: "#888",
    fontSize: 16,
  },
});

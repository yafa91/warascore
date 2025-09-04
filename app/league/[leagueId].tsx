import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const translateTeamName = (name: string) => {
  const translations: { [key: string]: string } = {
    "Paris Saint Germain": "PSG",
    "Manchester United": "Man United",
    "Al-Hilal Saudi FC": "Al Hilal",
    "Germany W": "Allemagne",
    "Paris Saint-Germain": "PSG",
    "Olympique de Marseille": "OM",
    "Borussia Dortmund": "Dortmund",
    "Cambodia": "Cambodge",
    "Saudi Arabia": "Arabie Saoudite",
    "RB Leipzig": "Leipzig",
    "England W": "Angleterre",
    "France W": "France",
    "Bayer Leverkusen": "Leverkusen",
    "Arsenal FC": "Arsenal",
    "Chelsea FC": "Chelsea",
    "Liverpool FC": "Liverpool",
    "Manchester City": "Man City",
    "Belgium W": "Belgique",
    "Spain W": "Espagne",
    "Italy W": "Italie",
    "England": "Angleterre",
    "Eintracht Frankfurt": "Francfort",
    "VfL Wolfsburg": "Wolfsburg",
    "Portugal W": "Portugal",
    "West Ham United": "West Ham",
    "Inter Miami CF": "Inter Miami",
    "Brazil": "Brésil",
    "Argentina": "Argentine",
    "Newcastle United": "Newcastle",
    "Bayern München": "Bayern",
    "São Paulo FC": "São Paulo",
    "Japan": "Japon",
    "South Korea": "Corée du Sud",
    "United States": "États-Unis",
    "Mexico": "Mexique",
    "Australia": "Australie",
    "Canada": "Canada",
    "Netherlands": "Pays-Bas",
    "Olympiacos FC": "Olympiakos",
    "Panathinaikos FC": "Panathinaikos",
    "AEK Athens FC": "AEK Athènes",
    "Croatia": "Croatie",
    "Napoli": "Naples",
    "Switzerland W": "Suisse",
    "Iceland W": "Islande",
    "Poland W": "Pologne",
    "Norway W": "Norvège", 
    "Finland W": "Finlande",
    "Serbia": "Serbie",
    "Turkey": "Turquie",
    "Iran": "Iran",
    "Djurgardens IF": "Djurgarden",
    "Ghana": "Ghana",
    "Cameroon": "Cameroun",
    "Netherlands W": "Pays-Bas",
    "Sweden W": "Suisse",
    "Uzbekistan": "Ouzbekistant",
    "Wales W": "Pays de Galles",
    "Ivory Coast": "Côte d'Ivoire",
    "Nigeria": "Nigéria",
    "South Africa": "Afrique du Sud",
    "China": "Chine",
    "Qatar": "Qatar",
    "Egypt": "Égypte",
    "Tunisia": "Tunisie",
    "Algeria": "Algérie",
    "Uruguay": "Uruguay",
    "Morocco": "Maroc",
    "Grêmio": "Grêmio",
    "Atlético Mineiro": "Atlético MG",
    "Internacional": "Internacional",
    "Santos FC": "Santos",
    "Al-Nassr FC": "Al Nassr",
    "Al-Ittihad Club": "Al Ittihad",
    "Al-Ahli Saudi FC": "Al Ahli",
    "Denmark W": "Danemark",
    "Malmo FF": "Malmo",
    "IF Brommapojkarna": "Brommapojkarna",
    "PSV Eindhoven": "PSV",
    "Senegal": "Sénégal",
  };
  return translations[name] || name;
};

const API_KEY = "b8b570d6f3ff7a8653dee3fb8922d929";

type Match = any;
type Scorer = any;

export default function LeagueUpcomingMatches() {
  const { leagueId } = useLocalSearchParams<{ leagueId: string }>();
  const [matches, setMatches] = useState<Match[]>([]);
  const [scorers, setScorers] = useState<Scorer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"matches" | "scorers">("matches");
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

 useEffect(() => {
  setLoading(true);

  const fetchUpcomingMatches = async () => {
    try {
      const res = await fetch(
        `https://v3.football.api-sports.io/fixtures?league=${leagueId}&next=25`,
        {
          headers: {
            "x-apisports-key": API_KEY,
          },
        }
      );
      const data = await res.json();
      setMatches(data.response);
    } catch (error) {
      console.error(error);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };
const fetchTopScorers = async () => {
  try {
    const currentSeason = new Date().getFullYear(); 

    const res = await fetch(
      `https://v3.football.api-sports.io/players/topscorers?league=${leagueId}&season=${currentSeason}`,
      {
        headers: {
          "x-apisports-key": API_KEY,
        },
      }
    );
    const data = await res.json();
    setScorers(data.response);
  } catch (error) {
    console.error(error);
    setScorers([]);
  } finally {
    setLoading(false);
  }
};

  if (leagueId) {
    if (activeTab === "matches") {
      fetchUpcomingMatches();
    } else {
      fetchTopScorers();
    }
  }
}, [leagueId, activeTab]);

  
  const handlePress = (fixtureId: number) => {
    router.push(`/MatchDetailsScreen/${fixtureId}`);
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#f33" />
        <Text style={{ color: "#fff", marginTop: 10 }}>
          Chargement en cours...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Onglets */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "matches" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("matches")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "matches" && styles.activeTabText,
            ]}
          >
            Prochains matchs
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "scorers" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("scorers")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "scorers" && styles.activeTabText,
            ]}
          >
            Meilleurs buteurs
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenu onglets */}
      {activeTab === "matches" ? (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.fixture.id.toString()}
          renderItem={({ item }) => {
            const matchDate = new Date(item.fixture.date);
            const formattedDate = matchDate.toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => handlePress(item.fixture.id)}
                activeOpacity={0.8}
              >
                <View style={styles.teamContainer}>
                  <Image
                    source={{ uri: item.teams.home.logo }}
                    style={styles.teamLogo}
                  />
                 <Text style={styles.teamName}>{translateTeamName(item.teams.home.name)}</Text>
                </View>

                <View style={styles.middleContainer}>
                  <Text style={styles.vs}>VS</Text>
                  <Text style={styles.matchDate}>{formattedDate}</Text>
                </View>

                <View style={styles.teamContainer}>
                  <Image
                    source={{ uri: item.teams.away.logo }}
                    style={styles.teamLogo}
                  />
                  <Text style={styles.teamName}>{translateTeamName(item.teams.away.name)}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <Text
              style={{ color: "white", textAlign: "center", marginTop: 20 }}
            >
              Aucun match à venir.
            </Text>
          }
        />
      ) : (
        <FlatList
          data={scorers}
          keyExtractor={(item) => item.player.id.toString()}
          renderItem={({ item }) => (
  <TouchableOpacity
    onPress={() =>
      router.push({
        pathname: "/PlayerDetailsScreen",
        params: {
          playerId: item.player.id,
          teamId: item.statistics[0].team.id,
          season: new Date().getFullYear(),
        },
      })
    }
    style={styles.scorerCard}
  >
    <Image
      source={{ uri: item.player.photo }}
      style={styles.scorerPhoto}
    />
    <View style={{ flex: 1, marginLeft: 10 }}>
      <Text style={styles.scorerName}>{item.player.name}</Text>
      <Text style={styles.scorerTeam}>{item.statistics[0].team.name}</Text>
    </View>
    <Text style={styles.scorerGoals}>{item.statistics[0].goals.total} buts</Text>
  </TouchableOpacity>
)}

          ListEmptyComponent={
            <Text
              style={{ color: "white", textAlign: "center", marginTop: 20 }}
            >
              Aucun meilleur buteur trouvé.
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#121212" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center",  backgroundColor: "#121212"  },
  card: {
    backgroundColor: "#222",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    justifyContent: "space-between",
  },
  teamContainer: {
    flex: 1,
    alignItems: "center",
  },
  teamLogo: {
    width: 40,
    height: 40,
    marginBottom: 6,
    resizeMode: "contain",
  },
  teamName: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
  },
  middleContainer: {
    flex: 1,
    alignItems: "center",
  },
  vs: {
    color: "#666",
    fontSize: 18,
    marginBottom: 6,
  },
  matchDate: {
    color: "#aaa",
    fontSize: 12,
  },
  tabsContainer: {
    flexDirection: "row",
    marginBottom: 15,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    alignItems: "center",
  },
  activeTab: {
    borderBottomColor: "white",
  },
  tabText: {
    color: "#888",
    fontWeight: "600",
    fontSize: 16,
  },
  activeTabText: {
    color: "white",
    fontWeight: "bold",
  },
  scorerCard: {
    backgroundColor: "#222",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
  },
  scorerPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  scorerName: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  scorerTeam: {
    color: "#aaa",
    fontSize: 12,
  },
  scorerGoals: {
    color: "#f33",
    fontWeight: "bold",
    fontSize: 16,
  },
});

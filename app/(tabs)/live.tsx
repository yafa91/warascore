import React, { useEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import * as Notifications from "expo-notifications";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { translateTeamName } from "../../utils/translateTeamName";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  isFavorite,
} from "../../utils/favoriteUtils";
import { useFavorites } from "@/context/FavoritesContext";

const API_KEY = "b8b570d6f3ff7a8653dee3fb8922d929";
const BASE_URL = "https://v3.football.api-sports.io/fixtures";

const leagues = [
  {
    id: 61,
    name: "Ligue 1",
    logo: "https://media.api-sports.io/football/leagues/61.png",
  },
  {
    id: 62,
    name: "Ligue 2 BKT",
    logo: "https://media.api-sports.io/football/leagues/62.png",
  },
  {
    id: 39,
    name: "Premier League",
    logo: "https://media.api-sports.io/football/leagues/39.png",
  },
  {
    id: 78,
    name: "Bundesliga",
    logo: "https://media.api-sports.io/football/leagues/78.png",
  },
  {
    id: 135,
    name: "Serie A",
    logo: "https://media.api-sports.io/football/leagues/135.png",
  },
  {
    id: 140,
    name: "La Liga",
    logo: "https://media.api-sports.io/football/leagues/140.png",
  },
  {
    id: 203,
    name: "Süper Lig",
    logo: "https://media.api-sports.io/football/leagues/203.png",
  },
];

const leagueIdsToInclude = [
  1, 2, 3, 4, 5, 6, 9, 11, 13, 16, 17, 39, 40, 61, 62, 78, 88, 94, 98, 135,
  136, 140, 143, 2000, 2001, 2002, 98, 307, 203, 253, 263, 264, 266, 292, 307,
  848, 210, 30, 15, 858, 36, 34, 31, 894, 32, 239, 859, 38, 131, 141, 240, 329,
  186, 743, 103, 113, 265, 283, 71, 922, 119, 667, 528, 531, 81, 660, 29, 525, 145, 48, 144,
];

export default function LivePage() {
  const navigation = useNavigation();
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("live");
  const [selectedLeagueId, setSelectedLeagueId] = useState(null);
  const { favorites, toggleFavorite: toggleFavoriteContext } = useFavorites();

  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
  let scoresCache = {}; 

  const fetchAndUpdate = async () => {
    try {
      let url = BASE_URL;
      if (viewMode === "live") {
        url += "?live=all";
      } else if (viewMode === "today") {
        const today = new Date().toISOString().split("T")[0];
        url += `?date=${today}`;
      } else if (viewMode === "league" && selectedLeagueId !== null) {
        const today = new Date().toISOString().split("T")[0];
        url += `?date=${today}`;
      }

      const response = await fetch(url, {
        headers: { "x-apisports-key": API_KEY },
      });
      const data = await response.json();
      let filtered = [];

    if (viewMode === "live") {
  const now = new Date();
  filtered = data.response.filter((m) => {
    const matchDate = new Date(m.fixture.date);
    return (
      leagueIdsToInclude.includes(m.league.id) &&
      matchDate <= now && 
      m.fixture.status.short !== "FT" &&
      m.fixture.status.short !== "PST" &&
      m.fixture.status.short !== "CANC"
    );
  });
}
else if (viewMode === "today") {
        filtered = data.response.filter((m) => m.league.id === 61);
      } else if (viewMode === "league" && selectedLeagueId !== null) {
        if (selectedLeagueId === -1) {
          filtered = data.response.filter(
            (m) => !leagueIdsToInclude.includes(m.league.id)
          );
        } else {
          filtered = data.response.filter(
            (m) => m.league.id === selectedLeagueId
          );
        }
      }

      const getMatchPriority = (match) => {
        const round = match.league.round?.toLowerCase() || "";
        const home = match.teams.home.name.toLowerCase();
        const away = match.teams.away.name.toLowerCase();
        const isClassico =
          (home.includes("psg") && away.includes("marseille")) ||
          (home.includes("marseille") && away.includes("psg")) ||
          (home.includes("real madrid") && away.includes("barcelona")) ||
          (home.includes("barcelona") && away.includes("real madrid"));
        const isEquipeDeFrance =
          home.includes("france") || away.includes("france");

        if (isClassico) return 10;
        if (isEquipeDeFrance) return 9;
        if (round.includes("final")) return 3;
        if (round.includes("semi")) return 2;
        if (round.includes("quarter")) return 1;
        return 0;
      };

      filtered.sort((a, b) => {
        const priorityA = getMatchPriority(a);
        const priorityB = getMatchPriority(b);
        if (priorityA !== priorityB) return priorityB - priorityA;

        const totalGoalsA = (a.goals.home || 0) + (a.goals.away || 0);
        const totalGoalsB = (b.goals.home || 0) + (b.goals.away || 0);
        return totalGoalsB - totalGoalsA;
      });

      const currentJson = JSON.stringify(matches);
      const newJson = JSON.stringify(filtered);
      if (currentJson !== newJson) {
        setMatches(filtered);
      }

      const matchNotificationSetting = await AsyncStorage.getItem("matchNotification");
      if (matchNotificationSetting === "true") {
        for (let match of filtered) {
          if (match.fixture.status.short === "NS") continue;
          const matchId = match.fixture.id;
          const currentScore = {
            home: match.goals.home,
            away: match.goals.away,
          };

          const prev = scoresCache[matchId];
          if (
            prev &&
            (currentScore.home !== prev.home ||
              currentScore.away !== prev.away)
          ) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: "⚽ But marqué !",
                body: `${match.teams.home.name} ${currentScore.home} - ${currentScore.away} ${match.teams.away.name}`,
              },
              trigger: null,
            });
          }

          scoresCache[matchId] = currentScore;
        }
      }
    } catch (error) {
      console.error("Erreur fetch & notif:", error);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  fetchAndUpdate();
  const interval = setInterval(() => {
  fetchAndUpdate();
}, viewMode === "live" ? 2000 : 10000);
  return () => clearInterval(interval);
}, [viewMode, selectedLeagueId]);


  const toggleFavorite = async (item: any, isFav: boolean) => {
    try {
      await toggleFavoriteContext(item);
    } catch (error) {
      console.error("Erreur lors de la modification des favoris:", error);
    }
  };
 
  const renderItem = ({ item }) => {
    const { fixture, teams, goals, league } = item;
    const elapsed = fixture.status.elapsed;
    const isFav =
      favorites?.some((fav) => fav.fixture.id === item.fixture.id) || false;
    console.log(translateTeamName(teams.home.name));

    return (
      <TouchableOpacity
        style={styles.matchCard}
        onPress={() => {
          router.push(`/MatchDetailsScreen/${item.fixture.id}`);
        }}
        activeOpacity={0.8}
      >
        <View style={styles.header}>
          <View style={styles.leagueContainer}>
            {league.logo && (
              <Image source={{ uri: league.logo }} style={styles.leagueLogo} />
            )}
            <Text style={styles.league}>{league.name}</Text>
          </View>
          <TouchableOpacity onPress={() => toggleFavorite(item, isFav)}>
            <Feather
              name={isFav ? "star" : "star"}
              size={22}
              color={isFav ? "#FFD700" : "#fff"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.teams}>
          <View style={styles.teamBlock}>
            <Image source={{ uri: teams.home.logo }} style={styles.logo} />
            <Text style={styles.team}>
              {translateTeamName(teams.home.name)}
            </Text>
          </View>

          <View style={styles.centerBlock}>
<Text
  style={[
    styles.time,
    fixture.status.short === "FT"
      ? { color: "#FFFFFF" } 
      : fixture.status.elapsed === null
      ? { color: "#FFFFFF" } 
      : { color: "red" }     
  ]}
>
  {fixture.status.short === "PEN" ? (
    "TAB"
  ) : fixture.status.short === "HT" ? (
    "MT"
  ) : fixture.status.short === "FT" ? (
    "Terminé"
  ) : fixture.status.short === "INT" ? (
    "Interrompu"
  ) : fixture.status.long === "Extra Time" ||
    fixture.status.long === "Prolongation" ? (
    `Prol : ${fixture.status.elapsed}'`
  ) : fixture.status.elapsed !== null ? (
    fixture.status.elapsed <= 45 ? (
      // 1ère mi-temps
      fixture.status.elapsed < 45
        ? `${fixture.status.elapsed}'`
        : `45+'`
    ) : fixture.status.elapsed <= 90 ? (
      // 2ème mi-temps
      fixture.status.elapsed < 90
        ? `${fixture.status.elapsed}'`
        : `90+'`
    ) : (
      // Prolongations
      `${fixture.status.elapsed}'`
    )
  ) : (
    // Avant match → heure de début
    new Date(fixture.date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  )}
</Text>

            <Text style={styles.score}>
              {goals.home} - {goals.away}
            </Text>
          </View>
          <View style={styles.teamBlock}>
            <Image source={{ uri: teams.away.logo }} style={styles.logo} />
            <Text style={styles.team}>
              {translateTeamName(teams.away.name)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View
        style={{ flexDirection: "row", marginBottom: 20, alignItems: "center" }}
      >
        <TouchableOpacity
          style={[styles.button, viewMode === "live" && styles.buttonActive]}
          onPress={() => {
            setSelectedLeagueId(null);
            setViewMode("live");
          }}
        >
          <Animated.View style={[styles.redDot, { opacity: blinkAnim }]} />
          <Text
            style={[
              styles.buttonText,
              viewMode === "live" && styles.buttonTextActive,
            ]}
          >
            Live
          </Text>
        </TouchableOpacity>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginLeft: 10 }}
        >
          {leagues.map((league) => (
            <TouchableOpacity
              key={league.id}
              style={[
                styles.button,
                selectedLeagueId === league.id && styles.buttonActiveWhite,
              ]}
              onPress={() => {
                setSelectedLeagueId(league.id);
                setViewMode("league");
              }}
            >
              <Image
                source={{ uri: league.logo }}
                style={{
                  width: 20,
                  height: 20,
                  marginRight: 6,
                  resizeMode: "contain",
                }}
              />
              <Text
                style={[
                  styles.buttonText,
                  selectedLeagueId === league.id && styles.buttonTextBlack,
                ]}
              >
                {league.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="white"
          style={{ marginTop: 40 }}
        />
        ) : matches.length === 0 ? (
  <View style={{ flex: 1, justifyContent: "flex-start", alignItems: "center", paddingTop: 100,  }}>
    <MaterialCommunityIcons name="soccer" size={55} color="#999" style={{ marginBottom: -25 }} />
    <Text style={styles.emptyText}>Aucun match trouvé.</Text>
  </View>
) : (

        <FlatList
          data={matches}
          keyExtractor={(item) => item.fixture.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "white",
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 25,
    marginRight: 10,
  },
  buttonActive: {
    backgroundColor: "#FF4C4C",
  },
  buttonActiveWhite: {
    backgroundColor: "white",
  },
  buttonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },
  buttonTextActive: {
    color: "white",
  },
  buttonTextBlack: {
    color: "black",
    fontWeight: "bold",
  },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "red",
    marginRight: 6,
  },
  matchCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    padding: 20,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  leagueContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  leagueLogo: {
    width: 29,
    height: 29,
    marginRight: 5,
  },
  league: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  flag: {
    width: 20,
    height: 15,
    resizeMode: "contain",
    borderRadius: 3,
  },
  teams: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  teamBlock: {
    alignItems: "center",
    flex: 1,
  },
  logo: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  team: {
    color: "white",
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },
  centerBlock: {
    alignItems: "center",
    width: 80,
  },
  time: {
    color: "red",
    fontSize: 17,
    marginBottom: 10,
  },
  score: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  list: {
    paddingBottom: 20,
  },
  emptyText: {
    color: "#999",
    fontSize: 16,
    textAlign: "center",
    marginTop: 40,
    fontStyle: "italic",
  },
});

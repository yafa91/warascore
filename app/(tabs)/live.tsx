import React, { useEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Feather";
import { router } from "expo-router";
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    logo: "https://images.app.goo.gl/1bVDg9nmE41mSYw8A",
  },
  {
    id: 62,
    name: "Ligue 2 BKT",
    logo: "https://upload.wikimedia.org/wikipedia/fr/f/f5/Ligue_2_BKT_logo_2020.svg",
  },
  {
    id: 39,
    name: "Premier League",
    logo: "https://upload.wikimedia.org/wikipedia/en/f/f2/Premier_League_Logo.svg",
  },
  {
    id: 78,
    name: "Bundesliga",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Bundesliga_logo_%282017%29.svg",
  },
  {
    id: 135,
    name: "Serie A",
    logo: "https://upload.wikimedia.org/wikipedia/en/9/92/LaLiga_Santander.svg",
  },
  {
    id: 140,
    name: "La Liga",
    logo: "https://upload.wikimedia.org/wikipedia/en/e/e1/Serie_A_logo_%282019%29.svg",
  },
  {
    id: 40,
    name: "Championship",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/1/12/EFL_Championship.svg/1200px-EFL_Championship.svg.png",
  },
];

const leagueIdsToInclude = [
  1, 2, 3, 4, 5, 6, 9, 11, 13, 14, 16, 17, 39, 40, 61, 62, 78, 88, 94, 98, 135,
  136, 140, 143, 2000, 2001, 2002, 98, 307, 203, 253, 263, 264, 266, 292, 307,
  848, 210, 30, 15, 858, 36, 34, 31, 894, 32, 239, 859, 38, 131, 141, 240, 329, 186
];

export default function LivePage() {
  const navigation = useNavigation();
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("live");
  const [selectedLeagueId, setSelectedLeagueId] = useState(null);
  const { favorites, setFavorites, refreshFavorites } = useFavorites();


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
    fetchMatches();
    const interval = setInterval(fetchMatches, 20000);
    return () => clearInterval(interval);
  }, [viewMode, selectedLeagueId]);

 const toggleFavorite = async (item: any, isFav: boolean) => {
  try {
    if (isFav) {
      setFavorites((prev) =>
       prev.filter((fav) => fav.fixture.id !== item.fixture.id)
      );
      await removeFavorite(item);
    } else {
      setFavorites((prev) => [...prev, item]);
      await addFavorite(item);
    }
  } catch (error) {
    console.error("Erreur lors de la modification des favoris:", error);
  }
};

const scoresRef = useRef({});

useEffect(() => {
  const interval = setInterval(async () => {
    try {
      const matchNotificationSetting = await AsyncStorage.getItem('matchNotification');
      if (matchNotificationSetting !== 'true') return;

      const liveMatches = await fetchLiveMatches();

      for (let match of liveMatches) {
        const matchId = match.fixture.id;
        const currentScore = {
          home: match.goals.home,
          away: match.goals.away,
        };

        const prev = scoresRef.current[matchId];
        initializedRef.current = true

        if (
          prev &&
          (currentScore.home !== prev.home || currentScore.away !== prev.away)
        ) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "⚽ But marqué !",
              body: `${match.teams.home.name} ${currentScore.home} - ${currentScore.away} ${match.teams.away.name}`,
            },
            trigger: null,
          });
        }

  
        scoresRef.current[matchId] = currentScore;
      }
    } catch (error) {
      console.error("Erreur dans la notification de but:", error);
    }
  }, 20000);

  return () => clearInterval(interval);
}, []);

  const fetchLiveMatches = async () => {
  try {
    const response = await fetch(`${BASE_URL}?live=all`, {
      headers: { "x-apisports-key": API_KEY },
    });
    const data = await response.json();
    return data.response; 
  } catch (error) {
    console.error("Erreur lors du fetch des matchs live:", error);
    return [];
  }
};

  const fetchMatches = async () => {
    setLoading(true);
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
        filtered = data.response.filter((match) =>
          leagueIdsToInclude.includes(match.league.id)
        );
      } else if (viewMode === "today") {
        filtered = data.response.filter((match) => match.league.id === 61);
      } else if (viewMode === "league" && selectedLeagueId !== null) {
        if (selectedLeagueId === -1) {
          filtered = data.response.filter(
            (match) => !leagueIdsToInclude.includes(match.league.id)
          );
        } else {
          filtered = data.response.filter(
            (match) => match.league.id === selectedLeagueId
          );
        }
      }

      setMatches(filtered);
    } catch (error) {
      console.error("Erreur fetch:", error);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  

  const renderItem = ({ item }) => {
    const { fixture, teams, goals, league } = item;
    const elapsed = fixture.status.elapsed;
    const isFav =
      favorites?.some((fav) => fav.fixture.id === item.fixture.id) || false;

    return (
      <TouchableOpacity
        style={styles.matchCard}
        onPress={() =>
       {
        router.push(`/MatchDetailsScreen/${item.fixture.id}`);
       }
        }
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
            <Icon
              name={isFav ? "bell-off" : "bell"}
              size={20}
              color={isFav ? "red" : "#fff"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.teams}>
          <View style={styles.teamBlock}>
            <Image source={{ uri: teams.home.logo }} style={styles.logo} />
            <Text style={styles.team}>{teams.home.name}</Text>
          </View>

          <View style={styles.centerBlock}>
            <Text style={styles.time}>
  {fixture.status.short === "HT"
    ? "Mi-temps"
    : fixture.status.short === "FT"
    ? "Terminé"
    : fixture.status.short === "INT"
    ? "Interrompu"
    : fixture.status.short === "1H" && fixture.status.elapsed === 45
    ? "45'+"
    : fixture.status.short === "2H" && fixture.status.elapsed === 90
    ? "90'+"
    : fixture.status.elapsed !== null
    ? `${fixture.status.elapsed}'`
    : fixture.status.short}
</Text>
            <Text style={styles.score}>
              {goals.home} - {goals.away}
            </Text>
          </View>

          <View style={styles.teamBlock}>
            <Image source={{ uri: teams.away.logo }} style={styles.logo} />
            <Text style={styles.team}>{teams.away.name}</Text>
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
        <Text style={styles.emptyText}>Aucun match trouvé.</Text>
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
    width: 25,
    height: 25,
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

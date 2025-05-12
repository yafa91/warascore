import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, FlatList } from "react-native";
import { useEffect, useState, useRef, useContext } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import React from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import { ThemeContext } from "@/context/ThemeContext";
import { Animated } from "react-native";


const API_URL = "https://v3.football.api-sports.io/fixtures";
const API_KEY = "b8b570d6f3ff7a8653dee3fb8922d929";

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export function AppContent() {
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [dates, setDates] = useState([]);
  const [matches, setMatches] = useState([]);
  const [favorites, setFavorites] = useState(new Set()); // Utilisation d'un Set pour les favoris
  const scrollX = useRef(new Animated.Value(0)).current;

  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const generateWeekDates = () => {
    const daysOfWeek = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const today = new Date();
    const newDates = [];

    for (let i = 0; i < 7; i++) {
      const nextDate = new Date();
      nextDate.setDate(today.getDate() + i);
      const day = nextDate.getDate().toString().padStart(2, "0");
      const month = (nextDate.getMonth() + 1).toString().padStart(2, "0");
      const dayLabel = daysOfWeek[nextDate.getDay()];
      const formattedDate = nextDate.toISOString().split("T")[0];
      newDates.push({ label: ${dayLabel} ${day}-${month}, value: formattedDate });
    }
    return newDates;
  };

  useEffect(() => {
    setDates(generateWeekDates());
    setSelectedDate(getCurrentDate());
  }, []);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch(${API_URL}?date=${selectedDate}, {
          method: "GET",
          headers: {
            "x-apisports-key": API_KEY,
          },
        });

        const data = await response.json();
        const allMatches = data.response || [];

        setMatches(allMatches);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des matchs :", error);
        setLoading(false);
      }
    };

    fetchMatches();
    const interval = setInterval(fetchMatches, 60000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  const toggleFavorite = (matchId) => {
    setFavorites((prevFavorites) => {
      const newFavorites = new Set(prevFavorites);
      if (newFavorites.has(matchId)) {
        newFavorites.delete(matchId); // Supprime du favori
      } else {
        newFavorites.add(matchId); // Ajoute aux favoris
      }
      return newFavorites;
    });
  };

  const isFavorite = (matchId) => favorites.has(matchId);

  const liveMatches = matches.filter(
    (match) => match.fixture.status.short === "1H" || match.fixture.status.short === "2H"
  );

  return loading ? (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 36 }}>WARASCORE</Text>
    </View>
  ) : (
    <ThemeProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#121212" }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 0, backgroundColor: "#111" }}>
          <Text style={[{ color: "white", fontSize: 30, marginLeft: 19, fontWeight: "900" }]}>WaraScore</Text>
          <View style={{ flexDirection: "row", marginRight: 20, padding: 10 }}>
            <TouchableOpacity>
              <Ionicons name="notifications" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={{ flex: 1, padding: 10 }}>
          <FlatList
            data={dates}
            horizontal
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setSelectedDate(item.value)}
                style={{
                  width: 100,
                  backgroundColor: item.value === selectedDate ? "#f33" : "#333",
                  borderRadius: 10,
                  padding: 10,
                  marginTop: 10,
                  marginLeft: 5,
                }}
              >
                <Text style={{ color: "white", fontSize: 13, fontWeight: "600", textAlign: "center" }}>
                  {item.label.split(" ")[0]}
                </Text>
                <Text style={{ color: "white", fontSize: 13, fontWeight: "600", textAlign: "center" }}>
                  {item.label.split(" ")[1]}
                </Text>
              </TouchableOpacity>
            )}
          />

          {liveMatches.length > 0 && (
            <>
              <Text style={styles.title2}>Live Now</Text>
              <FlatList
                data={liveMatches}
                horizontal
                keyExtractor={(item) => item.fixture.id.toString()}
                renderItem={({ item }) => <LiveScore item={item} />}
              />
            </>
          )}

          <Text style={styles.title2}>Prochains Matchs</Text>
          <FlatList
            data={matches}
            keyExtractor={(item) => item.fixture.id.toString()}
            renderItem={({ item }) => (
              <ScoreList
                item={item}
                onToggleFavorite={toggleFavorite}
                isFavorite={isFavorite(item.fixture.id)}
              />
            )}
          />
        </ScrollView>
      </SafeAreaView>
    </ThemeProvider>
  );
}

const LiveScore = ({ item }) => {
  return (
    <View style={[styles.card, { backgroundColor: "#222" }]}>
      <Text style={styles.league}>{item.league.name}</Text>
      <View style={styles.liveScoreBlock}>
        <View style={styles.liveScoreBlockTeam}>
          <Image source={{ uri: item.teams.home.logo }} style={styles.logoTop} />
          <Text numberOfLines={1} style={[styles.scoreLiveTeamName, { color: "#fff" }]}>{item.teams.home.name}</Text>
        </View>
        <Text style={[styles.liveSCoreScore, { color: "#fff" }]}>{item.goals.home} - {item.goals.away}</Text>
        <View style={styles.liveScoreBlockTeam}>
          <Image source={{ uri: item.teams.away.logo }} style={styles.logoTop} />
          <Text numberOfLines={1} style={[styles.scoreLiveTeamName, { color: "#fff" }]}>{item.teams.away.name}</Text>
        </View>
      </View>
    </View>
  );
};

const ScoreList = ({ item, onToggleFavorite, isFavorite }) => {
  const time = new Date(item.fixture.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <View style={[styles.card2, { backgroundColor: "#222", marginTop: 10 }]}>
      <View style={styles.liveScoreBlock}>
        <View style={{ width: "10%" }}></View>
        <View style={{ width: "70%" }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginLeft: -40 }}>
            <Image source={{ uri: item.teams.home.logo }} style={{ width: 30, height: 37 }} />
            <Text numberOfLines={1} style={{ color: "white", marginLeft: 8, fontSize: 17, fontWeight: "bold" }}>{item.teams.home.name}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 18, marginLeft: -42 }}>
            <Image source={{ uri: item.teams.away.logo }} style={{ width: 33, height: 37 }} />
            <Text numberOfLines={1} style={{ color: "white", marginLeft: 8, fontSize: 17, fontWeight: "bold" }}>{item.teams.away.name}</Text>
          </View>
        </View>
        <View style={{ width: "10%" }}>
          <Text style={{ color: "#fff", marginTop: 2, marginLeft: -9 }}>{time}</Text>
          <TouchableOpacity onPress={() => onToggleFavorite(item.fixture.id)}>
            <Ionicons
              name={isFavorite ? "notifications-circle" : "notifications-outline"}
              size={30}
              color={isFavorite ? "#f33" : "#fff"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 10,
    width: 300,
    maxHeight: 200,
  },
  card2: {
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    marginHorizontal: 10,
    width: "95%",
    marginLeft: 10,
  },
  league: {
    color: "#ffffff",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },
  title2: {
    textAlign: "left",
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 20,
    marginLeft: 4,
  },
  liveScoreBlock: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    margin: 10,
  },
  liveSCoreScore: {
    fontSize: 24,
    fontWeight: "bold",
  },
  liveScoreBlockTeam: {
    width: "40%",
    alignItems: "center",
  },
  logoTop: {
    width: 40,
    height: 40,
  },
  scoreLiveTeamName: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 5,
  },
});
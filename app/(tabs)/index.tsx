import React, { useEffect, useState, useRef, useContext } from "react";
import { Dimensions, Easing } from "react-native";
import { removeFinishedMatchesFromFavorites } from "@/utils/favoriteUtils";
import { FavoritesProvider } from "@/context/FavoritesContext";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ThemeProvider, ThemeContext } from "@/context/ThemeContext";
import { router, useRouter } from "expo-router";
import {
  addFavorite,
  getFavorites,
  isFavorite,
  removeFavorite,
} from "@/utils/favoriteUtils";
import { useFavorites } from "@/context/FavoritesContext";

type Match = {
  fixture: {
    id: number;
    date: string;
    status: { short: string; elapsed: number | null };
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
};

const API_URL = "https://v3.football.api-sports.io/fixtures";
const API_KEY = "b8b570d6f3ff7a8653dee3fb8922d929";

export default function App() {
  return (
    <FavoritesProvider>
      <AppContent />
    </FavoritesProvider>
  );
}


const LiveBadge = () => {
  const pulse = useRef(new Animated.Value(1)).current;
 
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        backgroundColor: "red",
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
        opacity: pulse,
        zIndex: 1,
      }}
    >
      <Text style={{ color: "white", fontWeight: "bold", fontSize: 12 }}>
        LIVE
      </Text>
    </Animated.View>
  );
};

export function AppContent() {
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [dates, setDates] = useState<{ label: string; value: string }[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const { favorites, setFavorites, refreshFavorites } = useFavorites();
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
  removeFinishedMatchesFromFavorites();
}, []);
   


  const getCurrentDate = () => new Date().toISOString().split("T")[0];

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
      const formattedDate = nextDate.toLocaleDateString("fr-CA");

      newDates.push({
        label: `${dayLabel} ${day}-${month}`,
        value: formattedDate,
      });
    }

    return newDates;
  };

  const toggleFavorite = async (item: any, isFav: boolean) => {
    try {
      if (isFav) {
        const response = await removeFavorite(item);
        if (response) {
          await refreshFavorites();
        }
      } else {
        const response = await addFavorite(item);
        if (response) {
          await refreshFavorites();
        }
      }
    } catch (error) {
      console.error("Erreur lors de la modification des favoris:", error);
    }
  };

  useEffect(() => {
    const generatedDates = generateWeekDates();
    setDates(generatedDates);
    setSelectedDate(getCurrentDate());
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

     const fetchMatches = async () => {
  try {
    const response = await fetch(`${API_URL}?date=${selectedDate}`, {
      headers: { "x-apisports-key": API_KEY },
    });

    if (!response.ok) {
      console.warn("API response not OK:", response.status);
      setMatches([]);
      setLoading(false);
      return;
    }
    const data = await response.json();
        const allMatches = data.response || [];

        const europeanLeagues = [
          1, 2, 3, 4, 5, 6, 9, 11, 13, 14, 16, 17, 39, 40, 61, 62, 78, 88, 94,
          98, 135, 136, 140, 143, 2000, 2001, 2002, 203, 253, 263, 264, 266,
          292, 307, 848, 210, 30, 15, 858, 36, 34, 31, 894, 32, 239, 859, 38,
          131, 141, 240, 329, 186
        ];

        const europeanMatches = allMatches.filter((match: Match) =>
          europeanLeagues.includes(match.league.id)
        );

        setMatches(europeanMatches);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des matchs :", error);
        setLoading(false);
      }
    };

    fetchMatches();

    if (selectedDate === getCurrentDate()) {
      interval = setInterval(fetchMatches, 20000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedDate]);

  const now = new Date().getTime();

  const liveMatches = matches.filter((match) => {
    const status = match.fixture.status.short;
    return ["1H", "2H", "ET", "P", "LIVE", "HT", "BT", "INT",].includes(status);
  });

  const upcomingMatches = matches.filter((match) => {
    const matchDate = new Date(match.fixture.date);
    const matchTime = matchDate.getTime();

    const startOfDay = new Date(selectedDate + "T00:00:00").getTime();
    const endOfDay = new Date(selectedDate + "T23:30:00").getTime();
     
    
    return (
      matchTime >= now &&
      matchTime >= startOfDay &&
      matchTime <= endOfDay &&
      !["1H", "2H", "HT", "LIVE"].includes(match.fixture.status.short)
    );
  });
  
 return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#121212" }}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ fontSize: 36, color: "#fff" }}></Text>
        </View>
      ) : (
        <View style={{ flex: 1, backgroundColor: "#121212" }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              padding: 0,
              backgroundColor: "#111",
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 30,
                marginLeft: 19,
                fontWeight: "900",
              }}
            >
              WaraScore
            </Text>
            <View style={{ flexDirection: "row", marginRight: 20, padding: 10 }}>
              <TouchableOpacity onPress={() => router.push("/favoris")}>
                <Ionicons name="notifications" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flex: 1, padding: 10 }}>
            <View style={{ height: 40, width: "100%" }}>
              <FlatList
                data={dates}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => setSelectedDate(item.value)}
                    style={{
                      width: 100,
                      backgroundColor: item.value === selectedDate ? "#f33" : "#333",
                      borderRadius: 10,
                      padding: 10,
                      marginLeft: 5,
                      height: "100%",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "white", fontSize: 13, fontWeight: "600" }}>
                      {item.label.split(" ")[0]}
                    </Text>
                    <Text style={{ color: "white", fontSize: 13, fontWeight: "600" }}>
                      {item.label.split(" ")[1]}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            {liveMatches.length > 0 && (
              <>
                <Text style={styles.title2}>Live Now</Text>
                <View>
                  <FlatList
                    data={liveMatches.slice(0, 4)}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.fixture.id.toString()}
                    renderItem={({ item }) => <LiveScore item={item} />}
                  />
                </View>
              </>
            )}

            <Text style={[styles.title2, { marginTop: 20 }]}>Prochains Matchs</Text>
            <FlatList
              data={upcomingMatches}
              keyExtractor={(item) => item.fixture.id.toString()}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <ScoreList item={item} onToggleFavorite={toggleFavorite} />
              )}
              ListEmptyComponent={() => (
                <View style={{ width: "100%", alignItems: "center", padding: 10 }}>
                  <Text style={{color: "#FFF", fontStyle: "italic"}}>Aucun match à venir</Text>
                </View>
              )}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const teamNamesFR: Record<string, string> = {
  manchesterunited: "Manchester United",
  arsenal: "Arsenal",
  barcelona: "Barcelone",
  parissaintgermain: "Paris Saint-Germain",
  bayernmunich: "Bayern Munich",
  juventus: "Juventus",
  japan: "Japon",
  indonesia: "Indonésie",
};

function normalizeName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .replace(/-/g, "");
}

function translateTeamName(name: string): string {
  const normalized = normalizeName(name);
  return teamNamesFR[normalized] || name;
}

const LiveScore = ({ item }: { item: Match }) => {
  const router = useRouter();
  const handleDetailsPress = () => {
    console.log("Match ID :", item.fixture.id);
    router.push(`/MatchDetailsScreen/${item.fixture.id}`);
  };

  const elapsed = item.fixture.status.elapsed;
  const status = item.fixture.status.short;

  const displayTime =
    status === "INT"
      ? "Interruption"
      : status === "P"
      ? "Tirs au but"
      : status === "HT"
      ? "Mi-temps"
      : status === "1H" && elapsed !== null
      ? elapsed > 45
        ? `45+${elapsed - 45}’`
        : `${elapsed}’`
      : status === "2H" && elapsed !== null
      ? elapsed > 90
        ? `90+${elapsed - 90}’`
        : elapsed === 90
        ? `90+’`
        : `${elapsed}’`
      : elapsed !== null
      ? `${elapsed}’`
      : "";

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: "#222", borderColor: "#F73636", borderWidth: 1 },
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <Image
          source={{ uri: item.league.logo }}
          style={{
            width: 30,
            height: 30,
            resizeMode: "contain",
            marginRight: 8,
          }}
        />
        <Text
          style={[
            styles.league,
            {
              textAlign: "left",
              marginTop: 3,
            },
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.league.name}
        </Text>
      </View>

      <View style={styles.liveScoreBlock}>
        <View style={styles.liveScoreBlockTeam}>
          <Image
            source={{ uri: item.teams.home.logo }}
            style={styles.logoTop}
          />
          <Text numberOfLines={1} style={styles.scoreLiveTeamName}>
            {translateTeamName(item.teams.home.name)}
          </Text>
        </View>

        <View style={{ alignItems: "center" }}>
          <Text style={{ color: "red", fontSize: 16, marginBottom: 6 }}>
            {displayTime}
          </Text>

          <Text style={styles.liveSCoreScore}>
            {item.goals.home} - {item.goals.away}
          </Text>
        </View>

        <View style={styles.liveScoreBlockTeam}>
          <Image
            source={{ uri: item.teams.away.logo }}
            style={styles.logoTop}
          />
          <Text numberOfLines={1} style={styles.scoreLiveTeamName}>
            {translateTeamName(item.teams.away.name)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={handleDetailsPress}
        style={styles.detailsButton}
      >
        <Text style={styles.detailsButtonText}>Details</Text>
      </TouchableOpacity>
    </View>
  );
};

const ScoreList = ({
  item,
  onToggleFavorite,
}: {
  item: Match;
  onToggleFavorite: (match: any, isFav: boolean) => void;
}) => {
  const router = useRouter();
  const { isFavorite } = useFavorites();
  const time = new Date(item.fixture.date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handlePress = () => {
    router.push(
      `MatchDetailsScreen/MatchDetailsScreen/DetailsPro/${item.fixture.id}`
    );
  };

  const isFav = isFavorite(item.fixture.id);

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <View style={[styles.card2, { backgroundColor: "#222", marginTop: 10 }]}>
        <View style={styles.liveScoreBlock}>
          <View style={{ width: "10%" }}></View>
          <View style={{ width: "70%" }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginLeft: -40,
              }}
            >
              <Image
                source={{ uri: item.teams.home.logo }}
                style={{ width: 30, height: 37 }}
              />
              <Text numberOfLines={1} style={styles.teamName}>
                {item.teams.home.name}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 18,
                marginLeft: -42,
              }}
            >
              <Image
                source={{ uri: item.teams.away.logo }}
                style={{ width: 33, height: 37 }}
              />
              <Text numberOfLines={1} style={styles.teamName}>
                {item.teams.away.name}
              </Text>
            </View>
          </View>
          <View style={{ width: "10%" }}>
            <Text style={{ color: "#fff", marginTop: 2, marginLeft: -10 }}>
              {time}
            </Text>
            <TouchableOpacity
              onPress={() => onToggleFavorite(item, isFav)}
              style={{ marginTop: 19, marginLeft: -7 }}
            >
              <Ionicons
                name={isFav ? "notifications-circle" : "notifications-outline"}
                size={30}
                color={isFav ? "#f33" : "#fff"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#222",
    borderRadius: 12,
    padding: 0,
    marginHorizontal: 10,
    width: width * 0.8,
    height: 210,
    justifyContent: "flex-start",
    paddingTop: 10,
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
    fontSize: 25,
    fontWeight: "bold",
    color: "#fff",
  },
  liveScoreBlockTeam: {
    width: "40%",
    alignItems: "center",
  },
  logoTop: {
    width: 28,
    height: 28,
  
  },
  scoreLiveTeamName: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 8,
    color: "#fff",
  },
  teamName: {
    color: "white",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "bold",
  },
  detailsButton: {
    backgroundColor: "#f33",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 30,
    alignSelf: "center",
    marginTop: 10,
  },
  detailsButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});

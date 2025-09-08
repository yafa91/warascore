import React, { useEffect, useState, useRef, useContext } from "react";
import { ScrollView, TextInput } from "react-native";
import { Dimensions, Easing } from "react-native";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useRouter } from "expo-router";
import { useFavorites } from "@/context/FavoritesContext";

interface Team {
  id: number;
  name: string;
  logo: string;
}

interface League {
  id: number;
  name: string;
  logo: string;
  country: string;
  flag: string;
}

interface Match {
  fixture: {
    id: number;
    date: string;
    status: {
      long: string;
      short: string;
      elapsed: number | null;
    };
  };
  teams: {
    home: Team;
    away: Team;
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  league: League;
}

const API_URL = "https://v3.football.api-sports.io/fixtures";
const API_KEY = "b8b570d6f3ff7a8653dee3fb8922d929";

export default function App() {
  return <AppContent />;
}

const LiveBadge = ({ status }: { status: string }) => {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === "LIVE") {
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
    }
  }, [status]);

  const isPending = ["NS", "PST", "TBD", "INT"].includes(status);

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        backgroundColor: isPending ? "#555" : "red",
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
        opacity: status === "LIVE" ? pulse : 1,
        zIndex: 1,
      }}
    >
      <Text style={{ color: "white", fontWeight: "bold", fontSize: 12 }}>
        {isPending ? "EN ATTENTE" : "LIVE"}
      </Text>
    </Animated.View>
  );
};

export function AppContent() {
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>("upcoming");
  const [searchText, setSearchText] = useState("");
  const [finishedMatches, setFinishedMatches] = useState<Match[]>([]);

  const [standings, setStandings] = useState<any[]>([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState<number>(39);
  const today = new Date();
  const currentSeason =
    today.getMonth() + 1 >= 7 ? today.getFullYear() : today.getFullYear() - 1;

  const [selectedSeason, setSelectedSeason] = useState<number>(currentSeason);

  const [loadingStandings, setLoadingStandings] = useState(false);

  const leaguesList = [
    {
      id: 61,
      name: "Ligue 1",
      logo: "https://media.api-sports.io/football/leagues/61.png",
    },
    {
      id: 62,
      name: "Ligue 2",
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
      id: 88,
      name: "Eredivisie",
      logo: "https://media.api-sports.io/football/leagues/88.png",
    },
    {
      id: 253,
      name: "MLS",
      logo: "https://media.api-sports.io/football/leagues/253.png",
    },
  ];

  const [searchResults, setSearchResults] = useState([]);

  const [dates, setDates] = useState<{ label: string; value: string }[]>([]);

  const [matches, setMatches] = useState<Match[]>([]);
  const {
    favorites,
    setFavorites,
    refreshFavorites,
    toggleFavorite: toggleFavoriteContext,
  } = useFavorites();
  const scrollX = useRef(new Animated.Value(0)).current;

  const getCurrentDate = () => new Date().toISOString().split("T")[0];

  const generateWeekDates = () => {
    const daysOfWeek = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const today = new Date();
    const newDates = [];

    for (let i = -2; i <= 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const dayLabel = daysOfWeek[date.getDay()];
      const formattedDate = date.toISOString().split("T")[0];

      let labelPrefix = dayLabel;
      if (i === -2) labelPrefix = "Avant-hier";
      if (i === -1) labelPrefix = "Hier";
      if (i === 0) labelPrefix = "Aujourd'hui";

      newDates.push({
        label: `${labelPrefix} ${day}-${month}`,
        value: formattedDate,
      });
    }

    return newDates;
  };

  useEffect(() => {
    if (selectedDate < getCurrentDate()) {
      setSelectedTab("finished");
    } else {
      setSelectedTab("upcoming");
    }
  }, [selectedDate]);

  const toggleFavorite = async (item: any) => {
    try {
      await toggleFavoriteContext(item);
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
    const fetchStandings = async () => {
      setLoadingStandings(true);
      try {
        const response = await fetch(
          `https://v3.football.api-sports.io/standings?league=${selectedLeagueId}&season=${selectedSeason}`,
          {
            headers: {
              "x-apisports-key": API_KEY,
            },
          }
        );

        const data = await response.json();

        if (
          data.response &&
          data.response.length > 0 &&
          data.response[0].league.standings &&
          data.response[0].league.standings.length > 0
        ) {
          setStandings(data.response[0].league.standings[0]);
        } else {
          setStandings([]);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du classement:", error);
        setStandings([]);
      } finally {
        setLoadingStandings(false);
      }
    };

    if (selectedTab === "classement") {
      fetchStandings();
    }
  }, [selectedTab, selectedLeagueId, selectedSeason]);

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
          131, 141, 240, 329, 186, 743, 103, 113, 265, 283, 71, 922, 119, 667,
          528, 531, 81, 29, 
        ];

        const europeanMatches = allMatches.filter((match: Match) =>
          europeanLeagues.includes(match.league.id)
        );

        setMatches(europeanMatches);

        const finished = europeanMatches.filter((match: Match) => {
          const statusTerminated = ["FT", "AET", "PEN"].includes(
            match.fixture.status.short
          );
          const matchDate = match.fixture.date.split("T")[0];
          return statusTerminated && matchDate === selectedDate;
        });
        setFinishedMatches(finished);
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
    const matchDate = match.fixture.date.split("T")[0];
    return (
      matchDate === getCurrentDate() &&
      ["1H", "2H", "ET", "P", "LIVE", "HT", "BT", "INT"].includes(status)
    );
  });

 const isPriorityMatch = (match: Match) => {
  const round = (match.league.round || "").toLowerCase();
  const home = match.teams.home.name.toLowerCase();
  const away = match.teams.away.name.toLowerCase();

  if (
    round.includes("semi") ||
    round.includes("demi") ||
    round.includes("final")
  ) {
    return true;
  }

  const classicoPairs = [
    ["paris", "marseille"],
    ["real", "barcelona"],
    ["liverpool", "manchester united"],
    ["arsenal", "tottenham"],
    ["inter", "milan"],
    ["juventus", "torino"],
    ["roma", "lazio"],
    ["bayern", "dortmund"],
  ];

  for (const [team1, team2] of classicoPairs) {
    if (
      (home.includes(team1) && away.includes(team2)) ||
      (home.includes(team2) && away.includes(team1))
    ) {
      return true;
    }
  }

  if (home.includes("france") || away.includes("france")) {
    return true;
  }

  return false;
};

  const sortedLiveMatches = [...liveMatches].sort((a, b) => {
    const aPriority = isPriorityMatch(a) ? 0 : 1;
    const bPriority = isPriorityMatch(b) ? 0 : 1;
    return aPriority - bPriority;
  });

  const upcomingMatches = matches.filter((match) => {
    const matchDate = new Date(match.fixture.date);
    const matchTime = matchDate.getTime();

    const finishedMatches = matches.filter((match) => {
      const status = match.fixture.status.short;
      return ["FT", "AET", "PEN"].includes(status);
    });

    const startOfDay = new Date(selectedDate + "T00:00:00").getTime();
    const endOfDay = new Date(selectedDate + "T23:50:00").getTime();

    return (
      matchTime >= now &&
      matchTime >= startOfDay &&
      matchTime <= endOfDay &&
      !["1H", "2H", "HT", "LIVE"].includes(match.fixture.status.short)
    );
  });

  const { width } = Dimensions.get("window");

  const getResponsiveFontSize = (size: number) => {
    if (width < 360) return size * 0.85; 
    if (width > 768) return size * 1.2; 
    return size; 
  };

  const fontSize = getResponsiveFontSize(14);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#121212" }}>
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
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
                fontSize: 28,
                marginTop: 10,
                marginLeft: 12,
                fontWeight: "900",
              }}
            >
              WaraScore
            </Text>
            <View
              style={{ flexDirection: "row", marginRight: 20, padding: 10 }}
            >
              <TouchableOpacity onPress={() => router.push("/search")}>
                <Ionicons name="search" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          {showSearch && (
            <View style={{ marginVertical: 10 }}>
              <TextInput
                placeholder="Rechercher un match"
                placeholderTextColor="#888"
                style={{
                  backgroundColor: "#222",
                  padding: 10,
                  borderRadius: 8,
                  color: "#fff",
                }}
                onChangeText={(text) => {
                  setSearchText(text);

                  if (text.length < 3) {
                    setSearchResults([]);
                    return;
                  }

                  const lowerText = text.toLowerCase();
                  const filteredMatches = matches.filter(
                    (match) =>
                      match.teams.home.name.toLowerCase().includes(lowerText) ||
                      match.teams.away.name.toLowerCase().includes(lowerText) ||
                      match.league?.name?.toLowerCase().includes(lowerText) ||
                      match.fixture?.date?.toLowerCase().includes(lowerText)
                  );
                  setSearchResults(filteredMatches);
                }}
              />

              {searchResults.length > 0 && (
                <FlatList
                  data={searchResults}
                  keyExtractor={(item) => item.fixture.id.toString()}
                  renderItem={({ item }) => <LiveScore item={item} />}
                />
              )}
            </View>
          )}

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
                      backgroundColor:
                        item.value === selectedDate ? "#f33" : "#333",
                      borderRadius: 10,
                      padding: 10,
                      marginLeft: 5,
                      height: "100%",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: 13,
                        fontWeight: "600",
                      }}
                    >
                      {item.label.split(" ")[0]}
                    </Text>
                    <Text
                      style={{
                        color: "white",
                        fontSize: 13,
                        fontWeight: "600",
                      }}
                    >
                      {item.label.split(" ")[1]}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            {liveMatches.length > 0 && (
              <>
                <Text style={styles.title2}>En Direct</Text>
                <View>
                  <FlatList
                    data={sortedLiveMatches.slice(0, 4)}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.fixture.id.toString()}
                    renderItem={({ item }) => <LiveScore item={item} />}
                  />
                </View>
              </>
            )}
            <View style={{ height: 70 }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1 }}
                style={{ marginTop: 20 }}
              >
                {selectedDate >= getCurrentDate() && (
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      alignItems: "center",
                      justifyContent: "center",
                      borderBottomWidth: selectedTab === "upcoming" ? 2 : 0,
                      borderBottomColor: "#E40000",
                    }}
                    onPress={() => setSelectedTab("upcoming")}
                  >
                    <Text
                      style={{ color: "#fff", fontWeight: "bold", fontSize }}
                    >
                      Prochains Matchs
                    </Text>
                  </TouchableOpacity>
                )}

                {finishedMatches.length > 0 && (
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      alignItems: "center",
                      justifyContent: "center",
                      borderBottomWidth: selectedTab === "finished" ? 2 : 0,
                      borderBottomColor: "#E40000",
                    }}
                    onPress={() => setSelectedTab("finished")}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "bold",
                        textAlign: "center",
                        fontSize,
                      }}
                    >
                      Matchs Terminés
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    borderBottomWidth: selectedTab === "classement" ? 2 : 0,
                    borderBottomColor: "#E40000",
                  }}
                  onPress={() => setSelectedTab("classement")}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontWeight: "bold",
                      textAlign: "center",
                      fontSize,
                    }}
                  >
                    Classement
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            <View style={{ flex: 1 }}>
              {selectedTab === "classement" ? (
                <View style={{ minHeight: 98, paddingTop: 10 }}>
                  <FlatList
                    horizontal
                    data={leaguesList}
                    keyExtractor={(item) => item.id.toString()}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                      paddingVertical: 10,
                      paddingHorizontal: 10,
                    }}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedLeagueId(item.id);
                        }}
                        style={{
                          marginRight: 15,
                          backgroundColor:
                            selectedLeagueId === item.id ? "#E40000" : "#222",
                          borderRadius: 10,
                          paddingVertical: 3,
                          paddingHorizontal: 8,
                          flexDirection: "row",
                          alignItems: "center",
                          minHeight: 25,
                        }}
                      >
                        <Image
                          source={{ uri: item.logo }}
                          style={{ width: 20, height: 20, marginRight: 6 }}
                        />
                        <Text style={{ color: "#fff", fontSize: 14 }}>
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />

                  {loadingStandings ? (
                    <Text
                      style={{
                        color: "#fff",
                        textAlign: "center",
                        marginTop: 20,
                      }}
                    >
                      Chargement du classement...
                    </Text>
                  ) : standings.length === 0 ? (
                    <Text
                      style={{
                        color: "#A8A5A5",
                        textAlign: "center",
                        marginTop: 20,
                        fontStyle: "italic",
                      }}
                    >
                      Aucun classement disponible
                    </Text>
                  ) : (
                    <FlatList
                      data={standings}
                      keyExtractor={(item) => item.team.id.toString()}
                      renderItem={({ item }) => (
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            paddingVertical: 10,
                            borderBottomColor: "#333",
                            borderBottomWidth: 1,
                            paddingHorizontal: 10,
                          }}
                        >
                          <Text style={{ color: "#fff", width: 30 }}>
                            {item.rank}
                          </Text>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              flex: 1,
                            }}
                          >
                            <Image
                              source={{ uri: item.team.logo }}
                              style={{ width: 20, height: 20, marginRight: 8 }}
                            />
                            <Text style={{ color: "#fff" }}>
                              {item.team.name}
                            </Text>
                          </View>
                          <Text
                            style={{
                              color: "#fff",
                              width: 30,
                              textAlign: "right",
                            }}
                          >
                            {item.points}
                          </Text>
                        </View>
                      )}
                    />
                  )}
                </View>
              ) : (
                <FlatList
                  style={{ marginBottom: -42 }}
                  data={
                    selectedTab === "upcoming"
                      ? upcomingMatches
                      : finishedMatches
                  }
                  keyExtractor={(item) => item.fixture.id.toString()}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <ScoreList item={item} onToggleFavorite={toggleFavorite} />
                  )}
                  ListEmptyComponent={() => (
                    <View
                      style={{
                        width: "100%",
                        alignItems: "center",
                        padding: 10,
                      }}
                    >
                      <Text style={{ color: "#A8A5A5", fontStyle: "italic" }}>
                        Aucun match{" "}
                        {selectedTab === "upcoming" ? "à venir" : "terminé"}
                      </Text>
                    </View>
                  )}
                />
              )}
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const translateTeamName = (name: string) => {
  const translations: { [key: string]: string } = {
    "Paris Saint Germain": "PSG",
    "Manchester United": "Man United",
    "Al-Hilal Saudi FC": "Al Hilal",
    "Universidad de Concepcion": "U. de Concepcion",
    "Mali W": "Mali",
    "South Africa W": "Afrique du Sud",
    "Maccabi Tel Aviv": "M. Tel Aviv",
    "Red Bull Salzburg": "RB Salzburg ",
    "Ghana W": "Ghana",
    "FC Botosani": "Botosani",
    "Nottingham Forest": "Nottingham",
    "Tanzania W": "Tanzanie",
    "Rot-Weiß Essen": "RW Essen",
    "NK Slaven Belupo": "Slaven",
    "Union La Calera": "U. Calera",
    "Mineros de Zacatecas": "Mineros",
    "HNK Rijeka": "Rijeka",
    "Stade Brestois 29": "Brest",
    "Los Angeles Galaxy": "LA Galaxy",
    "HNK Hajduk Split": "Hajduk",
    "Istra 1961": "Istra",
    "Dinamo Bucuresti": "D. Bucarest",
    "Everton de Vina": "Everton",
    "Atletico Madrid": "Atl. Madrid",
    "Independiente Medellin": "Ind. Medellin",
    "FK Zalgiris Vilnius": "FK Zalgiris",
    "Hamrun Spartans": "Hamrun",
    "Los Angeles FC": "LAFC",
    "Deportes Copiapo": "Copiapo",
    "Bogota FC": "Bogota",
    "Brown DE Adrogue": "Brown Adrogue",
    "Santiago Morning": "S.Morning",
    "Germany": "Allemagne",
    "FC Copenhagen": "Copenhague",
    "Poland W": "Pologne",
    "Netherlands W": "Pays-Bas",
    "Fortaleza FC": "Fortaleza",
    "Hammarby FF": "Hammarby",
    "Nigeria W": "Nigeria",
    "Zambia W": "Zambie",
    "Kristiansund BK": "Kristiansund",
    "BK Hacken": "Hacken",
    "Sweden W": "Suède",
    "Sweden": "Suède",
    "Sevilla": "FC Séville",
    "Athletic Club": "Ath. Bilbao",
    "SC Braga": "Braga",
    "Belgium W": "Belgique",
    "Denmark W": "Danemark",
    "Universidad de Chile": "U.de Chile",
    "Germany W": "Allemagne",
    "Paris Saint-Germain": "PSG",
    "AFC Hermannstadt": "Hermannstadt",
    "AD Ceuta FC": "AD Ceuta",
    "Rangers de Talca": "Rangers Talca",
    "Deportes Santa Cruz": "Santa Cruz",
    "Avispa Fukuoka": "Fukuoka",
    "Shimizu S-pulse": "Shimizu",
    "Yokohama F. Marinos": "Yokohama",
    "Rep. Of Ireland": "Irlande",
    "Hungary": "Hongrie",
    "Austria": "Autriche",
    "Cyprus": "Chypre",
    "San Marino": "Saint-Martin",
    "Kawazaki Frontale": "Kawazaki",
    "Union San Felipe": "San Filipe",
    "Shonan Bellmare": "Shonan",
    "Gangwon FC": "Gangwon",
    "Jeju United FC": "Jeju United",
    "FC Nordsjaelland": "Nordsjaelland",
    "Senegal W": "Sénégal",
    "Pohang Steelers": "Pohang",
    "Jeonbuk Motors": "Jeonbuk",
    "Czech Republic": "République Tchèque",
    "Daejeon Citizen": "Daejeon",
    "Club Brugge KV": "Club Brugge",
    "Borussia Mönchengladbach": "M'gladbach",
    "Lierse Kempenzonen": "k. Lierse SK",
    "Sporting CP": "Sporting",
    "Cerezo Osaka": "C. Osaka",
    "FC Midtjylland": "Midtjylland",
    "San Marcos de Arica": "Arica",
    "Deportivo Laferrere": "Laferrere",
    "Spain W": "Espagne",
    "Valur Reykjavik": "Valur",
    "Olympique de Marseille": "OM",
    "Borussia Dortmund": "Dortmund",
    "Deportes Temuco": "Temuco",
    "Cambodia": "Cambodge",
    "Saudi Arabia": "Arabie Saoudite",
    "Malta": "Malte",
    "Lithuania": "Lituanie",
    "RB Leipzig": "Leipzig",
    "Northern Ireland": "Irlande du Nord",
    "Algeria W": "Algerie",
    "IFK Norrkoping": "Norrkoping",
    "IF Brommapojkarna": "Brommapojkarna",
    "England W": "Angleterre",
    "France W": "France",
    "Rapid Vienna": "Rapid Vienne",
    "Bayer Leverkusen": "Leverkusen",
    "Arsenal FC": "Arsenal",
    "Chelsea FC": "Chelsea",
    "Liverpool FC": "Liverpool",
    "Manchester City": "Man City",
    "Belgium": "Belgique",
    "Spain": "Espagne",
    "Italy W": "Italie",
    "Dinamo Minsk": "Din.Minsk",
    "Inter Club d'Escaldes": "Inter",
    "England": "Angleterre",
    "Eintracht Frankfurt": "Francfort",
    "VfL Wolfsburg": "Wolfsburg",
    "Portugal W": "Portugal",
    "West Ham United": "West Ham",
    "Inter Miami CF": "Inter Miami",
    "Equatorial Guinea": "Guinée Equatoriale",
    "Zambia": "Zambie",
    "Chad": "Tchad",
    "Somalia": "Somalie",
    "Guinea": "Guinée",
    "Guinea-Bissau": "Guinée-Bissau",
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
    "Haverfordwest County AFC": "Haverfordwest",
    "FC Differdange 03": "Differdange",
    "The New Saints": "TNS",
    "Vikingur Gota": "Vikingur",
    "Egnatia Rrogozhinë": "Egnatia",
    "Lincoln Red Imps FC": "Lincoln",
    "Canada": "Canada",
    "Olimpija Ljubljana": "Olimpija",
    "Kairat Almaty": "Kairaty",
    "Seattle Sounders": "Seattle",
    "Columbus Crew": "Columbus",
    "Netherlands": "Pays-Bas",
    "Olympiacos FC": "Olympiakos",
    "Panathinaikos FC": "Panathinaikos",
    "AEK Athens FC": "AEK Athènes",
    "Croatia": "Croatie",
    "CS Constantine": "Constantine",
    "Villa San Carlos": "San Carlos",
    "Napoli": "Naples",
    "Italy": "Italie",
    "Denmark": "Danemark",
    "Scotland": "Ecosse",
    "Estonia": "Estonie",
    "Faroe Islands": "Ile Féroé",
    "Moldova": "Moldavie",
    "Switzerland W": "Suisse",
    "Switzerland": "Suisse",
    "Iceland W": "Islande",
    "Greece": "Grèce",
    "Belarus": "Biélorussie",
    "Iceland": "Islande",
    "Poland": "Pologne",
    "Norway W": "Norvège",
    "Finland W": "Finlande",
    "Serbia": "Serbie",
    "Turkey": "Turquie",
    "Iran": "Iran",
    "Djurgardens IF": "Djurgarden",
    "Morocco W": "Maroc",
    "Ghana": "Ghana",
    "Cameroon": "Cameroun",
    "Uzbekistan": "Ouzbekistant",
    "Wales W": "Pays de Galles",
    "Ivory Coast": "Côte d'Ivoire",
    "Nigeria": "Nigéria",
    "South Africa": "Afrique du Sud",
    "China": "Chine",
    "Qatar": "Qatar",
    "Egypt": "Égypte",
    "Tunisia": "Tunisie",
    "Flora Tallinn": "Flora",
    "Kalju Nomme": "Kalju",
    "Deportivo Armenio": "D. Armenio",
    "Cliftonville FC": "Cliftonville",
    "West Ham United U21": "West Ham 21",
    "Wales": "Pays de Galles",
    "Bulgaria": "Bulgarie",
    "Georgia": "Georgie",
    "Slovakia": "Slovaquie",
    "Slovenia": "Slovenie",
    "Türkiye": "Turquie",
    "Boreham Wood": "Boreham",
    "Algeria": "Algérie",
    "Uruguay": "Uruguay",
    "Hebburn Town": "Hebburn",
    "Deportes Tolima": "D. Tolima",
    "Alianza Petrolera": "Alianza",
    "Spennymoor Town": "Spennymoor",
    "Morocco": "Maroc",
    "Grêmio": "Grêmio",
    "Atlético Mineiro": "Atlético MG",
    "Internacional": "Internacional",
    "Santos FC": "Santos",
    "Al-Nassr FC": "Al Nassr",
    "New York City FC": "New York City",
    "Al-Ittihad Club": "Al Ittihad",
    "Sheriff Tiraspol": "S. Tiraspol",
    "Levski Sofia": "Levski",
    "Zeljeznicar Sarajevo": "Zeljeznicar",
    "CFR 1907 Cluj": "CFR Cluj",
    "Hapoel Beer Sheva": "H. Beer Sheva",
    "St Joseph S Fc": "St Josephs",
    "Comoros":"Comores",
    "Central African Republic": "Centrafique",
    "Al-Ahli Saudi FC": "Al Ahli",
    "Atlètic Club d'Escaldes": "Atletic Escaldes",
    "F91 Dudelange": "Dudelange",
    "PSV Eindhoven": "PSV",
    "Senegal": "Sénégal",
  };
  return translations[name] || name;
};

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
      ? "INT"
      : status === "P"
      ? "TAB"
      : status === "HT"
      ? "MT"
      : status === "PST" && elapsed === null
      ? "EN ATTENTE"
      : status === "PST" && elapsed < 1
      ? "Pause"
      : status === "PST" && elapsed !== null
      ? `${elapsed}’`
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
        {
          backgroundColor: "#222",
          borderColor: "#F73636",
          borderWidth: 1,
          width: 329,
        },
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
          <Text style={{ color: "red", fontSize: 20, marginBottom: 6 }}>
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
  onToggleFavorite: (match: any) => void;
}) => {
  console.log(item);
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

  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    onToggleFavorite(item);
  };

  const finishedMatches = (match: any) => {
    const status = match.fixture.status.short;
    return !["FT", "AET", "PEN"].includes(status);
  };

  const isFav = isFavorite(item.fixture.id);

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <View style={styles.card2}>
        <View style={styles.scoreListContainer}>
          <View style={styles.scoreListTeams}>
            <View style={styles.scoreListTeamRow}>
              <Image
                source={{ uri: item.teams.home.logo }}
                style={styles.scoreListLogo}
              />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  flex: 1,
                }}
              >
                <Text numberOfLines={1} style={styles.teamName}>
                  {translateTeamName(item.teams.home.name)}
                </Text>
                {!finishedMatches(item) && (
                  <Text style={styles.teamName}>{item.goals.home}</Text>
                )}
              </View>
            </View>
            <View style={styles.scoreListTeamRow}>
              <Image
                source={{ uri: item.teams.away.logo }}
                style={styles.scoreListLogo}
              />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  flex: 1,
                }}
              >
                <Text numberOfLines={1} style={styles.teamName}>
                  {translateTeamName(item.teams.away.name)}
                </Text>
                {!finishedMatches(item) && (
                  <Text style={styles.teamName}>{item.goals.away}</Text>
                )}
              </View>
            </View>
          </View>

          {finishedMatches(item) && (
            <View style={styles.scoreListMeta}>
              <Text style={{ color: "#fff", marginBottom: 8, fontSize: 14 }}>
                {time}
              </Text>
              <TouchableOpacity onPress={handleFavoritePress}>
                <Ionicons
                  name={
                    isFav ? "notifications-circle" : "notifications-outline"
                  }
                  size={30}
                  color={isFav ? "#f33" : "#fff"}
                />
              </TouchableOpacity>
            </View>
          )}
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
    backgroundColor: "#222",
    borderRadius: 10,
    marginHorizontal: 10,
    marginTop: 10,
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
    width: 33,
    height: 32,
  },
  scoreLiveTeamName: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 8,
    color: "#fff",
  },
  teamName: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  detailsButton: {
    backgroundColor: "#f33",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 43,
    alignSelf: "center",
    marginTop: 10,
  },
  detailsButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  scoreListContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  scoreListTeams: {
    flex: 1,
    marginRight: 10,
  },
  scoreListTeamRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  scoreListLogo: {
    width: 28,
    height: 28,
    marginRight: 12,
  },
  scoreListMeta: {
    alignItems: "center",
    justifyContent: "center",
  },
});

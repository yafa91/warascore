import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView } from "react-native";
import TeamCompositionField from "../../../../components/TeamCompositionField";
import MatchDetailsTabs from "@/components/MatchDetailsTabs";
import { useFavorites } from "@/context/FavoritesContext";

const API_URL = "https://v3.football.api-sports.io";
const API_KEY = "b8b570d6f3ff7a8653dee3fb8922d929";

const windowWidth = Dimensions.get("window").width;

interface MatchDetails {
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
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
  goals: {
    home: number;
    away: number;
  };
}

export default function DetailsPro() {
  const { id }: { id: string } = useLocalSearchParams();
  const navigation = useNavigation();
  const { isFavorite, toggleFavorite, refreshFavorites } = useFavorites();

  const [matchDetails, setMatchDetails] = useState<MatchDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");

  const [composition, setComposition] = useState({ home: [], away: [] });
  const [compositionLoading, setCompositionLoading] = useState(true);

  const [classement, setClassement] = useState(null);
  const [classementLoading, setClassementLoading] = useState(true);
  const [classementError, setClassementError] = useState(false);

  const [historique, setHistorique] = useState([]);
  const [historiqueLoading, setHistoriqueLoading] = useState(false);
  const [historiqueError, setHistoriqueError] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerTitleAlign: "center",
      headerStyle: { backgroundColor: "#121212" },
      headerTitleStyle: { color: "white", fontWeight: "bold", fontSize: 18 },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginLeft: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={async () => {
            if (
              matchDetails &&
              matchDetails.fixture &&
              matchDetails.fixture.id
            ) {
              await toggleFavorite(matchDetails);
            }
          }}
          style={{ marginRight: 10 }}
        >
          <Ionicons
            name={
              matchDetails &&
              matchDetails.fixture &&
              matchDetails.fixture.id &&
              isFavorite(matchDetails.fixture.id)
                ? "notifications"
                : "notifications-outline"
            }
            size={24}
            color={
              matchDetails &&
              matchDetails.fixture &&
              matchDetails.fixture.id &&
              isFavorite(matchDetails.fixture.id)
                ? "red"
                : "white"
            }
          />
        </TouchableOpacity>
      ),
      headerShown: true,
    });
  }, [navigation, matchDetails, isFavorite, toggleFavorite]);

  useEffect(() => {
    const fetchMatchDetails = async () => {
      try {
        const response = await fetch(`${API_URL}/fixtures?id=${id}`, {
          headers: { "x-apisports-key": API_KEY },
        });
        const data = await response.json();
        setMatchDetails(data.response[0]);
      } catch (error) {
        console.error("Erreur de récupération des détails du match :", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMatchDetails();
  }, [id]);

  useEffect(() => {
    if (!matchDetails) return;

    const fetchLineups = async () => {
      setCompositionLoading(true);
      try {
        const res = await fetch(`${API_URL}/fixtures/lineups?fixture=${id}`, {
          headers: { "x-apisports-key": API_KEY },
        });
        const data = await res.json();
        console.log("Données de composition reçues :", data.response);

        if (data.response.length === 0) {
          setComposition({ home: [], away: [] });
        } else {
          const homeTeam = data.response.find(
            (team) => team.team.id === matchDetails.teams.home.id
          );
          const awayTeam = data.response.find(
            (team) => team.team.id === matchDetails.teams.away.id
          );

          setComposition({
            home: homeTeam?.startXI || [],
            away: awayTeam?.startXI || [],
          });
        }
      } catch (e) {
        console.error("Erreur récupération des lineups :", e);
      } finally {
        setCompositionLoading(false);
      }
    };

    fetchLineups();
  }, [matchDetails, id]);

  useEffect(() => {
    if (!matchDetails) return;

    const fetchHistorique = async () => {
      setHistoriqueLoading(true);
      setHistoriqueError(false);
      try {
        const teamHomeId = matchDetails.teams.home.id;
        const teamAwayId = matchDetails.teams.away.id;
        const res = await fetch(
          `https://v3.football.api-sports.io/fixtures/headtohead?h2h=${teamHomeId}-${teamAwayId}`,
          { headers: { "x-apisports-key": API_KEY } }
        );
        const data = await res.json();

        if (!data.response || data.response.length === 0) {
          setHistorique([]);
          setHistoriqueError(true);
        } else {
          const now = new Date();
          const pastMatches = data.response
            .filter((match) => new Date(match.fixture.date) < now)
            .sort(
              (a, b) => new Date(b.fixture.date) - new Date(a.fixture.date)
            );

          if (pastMatches.length === 0) {
            setHistoriqueError(true);
            setHistorique([]);
          } else {
            setHistorique(pastMatches.slice(0, 7));
          }
        }
      } catch (e) {
        console.error("Erreur historique :", e);
        setHistoriqueError(true);
      } finally {
        setHistoriqueLoading(false);
      }
    };

    fetchHistorique();
  }, [matchDetails]);

  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    if (!matchDetails) return;

    const fetchEvents = async () => {
      setEventsLoading(true);
      try {
        const res = await fetch(`${API_URL}/fixtures/events?fixture=${id}`, {
          headers: { "x-apisports-key": API_KEY },
        });
        const data = await res.json();

        if (data.response && data.response.length > 0) {
          setEvents(data.response);
        } else {
          setEvents([]);
        }
      } catch (e) {
        console.error("Erreur récupération des événements :", e);
        setEvents([]);
      } finally {
        setEventsLoading(false);
      }
    };

    fetchEvents();
  }, [matchDetails, id]);

  useEffect(() => {
    if (!matchDetails) return;
    const leagueId = matchDetails.league.id;
    const season = matchDetails.league.season;

    const fetchClassement = async () => {
      setClassementLoading(true);
      setClassementError(false);
      try {
        const res = await fetch(
          `${API_URL}/standings?league=${leagueId}&season=${season}`,
          {
            headers: { "x-apisports-key": API_KEY },
          }
        );
        const data = await res.json();

        if (!data.response.length) {
          setClassement([]);
          setClassementError(false);
        } else {
          const standingsData = data.response[0].league.standings;

          if (
            Array.isArray(standingsData[0]) &&
            Array.isArray(standingsData[1])
          ) {
            const homeId = matchDetails.teams.home.id;
            const awayId = matchDetails.teams.away.id;

            const relevantGroup = standingsData.find((group) =>
              group.some(
                (team) => team.team.id === homeId || team.team.id === awayId
              )
            );

            if (relevantGroup) {
              setClassement(relevantGroup);
            } else {
              setClassement(standingsData[0]);
            }
          } else {
            setClassement(standingsData[0]);
          }
        }
      } catch (e) {
        console.error("Erreur classement :", e);
        setClassementError(true);
      } finally {
        setClassementLoading(false);
      }
    };

    fetchClassement();
  }, [matchDetails]);

  if (loading || !matchDetails) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        {/* onglets */}
      </ScrollView>
    );
  }

  const venue = matchDetails.fixture.venue;
  const broadcasters = matchDetails.broadcast;

  return (
    <View style={styles.container}>
      <MatchCard fixture={matchDetails} events={[]} />

      <MatchDetailsTabs id={id} />
    </View>
  );
}

const MatchCard = ({ fixture, events }) => {
  const { teams, goals, league, fixture: fix } = fixture;

  const matchDate = new Date(fix.date);
  const formattedDate = matchDate.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const formattedTime = matchDate.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Détecter si le match est en direct selon le statut (ex: 1H, 2H, ET, LIVE)
  const isLive = ["1H", "2H", "ET", "LIVE"].includes(fix.status.short);

  // Temps de jeu affiché uniquement si match en live
  const gameTime =
    isLive && fix.status.elapsed !== null ? `${fix.status.elapsed}'` : "";

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: "#222", borderColor: "#F73636", borderWidth: 1 },
      ]}
    >
      <Text style={styles.league}>{league.name}</Text>

      <View style={styles.timeContainer}>
        {fix.status.short === "HT" ? (
          <Text
            style={[styles.timeText, { fontWeight: "bold", color: "#EFECEC" }]}
          >
            Mi-temps
          </Text>
        ) : (
          <Text style={styles.timeText}>
            {formattedDate} à {formattedTime}
          </Text>
        )}
        {["FT", "AET", "PEN"].includes(fix.status.short) && (
          <Text
            style={[
              styles.timeText,
              { color: "#EFECEC", fontWeight: "bold", marginTop: 4 },
            ]}
          >
            Terminé
          </Text>
        )}
      </View>

      {/* Affichage du temps de jeu uniquement si match en live */}
      {gameTime !== "" && <Text style={styles.playTime}>{gameTime}</Text>}

      <View style={styles.teamsRow}>
        <View style={styles.teamContainer}>
          <Image source={{ uri: teams.home.logo }} style={styles.teamLogo} />
          <Text style={styles.teamName}>{teams.home.name}</Text>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.score}>
            {fix.status.short === "NS" ? "" : goals.home}
          </Text>
          <Text style={styles.scoreSeparator}> - </Text>
          <Text style={styles.score}>
            {fix.status.short === "NS" ? "" : goals.away}
          </Text>
        </View>

        <View style={styles.teamContainer}>
          <Image source={{ uri: teams.away.logo }} style={styles.teamLogo} />
          <Text style={styles.teamName}>{teams.away.name}</Text>
        </View>
      </View>

      <View style={{ marginTop: 10 }}>
        {events
          .filter((e) => e.type === "Goal")
          .map((event, index) => (
            <Text key={index} style={styles.goalEvent}>
              ⚽ {event.player.name} - {event.time.elapsed}'
              {event.assist ? ` (Passeur: ${event.assist.name})` : ""}
            </Text>
          ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  card: {
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.7,
    shadowRadius: 4,
    elevation: 5,
    marginLeft: -7,
    marginRight: -7,
  },
  league: {
    fontSize: 16,
    color: "#ccc",
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  timeContainer: {
    alignItems: "center",
  },
  timeText: {
    color: "#bbb",
    fontSize: 14,
  },
  playTime: {
    color: "#f33",
    fontWeight: "700",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 0,
  },
  teamsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  teamContainer: {
    alignItems: "center",
    width: windowWidth / 3.5,
  },
  teamLogo: {
    width: 50,
    height: 50,
    resizeMode: "contain",
    marginBottom: 5,
  },
  teamName: {
    color: "#eee",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 14,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  score: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FDFDFD",
  },
  scoreSeparator: {
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
    marginHorizontal: 6,
  },
  goalEvent: {
    color: "#f33",
    fontWeight: "600",
    marginTop: 5,
  },

  // Onglets
  tabsContainer: {
    flexDirection: "row",
    marginTop: 0,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
    justifyContent: "space-between",
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    marginHorizontal: -19,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#f33",
    borderBottomWidth: 2,
    paddingHorizontal: 5,
    alignSelf: "center",
  },
  tabText: {
    color: "#aaa",
    fontWeight: "600",
    fontSize: 16,
  },
  tabButton: {
    paddingVertical: 10,
    marginHorizontal: 0,
  },
  activeTabText: {
    color: "#aaa",
    fontWeight: "700",
    fontSize: 18,
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#eee",
    marginTop: 20,
    marginBottom: 15,
  },
  info: {
    color: "#bbb",
    fontSize: 15,
    marginBottom: 3,
  },

  // Composition équipe
  compositionContainer: {
    paddingBottom: 30,
  },
  teamTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f33",
    marginBottom: 8,
    textAlign: "center",
  },
  teamComposition: {
    paddingHorizontal: 15,
  },
  positionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ddd",
    marginBottom: 4,
  },
  playerName: {
    fontSize: 14,
    color: "#bbb",
    marginLeft: 10,
    marginBottom: 2,
  },
  classementRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  classementRowLight: {
    backgroundColor: "#222",
  },
  classementRowDark: {
    backgroundColor: "#1a1a1a",
  },
  classementPos: {
    width: 25,
    color: "#eee",
    fontWeight: "600",
    fontSize: 14,
  },
  classementLogo: {
    width: 26,
    height: 26,
    resizeMode: "contain",
    marginHorizontal: 8,
  },
  classementTeam: {
    flex: 1,
    color: "#ccc",
    fontSize: 14,
  },
  classementPoints: {
    color: "#f33",
    fontWeight: "700",
    fontSize: 14,
  },
  noClassementText: {
    color: "#bbb",
    textAlign: "center",
    marginTop: 20,
    fontSize: 15,
  },
  historiqueRow: {
    padding: 12,
    backgroundColor: "#222",
    marginVertical: 6,
    borderRadius: 6,
  },
  historiqueDate: {
    color: "#bbb",
    marginBottom: 4,
  },
  historiqueTeamsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  historiqueTeam: {
    color: "#eee",
    fontWeight: "600",
    flex: 3,
    textAlign: "center",
  },
  historiqueScore: {
    color: "#FFFFFF",
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  historiqueLeague: {
    color: "#999",
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "right",
  },
  compositionScroll: {
    paddingBottom: 40,
  },
});

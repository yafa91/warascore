import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Button,
  Linking,
} from "react-native";
import React, { useEffect, useState } from "react";
import { translateTeamName } from "../utils/translateTeamName";
import { useLocalSearchParams, useNavigation } from "expo-router";
import TeamCompositionField from "./TeamCompositionField";
import { FontAwesome } from "@expo/vector-icons";
import LivePrediction from "../components/LivePrediction";

interface Team {
  id: number;
  name: string;
  logo: string;
}

interface Fixture {
  id: number;
  date: string;
  venue: {
    name: string;
    city: string;
  };
}

interface MatchDetails {
  fixture: Fixture;
  teams: {
    home: Team;
    away: Team;
  };
  league: {
    id: number;
    season: number;
    name: string;
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  broadcast?: Array<{
    name: string;
  }>;
}

interface LineupPlayer {
  player: {
    id: number;
    name: string;
    number: number;
    pos: string;
    grid: string | null;
  };
}

interface TeamLineup {
  team: Team;
  startXI: LineupPlayer[];
}

interface StandingTeam {
  team: Team;
  points: number;
  fixture?: Fixture;
  goals?: {
    home: number | null;
    away: number | null;
  };
  teams?: {
    home: Team;
    away: Team;
  };
  league?: {
    name: string;
  };
}

interface Stats {
  possession: { home: number; away: number };
  totalShots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
  offsides: { home: number; away: number };
  yellowCards: { home: number; away: number };
  redCards: { home: number; away: number };
  passSuccess: { home: number; away: number };
}

interface TeamStats {
  team: Team;
  statistics: Array<{
    type: string;
    value: string | number | null;
  }>;
}

interface Event {
  type: string;
  detail: string;
  team: Team;
}

const API_URL = "https://v3.football.api-sports.io";
const API_KEY = "b8b570d6f3ff7a8653dee3fb8922d929";
const YOUTUBE_API_KEY = "AIzaSyBBiYopFRSG7cOfZ65fBzDo-t340WBOT84";

const CHANNELS: Record<string, string> = {
  dazn: "UC3ABnxyYGryqn2bSLyQKkYQ",
  //canal: "UC8ggH3zU61XO0nMskSQwZdA",
};

const fetchMatchSummary = async (homeTeam: string, awayTeam: string) => {
  const queries = [
    `résumé de ${homeTeam} vs. ${awayTeam}`,
    `Le résumé de ${homeTeam} / ${awayTeam}`,
  ];

  for (const [key, channelId] of Object.entries(CHANNELS)) {
    for (const q of queries) {
      try {
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(
          q
        )}&channelId=${channelId}&key=${YOUTUBE_API_KEY}`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.items && data.items.length > 0) {
          const videoId = data.items[0].id.videoId;
          return `https://www.youtube.com/watch?v=${videoId}`;
        }
      } catch (e) {
        console.error("Erreur recherche vidéo YouTube :", e);
      }
    }
  }

  return null; // aucun résultat trouvé
};

const parseGrid = (grid: string | null) => {
  if (!grid) {
    return { x: 0, y: 0 };
  }
  const [y, x] = grid.split(":").map(Number);
  return { x, y };
};

const windowWidth = Dimensions.get("window").width;

export default function MatchDetailsTabs({ id }: { id: string }) {
  const navigation = useNavigation();

  const [matchDetails, setMatchDetails] = useState<MatchDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("resume");

  const [composition, setComposition] = useState<{
    home: LineupPlayer[];
    away: LineupPlayer[];
  }>({ home: [], away: [] });
  const [compositionLoading, setCompositionLoading] = useState(true);

  const [classement, setClassement] = useState<StandingTeam[] | null>(null);
  const [classementLoading, setClassementLoading] = useState(true);
  const [classementError, setClassementError] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [events, setEvents] = useState<Event[]>([]);

  const [statJoueurData, setStatJoueurData] = useState(null);
  const [loadingStatJoueur, setLoadingStatJoueur] = useState(false);
  const [errorStatJoueur, setErrorStatJoueur] = useState(null);

  const [historique, setHistorique] = useState<MatchDetails[]>([]);
  const [historiqueLoading, setHistoriqueLoading] = useState(false);
  const [historiqueError, setHistoriqueError] = useState(false);

  const [playerPhotos, setPlayerPhotos] = useState<Record<number, string>>({});

  const [playerStats, setPlayerStats] = useState<Record<number, any>>({});
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

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
    const homeTeam = matchDetails.teams.home.name;
    const awayTeam = matchDetails.teams.away.name;
    console.log(matchDetails.teams);
    loadVideo(homeTeam, awayTeam);
    const fetchLineups = async () => {
      setCompositionLoading(true);
      try {
        const res = await fetch(`${API_URL}/fixtures/lineups?fixture=${id}`, {
          headers: { "x-apisports-key": API_KEY },
        });
        const data = await res.json();
        console.log("Réponse API lineups :", data);

        if (data.response.length === 0) {
          setComposition({ home: [], away: [] });
        } else {
          const homeTeam = data.response.find(
            (team: any) => team.team.id === matchDetails.teams.home.id
          );
          const awayTeam = data.response.find(
            (team: any) => team.team.id === matchDetails.teams.away.id
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
    if (!id) return;

    const fetchPlayerStats = async () => {
      try {
        const res = await fetch(`${API_URL}/fixtures/players?fixture=${id}`, {
          headers: { "x-apisports-key": API_KEY },
        });
        const data = await res.json();

        const stats: Record<number, any> = {};
        data.response.forEach((team: any) => {
          team.players.forEach((p: any) => {
            stats[p.player.id] = p.statistics[0]; // on prend le premier bloc de stats
          });
        });
        setPlayerStats(stats);
      } catch (e) {
        console.error("Erreur récupération stats joueurs :", e);
      }
    };

    fetchPlayerStats();
  }, [id]);

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
            .filter(
              (match: MatchDetails) =>
                match.fixture && new Date(match.fixture.date) < now
            )
            .sort((a: MatchDetails, b: MatchDetails) =>
              a.fixture && b.fixture
                ? new Date(b.fixture.date).getTime() -
                  new Date(a.fixture.date).getTime()
                : 0
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
          setClassement(null);
          setClassementError(true);
        } else {
          const standingsData = data.response[0].league.standings;

          if (
            Array.isArray(standingsData[0]) &&
            Array.isArray(standingsData[1])
          ) {
            const homeId = matchDetails.teams.home.id;
            const awayId = matchDetails.teams.away.id;

            const relevantGroup = standingsData.find((group: StandingTeam[]) =>
              group.some(
                (team: StandingTeam) =>
                  team.team.id === homeId || team.team.id === awayId
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

  useEffect(() => {
    if (activeTab === "statjoueur") {
      setLoadingStatJoueur(true);
      fetch(`${API_URL}?id=${id}`, {
        headers: {
          "x-apisports-key": API_KEY,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.response && data.response.length > 0) {
            setStatJoueurData(data.response[0].players || []);
          } else {
            setStatJoueurData([]);
          }
          setLoadingStatJoueur(false);
        })
        .catch((err) => {
          setErrorStatJoueur("Erreur lors du chargement des stats joueurs");
          setLoadingStatJoueur(false);
        });
    }
  }, [activeTab, id]);

  const loadVideo = async (homeTeam: string, awayTeam: string) => {
    try {
      const url = await fetchMatchSummary(homeTeam, awayTeam);
      console.log(homeTeam, awayTeam);
      console.log("youtube", url);
      setVideoUrl(url); // ← on met à jour le state
    } catch (err) {
      console.error("Erreur fetch vidéo YouTube :", err);
    }
  };

  useEffect(() => {
    let intervalId: any;

    const fetchMatchDetails = async () => {
      try {
        const fixtureRes = await fetch(
          `https://v3.football.api-sports.io/fixtures?id=${id}`,
          { headers: { "x-apisports-key": API_KEY } }
        );
        const fixtureData = await fixtureRes.json();
        if (!fixtureData.response.length) return setLoading(false);

        const [statsRes, eventsRes] = await Promise.all([
          fetch(
            `https://v3.football.api-sports.io/fixtures/statistics?fixture=${id}`,
            { headers: { "x-apisports-key": API_KEY } }
          ),
          fetch(
            `https://v3.football.api-sports.io/fixtures/events?fixture=${id}`,
            { headers: { "x-apisports-key": API_KEY } }
          ),
        ]);

        const statsData = await statsRes.json();
        const eventsData = await eventsRes.json();

        if (!statsData.response.length) return setLoading(false);

        const [homeStats, awayStats]: [TeamStats, TeamStats] =
          statsData.response;

        const getStat = (teamStats: TeamStats, type: string) =>
          teamStats.statistics.find((s) => s.type === type)?.value ?? 0;

        const yellowCards = eventsData.response.filter(
          (e: Event) => e.type === "Card" && e.detail === "Yellow Card"
        );
        const redCards = eventsData.response.filter(
          (e: Event) => e.type === "Card" && e.detail === "Red Card"
        );

        setStats({
          possession: {
            home:
              parseInt(getStat(homeStats, "Ball Possession") as string) || 0,
            away:
              parseInt(getStat(awayStats, "Ball Possession") as string) || 0,
          },
          totalShots: {
            home: getStat(homeStats, "Total Shots") as number,
            away: getStat(awayStats, "Total Shots") as number,
          },
          shotsOnTarget: {
            home: getStat(homeStats, "Shots on Goal") as number,
            away: getStat(awayStats, "Shots on Goal") as number,
          },
          corners: {
            home: getStat(homeStats, "Corner Kicks") as number,
            away: getStat(awayStats, "Corner Kicks") as number,
          },
          fouls: {
            home: getStat(homeStats, "Fouls") as number,
            away: getStat(awayStats, "Fouls") as number,
          },
          offsides: {
            home: getStat(homeStats, "Offsides") as number,
            away: getStat(awayStats, "Offsides") as number,
          },
          yellowCards: {
            home: yellowCards.filter(
              (c: any) => c.team.name === homeStats.team.name
            ).length,
            away: yellowCards.filter(
              (c: any) => c.team.name === awayStats.team.name
            ).length,
          },
          redCards: {
            home: redCards.filter(
              (c: any) => c.team.name === homeStats.team.name
            ).length,
            away: redCards.filter(
              (c: any) => c.team.name === awayStats.team.name
            ).length,
          },
          passSuccess: {
            home: parseInt(getStat(homeStats, "Passes %") as string) || 0,
            away: parseInt(getStat(awayStats, "Passes %") as string) || 0,
          },
        });
        setEvents(eventsData.response);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    if (id) {
      fetchMatchDetails();

      intervalId = setInterval(() => {
        fetchMatchDetails();
      }, 30000);
    }

    return () => clearInterval(intervalId);
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const fetchPlayerPhotos = async () => {
      try {
        const res = await fetch(`${API_URL}/fixtures/players?fixture=${id}`, {
          headers: { "x-apisports-key": API_KEY },
        });
        const data = await res.json();
        const photos: Record<number, string> = {};
        data.response.forEach((team: any) => {
          team.players.forEach((p: any) => {
            photos[p.player.id] = p.player.photo;
          });
        });
        setPlayerPhotos(photos);
      } catch (e) {
        console.error("Erreur récupération photos joueurs :", e);
      }
    };

    fetchPlayerPhotos();
  }, [id]);

  const venue = matchDetails?.fixture.venue;
  const broadcasters = matchDetails?.broadcast;

  if (!id) return null;

  return (
    <>
      {/* Onglets */}
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "resume" && styles.activeTab,
              ]}
              onPress={() => setActiveTab("resume")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "resume" && styles.activeTabText,
                ]}
              >
                Résumé
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "stats" && styles.activeTab,
              ]}
              onPress={() => setActiveTab("stats")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "stats" && styles.activeTabText,
                ]}
              >
                Statistiques
              </Text>
            </TouchableOpacity>

            {matchDetails?.fixture.status.short !== "NS" && (
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === "composition" && styles.activeTab,
                ]}
                onPress={() => setActiveTab("composition")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "composition" && styles.activeTabText,
                  ]}
                >
                  Compos
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "prono" && styles.activeTab,
              ]}
              onPress={() => setActiveTab("prono")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "prono" && styles.activeTabText,
                ]}
              >
                Prono
              </Text>
            </TouchableOpacity>

            {statJoueurData?.length > 0 && (
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === "statjoueur" && styles.activeTab,
                ]}
                onPress={() => setActiveTab("statjoueur")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "statjoueur" && styles.activeTabText,
                  ]}
                >
                  Stats joueurs
                </Text>
              </TouchableOpacity>
            )}

            {classement && classement.length > 0 && (
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === "classement" && styles.activeTab,
                ]}
                onPress={() => setActiveTab("classement")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "classement" && styles.activeTabText,
                  ]}
                >
                  Classement
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "historique" && styles.activeTab,
              ]}
              onPress={() => setActiveTab("historique")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "historique" && styles.activeTabText,
                ]}
              >
                Historiques
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      <View style={{ flex: 1 }}>
        {activeTab === "resume" && (
          <ScrollView style={styles.tabContent}>
            {videoUrl &&
              (() => {
                const videoId = videoUrl.split("v=")[1].split("&")[0];
                const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

                return (
                  <TouchableOpacity
                    style={styles.videoRow}
                    onPress={() => Linking.openURL(videoUrl)}
                  >
                    <View style={styles.thumbnailContainer}>
                      <Image
                        source={{ uri: thumbnailUrl }}
                        style={styles.thumbnailSmall}
                      />
                      <View style={styles.playOverlay}>
                        <Text style={styles.playIcon}>▶</Text>
                      </View>
                    </View>
                    <Text style={styles.videoText}>
                      Voir le résumé sur YouTube
                    </Text>
                  </TouchableOpacity>
                );
              })()}

            {events.length === 0 ? (
              <Text
                style={{
                  padding: 10,
                  fontStyle: "italic",
                  color: "white",
                  marginLeft: 38,
                }}
              >
                Aucun résumé à afficher pour l'instant.
              </Text>
            ) : (
              (() => {
                const sortedEvents = [...events].sort(
                  (a, b) => (a.time?.elapsed ?? 0) - (b.time?.elapsed ?? 0)
                );
                const firstHalfEvents = sortedEvents.filter(
                  (e) => (e.time?.elapsed ?? 0) <= 45
                );
                const secondHalfEvents = sortedEvents.filter(
                  (e) =>
                    (e.time?.elapsed ?? 0) > 45 && (e.time?.elapsed ?? 0) <= 90
                );
                const extraTimeEvents = sortedEvents.filter(
                  (e) => (e.time?.elapsed ?? 0) > 120
                );

                const renderEvent = (event, index) => {
                  const minute = event.time?.elapsed ?? 0;
                  const player = event.player?.name || "";
                  const playerIn = event.player?.name || "";
                  const playerOut = event.assist?.name || "";
                  const teamName = event.team?.name || "";
                  const detail = event.detail || "";

                  let comment = "";
                  let icon = "";

                  switch (event.type) {
                    case "Goal":
                      icon = "⚽️"; // ballon de foot
                      if (
                        detail.toLowerCase().includes("own goal") ||
                        detail.toLowerCase().includes("csc")
                      ) {
                        comment = `${minute}ème minute, but contre son camp pour ${teamName}`;
                      } else if (detail.toLowerCase().includes("penalty")) {
                        comment = `${minute}ème minute, penalty transformé par ${player} pour ${teamName}`;
                      } else {
                        comment = `${minute}ème minute, ${player} marque un but pour ${teamName}`;
                      }
                      break;

                    case "Substitution":
                      icon = "🔄"; // flèches pour changement
                      comment = `${minute}ème minute, changement pour ${teamName} : ${playerOut} est remplacé par ${playerIn}`;
                      break;

                    case "Card":
                      if (detail === "Red Card") {
                        icon = "🟥"; // carré rouge
                        comment = `${minute}ème minute, carton rouge pour ${player} (${teamName})`;
                      } else if (detail === "Yellow Card") {
                        icon = "🟨"; // carré jaune
                        comment = `${minute}ème minute, carton jaune pour ${player} (${teamName})`;
                      } else {
                        icon = "🟦"; // carré bleu ou autre couleur pour les cartons spéciaux
                        comment = `${minute}ème minute, carton ${detail.toLowerCase()} pour ${player} (${teamName})`;
                      }
                      break;

                    case "Offside":
                      icon = "🚩"; // drapeau
                      comment = `${minute}ème minute, hors-jeu signalé pour ${player} (${teamName})`;
                      break;

                    case "Injury":
                      icon = "⚕️"; // symbole médical
                      comment = `${minute}ème minute, blessure pour ${player} (${teamName})`;
                      break;

                    case "Var":
                      icon = "📺"; // TV ou caméra
                      comment = `${minute}ème minute, intervention VAR : ${detail}`;
                      break;

                    case "Penalty":
                      icon = "🎯"; // cible
                      comment = `${minute}ème minute, penalty pour ${teamName} - ${detail}`;
                      break;

                    default:
                      icon = "🔄"; // info
                      comment = `${minute}ème minute, événement : ${event.type} (${detail}) pour ${teamName}`;
                  }

                  const isLeft = index % 2 === 0;

                  const containerStyle = {
                    alignSelf: isLeft ? "flex-start" : "flex-end",
                    backgroundColor: isLeft ? "#222244" : "#442222",
                    borderRadius: 10,
                    marginVertical: 5,
                    paddingVertical: 8,
                    paddingHorizontal: 15,
                    maxWidth: "75%",
                    flexDirection: "row",
                    alignItems: "center",
                  };

                  return (
                    <Text
                      key={index}
                      style={[containerStyle, { color: "white" }]}
                    >
                      {icon} {comment}
                    </Text>
                  );
                };

                return (
                  <>
                    <Text
                      style={{
                        textAlign: "center",
                        marginVertical: 10,
                        fontWeight: "bold",
                        color: "yellow",
                        fontSize: 18,
                      }}
                    >
                      1ère mi-temps
                    </Text>
                    {firstHalfEvents.length > 0 ? (
                      firstHalfEvents.map(renderEvent)
                    ) : (
                      <Text
                        style={{
                          color: "gray",
                          textAlign: "center",
                          marginBottom: 10,
                        }}
                      >
                        Aucun événement
                      </Text>
                    )}

                    <Text
                      style={{
                        textAlign: "center",
                        marginVertical: 10,
                        fontWeight: "bold",
                        color: "yellow",
                        fontSize: 18,
                      }}
                    >
                      2ème mi-temps
                    </Text>
                    {secondHalfEvents.length > 0 ? (
                      secondHalfEvents.map(renderEvent)
                    ) : (
                      <Text
                        style={{
                          color: "gray",
                          textAlign: "center",
                          marginBottom: 10,
                        }}
                      >
                        Aucun événement
                      </Text>
                    )}

                    {extraTimeEvents.length > 0 && (
                      <>
                        <Text
                          style={{
                            textAlign: "center",
                            marginVertical: 10,
                            fontWeight: "bold",
                            color: "yellow",
                            fontSize: 18,
                          }}
                        >
                          Prolongations / Temps additionnel supplémentaire
                        </Text>
                        {extraTimeEvents.map(renderEvent)}
                      </>
                    )}
                  </>
                );
              })()
            )}
          </ScrollView>
        )}

        {activeTab === "statjoueur" && hasStatJoueur && (
          <ScrollView style={{ flex: 1, padding: 10, backgroundColor: "#111" }}>
            {loadingStatJoueur ? (
              <ActivityIndicator
                size="large"
                color="#f33"
                style={{ marginTop: 20 }}
              />
            ) : errorStatJoueur ? (
              <Text
                style={{ color: "red", textAlign: "center", marginTop: 20 }}
              >
                {errorStatJoueur}
              </Text>
            ) : (
              statJoueurData.map((player: any, index: number) => (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                    padding: 10,
                    backgroundColor: "#222",
                    borderRadius: 8,
                  }}
                >
                  <Image
                    source={{ uri: player.player.photo }}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      marginRight: 10,
                    }}
                  />
                  <View>
                    <Text
                      style={{
                        fontWeight: "bold",
                        color: "#ff0",
                        fontSize: 16,
                      }}
                    >
                      {player.player.name}
                    </Text>
                    <Text style={{ color: "white" }}>
                      Minutes jouées :{" "}
                      {player.statistics?.[0]?.games?.minutes ?? "N/A"}
                    </Text>
                    <Text style={{ color: "white" }}>
                      Buts : {player.statistics?.[0]?.goals?.total ?? 0}
                    </Text>
                    <Text style={{ color: "white" }}>
                      Passes décisives :{" "}
                      {player.statistics?.[0]?.passes?.assists ?? 0}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        )}

        {activeTab === "prono" && (
          <ScrollView style={styles.tabContent}>
            {matchDetails ? (
              matchDetails.fixture.status.short === "LIVE" ||
              matchDetails.fixture.status.short === "1H" ||
              matchDetails.fixture.status.short === "2H" ||
              matchDetails.fixture.status.short === "HT" ||
              matchDetails.fixture.status.short === "INT" ||
              matchDetails.fixture.status.short === "NS" ? (
                <LivePrediction
                  matchId={matchDetails.fixture.id}
                  teamHome={matchDetails.teams.home.name}
                  teamAway={matchDetails.teams.away.name}
                  events={events}
                  matchStatus={matchDetails.fixture.status.short}
                  elapsed={matchDetails.fixture.status.elapsed}
                  onResultCheck={() => {}}
                />
              ) : (
                <View style={{ alignItems: "center", padding: 20 }}>
                  <FontAwesome
                    name="trophy"
                    size={50}
                    color="#FFD700"
                    style={{ marginBottom: 10 }}
                  />
                  <Text
                    style={{
                      color: "white",
                      textAlign: "center",
                      fontSize: 16,
                    }}
                  >
                    Le match est terminé.{"\n"}
                    Rends-toi dans le menu "Profil" pour voir tes résultats dans
                    la section "Mes Pronos".
                  </Text>
                </View>
              )
            ) : (
              <Text
                style={{ padding: 10, color: "white", textAlign: "center" }}
              >
                Aucune donnée de match disponible pour afficher un prono.
              </Text>
            )}
          </ScrollView>
        )}

        {activeTab === "stats" &&
          (stats ? (
            <ScrollView>
              <View>
                <Text style={styles.sectionTitle}></Text>
                <StatRow
                  label="Possession de balle"
                  home={stats.possession.home}
                  away={stats.possession.away}
                  isPercent
                />
                <StatRow
                  label="Tirs totaux"
                  home={stats.totalShots.home}
                  away={stats.totalShots.away}
                />
                <StatRow
                  label="Tirs cadrés"
                  home={stats.shotsOnTarget.home}
                  away={stats.shotsOnTarget.away}
                />
                <StatRow
                  label="Corners"
                  home={stats.corners.home}
                  away={stats.corners.away}
                />
                <StatRow
                  label="Fautes"
                  home={stats.fouls.home}
                  away={stats.fouls.away}
                />
                <StatRow
                  label="Hors-jeu"
                  home={stats.offsides.home}
                  away={stats.offsides.away}
                />
                <StatRow
                  label="Cartons jaunes"
                  home={stats.yellowCards.home}
                  away={stats.yellowCards.away}
                />
                <StatRow
                  label="Cartons rouges"
                  home={stats.redCards.home}
                  away={stats.redCards.away}
                />
                <StatRow
                  label="Passes réussies"
                  home={stats.passSuccess.home}
                  away={stats.passSuccess.away}
                  isPercent
                />
              </View>
            </ScrollView>
          ) : (
            <Text style={{ color: "#ccc", textAlign: "center", marginTop: 10 }}>
              Statistiques non disponibles pour le moment.
            </Text>
          ))}

        {activeTab === "composition" &&
          (compositionLoading ? (
            <ActivityIndicator
              size="large"
              color="#f33"
              style={{ marginTop: 20 }}
            />
          ) : composition.home.length === 0 && composition.away.length === 0 ? (
            <View style={styles.compositionContainer}>
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  marginVertical: 16,
                  fontSize: 13,
                  color: "white",
                }}
              >
                La composition n'est pas encore dispo
              </Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.compositionScroll}>
              <View style={styles.compositionContainer}>
                <TeamCompositionField
                  homeTeam={composition.home.map((p) => ({
                    ...p.player,
                    ...parseGrid(p.player.grid),
                    photo: playerPhotos[p.player.id],
                    stats: playerStats[p.player.id],
                  }))}
                  awayTeam={composition.away.map((p) => ({
                    ...p.player,
                    ...parseGrid(p.player.grid),
                    photo: playerPhotos[p.player.id],
                    stats: playerStats[p.player.id],
                  }))}
                />
              </View>
            </ScrollView>
          ))}

        {activeTab === "historique" &&
          (historiqueLoading ? (
            <ActivityIndicator
              size="large"
              color="#f33"
              style={{ marginTop: 20 }}
            />
          ) : historiqueError ? (
            <Text style={styles.noClassementText}>
              Aucun historique disponible pour ces équipes.
            </Text>
          ) : historique.length === 0 ? (
            <Text style={styles.noClassementText}>
              Aucune confrontation récente trouvée.
            </Text>
          ) : (
            <FlatList
              data={historique}
              keyExtractor={(item) => item.fixture.id.toString()}
              renderItem={({ item }) => {
                const dateMatch = new Date(item.fixture.date);
                const dateFormatted = dateMatch.toLocaleDateString("fr-FR");
                const scoreHome = item.goals.home;
                const scoreAway = item.goals.away;

                const scoreDisplay =
                  scoreHome === null || scoreAway === null
                    ? "Score non dispo"
                    : `${scoreHome} - ${scoreAway}`;

                return (
                  <View style={styles.historiqueRow}>
                    <Text style={styles.historiqueDate}>{dateFormatted}</Text>
                    <View style={styles.historiqueTeamsRow}>
                      <Text style={styles.historiqueTeam}>
                        {translateTeamName(item.teams.home.name)}
                      </Text>
                      <Text style={styles.historiqueScore}>
                        {scoreHome} - {scoreAway}
                      </Text>
                      <Text style={styles.historiqueTeam}>
                        {translateTeamName(item.teams.away.name)}
                      </Text>
                    </View>
                    <Text style={styles.historiqueLeague}>
                      {item.league.name}
                    </Text>
                  </View>
                );
              }}
            />
          ))}

        {activeTab === "classement" &&
          (classementLoading ? (
            <ActivityIndicator
              size="large"
              color="#f33"
              style={{ marginTop: 20 }}
            />
          ) : classementError ? (
            <Text style={styles.noClassementText}>
              Aucun classement disponible pour cette compétition.
            </Text>
          ) : (
            <FlatList
              data={classement}
              keyExtractor={(item) => item.team.id.toString()}
              renderItem={({ item, index }) => (
                <View
                  style={[
                    styles.classementRow,
                    index % 2 === 0
                      ? styles.classementRowLight
                      : styles.classementRowDark,
                  ]}
                >
                  <Text style={styles.classementPos}>{index + 1}</Text>
                  <Image
                    source={{ uri: item.team.logo }}
                    style={styles.classementLogo}
                  />
                  <Text style={styles.classementTeam}>
                    {translateTeamName(item.team.name)}
                  </Text>
                  <Text style={styles.classementPoints}>{item.points} pts</Text>
                </View>
              )}
            />
          ))}
      </View>
    </>
  );
}

const StatRow = ({
  label,
  home,
  away,
  isPercent,
}: {
  label: string;
  home: number | string;
  away: number | string;
  isPercent?: boolean;
}) => {
  const total = Number(home) + Number(away);
  const homeWidth = total ? (Number(home) / total) * 100 : 50;
  const awayWidth = 100 - homeWidth;

  return (
    <View style={{ marginBottom: -15 }}>
      <Text style={styles.statLabelTitle}>{label}</Text>
      <View style={styles.statRow}>
        <Text style={styles.teamStat}>{isPercent ? `${home}%` : home}</Text>
        <View style={styles.statBarContainer}>
          <View
            style={[
              styles.bar,
              { width: `${homeWidth}%`, backgroundColor: "#F54040" },
            ]}
          />
          <View
            style={[
              styles.bar,
              { width: `${awayWidth}%`, backgroundColor: "#FEFEFE" },
            ]}
          />
        </View>
        <Text style={styles.teamStat}>{isPercent ? `${away}%` : away}</Text>
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
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  statBarContainer: {
    flex: 1,
    height: 12,
    flexDirection: "row",
    backgroundColor: "#333",
    borderRadius: 6,
    overflow: "hidden",
    marginHorizontal: 10,
    position: "relative",
  },

  statLabelTitle: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 5,
    textAlign: "center",
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
  },
  bar: {
    height: 12,
  },
  statLabel: {
    position: "absolute",
    width: "100%",
    textAlign: "center",
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
    top: -16,
  },
  teamStat: {
    color: "#fff",
    width: 40,
    textAlign: "center",
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
    color: "#f33",
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
    marginTop: -15,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
    height: 50,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 13,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  sectionTitle: {
    color: "#f33",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  activeTab: {
    borderBottomColor: "#FFFFFF",
    borderBottomWidth: 2,
    paddingHorizontal: 3,
    alignSelf: "center",
  },
  tabText: {
    color: "#aaa",
    fontWeight: "600",
    fontSize: 16,
  },
  activeTabText: {
    color: "#aaa",
    fontWeight: "700",
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
    paddingBottom: 30,
  },
  tabContent: { flex: 1, padding: 10 },
  videoRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#222244",
    borderRadius: 8,
  },
  thumbnailContainer: {
    position: "relative",
  },
  thumbnailSmall: {
    width: 120,
    height: 70,
    borderRadius: 6,
  },
  playOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  playIcon: {
    fontSize: 30,
    color: "white",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  videoText: {
    color: "white",
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "500",
    flexShrink: 1,
  },
});

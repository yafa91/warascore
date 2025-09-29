import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { useRoute } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";
import axios from "axios";
import { Animated } from "react-native";
import { useRef } from "react";
import { useNavigation, useRouter } from "expo-router";
import { translateTeamName } from "../../utils/translateTeamName";
import { Ionicons } from "@expo/vector-icons";
import { useLayoutEffect } from "react";
import { Share } from "react-native";
import { useFavorites } from "@/context/FavoritesContext";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import MatchDetailsTabs from "@/components/MatchDetailsTabs";

interface Team {
  id: number;
  name: string;
  logo: string;
}

interface FixtureData {
  id: number;
  date: string;
  venue: {
    name: string;
    city: string;
  };
  status: {
    long: string;
    short: string;
    elapsed: number | null;
    extra?: number | null;
  };
}

interface MatchDetails {
  fixture: FixtureData;
  teams: {
    home: Team;
    away: Team;
  };
  league: {
    id: number;
    name: string;
    logo: string;
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}

interface Event {
  time: {
    elapsed: number;
    extra: number | null;
  };
  team: {
    id: number;
    name: string;
  };
  player: {
    id: number;
    name: string;
  };
  type: string;
  detail: string;
}

interface GoalInfo {
  minutes: string[];
  ownGoal: boolean;
  penalty: boolean;
}

const API_KEY = "b8b570d6f3ff7a8653dee3fb8922d929";

const FlashingText = ({ children }: { children: React.ReactNode }) => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const flash = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    flash.start();
    return () => flash.stop();
  }, [opacity]);

  return (
    <Animated.Text
      style={{
        opacity,
        color: "#FFD700",
        fontWeight: "bold",
        textAlign: "center",
        fontSize: 16,
        textShadowColor: "#000",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
      }}
    >
      {children}
    </Animated.Text>
  );
};

export default function MatchDetails() {
  const { matchId }: { matchId: string } = useLocalSearchParams();
  const [fixture, setFixture] = useState<MatchDetails | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [lastEventTime, setLastEventTime] = useState<number>(0);

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Regarde ce match en direct sur WaraScore ! ⚽️\nhttps://warascore.com/match/${matchId}`,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log("Partagé via", result.activityType);
        } else {
          console.log("Match partagé");
        }
      } else if (result.action === Share.dismissedAction) {
        console.log("Partage annulé");
      }
    } catch (error: any) {
      console.error("Erreur lors du partage :", error.message);
    }
  };

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
        <View style={{ flexDirection: "row", marginRight: 10 }}>
          {/* Bouton partage */}
          <TouchableOpacity
            onPress={() => {
              const url = `https://monapp.com/match/${matchId}`; // <-- adapte cette URL à ton vrai lien
              Share.share({
                message: `Regarde ce match : ${url}`,
                url,
                title: "Partage du match",
              });
            }}
            style={{ marginRight: 15 }}
          >
            <Ionicons name="share-outline" size={24} color="white" />
          </TouchableOpacity>

          {/* Bouton notification */}
          <TouchableOpacity
            onPress={async () => {
              if (fixture) {
                await toggleFavorite(fixture);
              }
            }}
            style={{ marginLeft: 12 }}
          >
            <Ionicons
              name={
                fixture && isFavorite(fixture.fixture.id)
                  ? "star"
                  : "star-outline"
              }
              size={24}
              color="white"
            />
          </TouchableOpacity>
        </View>
      ),
      headerShown: true,
    });
  }, [navigation, matchId, fixture, isFavorite, toggleFavorite]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerTitleAlign: "center",
      headerStyle: {
        backgroundColor: "#121212",
      },
      headerTitleStyle: {
        color: "white",
        fontWeight: "bold",
        fontSize: 18,
      },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginLeft: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      ),
      headerShown: true,
    });
  }, [navigation]);

  useEffect(() => {
  const fetchMatchDetails = async () => {
    try {
      const fixtureRes = await fetch(
        `https://v3.football.api-sports.io/fixtures?id=${matchId}`,
        { headers: { "x-apisports-key": API_KEY } }
      );
      const fixtureData = await fixtureRes.json();
      if (!fixtureData.response.length) {
        setLoading(false);
        return;
      }
      setFixture(fixtureData.response[0]);
      const eventsRes = await fetch(
        `https://v3.football.api-sports.io/fixtures/events?fixture=${matchId}`,
        { headers: { "x-apisports-key": API_KEY } }
      );
      const eventsData = await eventsRes.json();
      const newEvents = eventsData.response.filter((event: Event) => {
        const eventSeconds = (event.time.elapsed ?? 0) * 60 + (event.time.extra ?? 0);
        return eventSeconds > lastEventTime;
      });

      if (newEvents.length > 0) {
        setEvents((prev) => [...prev, ...newEvents]);
        const maxEventTime = Math.max(
          ...newEvents.map((e: Event) => (e.time.elapsed ?? 0) * 60 + (e.time.extra ?? 0))
        );
        setLastEventTime(maxEventTime);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (matchId) {
    fetchMatchDetails();
    const intervalId = setInterval(fetchMatchDetails, 2000);
    return () => clearInterval(intervalId);
  }
}, [matchId, lastEventTime]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#f33" />
        <Text style={{ color: "#fff", marginTop: 10 }}>Chargement...</Text>
      </View>
    );
  }

  if (!fixture) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: "#fff" }}>Aucune donnée disponible.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {fixture && <MatchCard fixture={fixture} events={events} />}
      <MatchDetailsTabs id={matchId} />
    </View>
  );
}

const MatchCard = ({
  fixture,
  events,
}: {
  fixture: MatchDetails;
  events: Event[];
}) => {
  const router = useRouter();
  const { teams, goals, league, fixture: fix } = fixture;

  const [showBigChance, setShowBigChance] = useState(false);

  console.log(translateTeamName(teams.home.name));

  const now = new Date();
  const fixtureStartTime = new Date(fix.date);
  const secondsElapsed = Math.floor(
    (now.getTime() - fixtureStartTime.getTime()) / 1000
  );

  const recentGoal = events.some((event) => {
    if (event.type !== "Goal" || !event.time.elapsed) return false;
    const eventSeconds = event.time.elapsed * 60 + (event.time.extra ?? 0);
    return (
      eventSeconds >= secondsElapsed - 10 && eventSeconds <= secondsElapsed
    );
  });

  const currentMinute = fix.status.elapsed;
  const extraMinute = fix.status.extra;

  const matchStatus = fix.status.short;

  const displayMinute =
    matchStatus === "INT"
      ? "Mi-temps"
      : ["SUSP", "PST", "ABD"].includes(matchStatus)
      ? "Interruption"
      : currentMinute !== null
      ? extraMinute
        ? `${currentMinute}+${extraMinute}`
        : `${currentMinute}`
      : null;

  const secondsAhead = 3;
  const hasUpcomingGoal = events.some((event) => {
    if (event.type !== "Goal" || !event.time.elapsed) return false;
    const eventSeconds = event.time.elapsed * 60 + (event.time.extra ?? 0);
    return eventSeconds > secondsElapsed && eventSeconds <= secondsElapsed + 3;
  });

  const isPenaltyShootout =
    fix.status.short === "P" || fix.status.long === "Penalty Shootout";

  const isPenaltyShootoutGoal = (e: Event) => {
    return (
      e.type === "Penalty" ||
      (e.type === "Goal" &&
        e.detail === "Penalty" &&
        (e.time.elapsed === 0 || e.time.elapsed === null))
    );
  };

  const homeGoals = events.filter(
    (e) =>
      e.type === "Goal" &&
      e.team.id === teams.home.id &&
      !isPenaltyShootoutGoal(e)
  );

  const awayGoals = events.filter(
    (e) =>
      e.type === "Goal" &&
      e.team.id === teams.away.id &&
      !isPenaltyShootoutGoal(e)
  );

  const groupGoalsByPlayer = (goals: Event[]) => {
    const grouped: Record<string, GoalInfo> = {};

    goals.forEach((goal) => {
      const playerName = goal.player?.name ?? "Inconnu";
      const minute =
        goal.time.elapsed + (goal.time.extra ? `+${goal.time.extra}` : "");

      if (!grouped[playerName]) {
        grouped[playerName] = {
          minutes: [minute],
          ownGoal: goal.detail === "Own Goal",
          penalty: goal.detail === "Penalty",
        };
      } else {
        grouped[playerName].minutes.push(minute);
      }
    });

    return grouped;
  };

const [shownBigChanceIds, setShownBigChanceIds] = useState<Set<string>>(new Set());

useEffect(() => {
  let timer: NodeJS.Timeout | null = null;
  const BIG_CHANCE_KEYWORDS = ["chance", "big chance", "danger", "opportunity", "clear chance"];

  const bigChanceEvent = events.find((event) => {
    const type = (event.type || "").toLowerCase();
    const detail = (event.detail || "").toLowerCase();

    const uniqueId = `${event.time.elapsed}-${event.team.id}-${event.player.id}`;
    const alreadyShown = uniqueId && shownBigChanceIds.has(uniqueId);

    if (alreadyShown || !event.time.elapsed) return false;
    return BIG_CHANCE_KEYWORDS.some((keyword) => type.includes(keyword) || detail.includes(keyword));
  });

  if (bigChanceEvent) {
    const uniqueId = `${bigChanceEvent.time.elapsed}-${bigChanceEvent.team.id}-${bigChanceEvent.player.id}`;

    setShowBigChance(true);
    setShownBigChanceIds((prev) => new Set(prev).add(uniqueId));

    timer = setTimeout(() => setShowBigChance(false), 10000);
  }
  return () => {
    if (timer) clearTimeout(timer);
  };
}, [events, shownBigChanceIds]);

  const groupedHomeGoals = groupGoalsByPlayer(homeGoals);
  const groupedAwayGoals = groupGoalsByPlayer(awayGoals);

  return (
    <View style={styles.card}>
      <View style={styles.leagueContainer}>
        <Image source={{ uri: league.logo }} style={styles.leagueLogo} />
        <TouchableOpacity onPress={() => router.push(`/league/${league.id}`)}>
          <Text style={[styles.league, { color: "white" }]}>{league.name}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.timeContainer}>
        {fix.status.short === "HT" ? (
          <Text style={styles.timeText}>Mi-temps</Text>
        ) : ["INT", "PST", "ABD"].includes(fix.status.short) ? (
          <Text style={styles.timeText}>Interrompu</Text>
        ) : fix.status.short === "ET" && currentMinute === null ? (
          <Text style={styles.timeText}>En attente</Text>
        ) : fix.status.short === "ET" && currentMinute !== null ? (
          <Text style={styles.timeText}>Prolongation : {currentMinute}'</Text>
        ) : fix.status.short === "P" && currentMinute === null ? (
          <Text style={styles.timeText}>TAB</Text>
        ) : fix.status.short === "P" && currentMinute !== null ? (
          <Text style={styles.timeText}>Tirs au but</Text>
        ) : ["1H", "2H", "LIVE"].includes(fix.status.short) ? (
          <Text style={styles.timeText}>
            {currentMinute !== null ? `${currentMinute}'` : fix.status.long}
          </Text>
        ) : (
          <Text style={styles.timeTextDate}>
            {new Date(fix.date).toLocaleDateString([], {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}{" "}
            -{" "}
            {new Date(fix.date).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        )}
      </View>

      <View style={styles.teamsRow}>
        <View style={styles.teamContainer}>
          <TouchableOpacity
            onPress={() => router.push(`/team/${teams.home.id}`)}
          >
            <Image source={{ uri: teams.home.logo }} style={styles.teamLogo} />
          </TouchableOpacity>
          <Text
            style={styles.teamName}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {translateTeamName(teams.home.name)}
          </Text>
        </View>

         <View style={styles.scoreContainer}>
  {fix.status.short === "NS" ? (
    <Text style={styles.score}>-</Text>
  ) : (
    <>
      <Text style={styles.score}>{goals.home}</Text>
      <Text style={styles.scoreSeparator}> - </Text>
      <Text style={styles.score}>{goals.away}</Text>
    </>
  )}
</View>

        <View style={styles.teamContainer}>
          <TouchableOpacity
            onPress={() => router.push(`/team/${teams.away.id}`)}
          >
            <Image source={{ uri: teams.away.logo }} style={styles.teamLogo} />
          </TouchableOpacity>
          <Text
            style={styles.teamName}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {translateTeamName(teams.away.name)}
          </Text>
        </View>
      </View>
      {((fixture.goals.home ?? 0) > 0 || (fixture.goals.away ?? 0) > 0) && (
        <View style={styles.separator} />
      )}

      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <View style={{ flex: 1 }}>
          {/* Buts domicile */}
          {Object.entries(groupedHomeGoals).map(([playerName, info]) => (
            <Text
              key={`home-goal-${playerName}`}
              style={[styles.goalEvent, { textAlign: "left" }]}
            >
              {playerName} - {info.minutes.join(", ")}'
              {info.ownGoal && " (CSC)"}
              {info.penalty && " (P)"}
            </Text>
          ))}
        </View>
        {(fixture.goals.home > 0 || fixture.goals.away > 0) && (
          <View style={{ paddingHorizontal: 10 }}>
            <Text>⚽</Text>
          </View>
        )}

        <View style={{ flex: 1 }}>
          {/* Buts extérieur */}
          {Object.entries(groupedAwayGoals).map(([playerName, info]) => (
            <Text
              key={`away-goal-${playerName}`}
              style={[styles.goalEvent, { textAlign: "right" }]}
            >
              {playerName} - {info.minutes.join(", ")}'
              {info.ownGoal && " (CSC)"}
              {info.penalty && " (P)"}
            </Text>
          ))}
        </View>
      </View>
  {showBigChance && (
  <View style={{ marginTop: 10 }}>
    <FlashingText>Grosse occasion !</FlashingText>
  </View>
)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 11,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  card: {
    backgroundColor: "#222",
    padding: 6,
    borderRadius: 10,
    marginBottom: 18,
    marginLeft: -7,
    marginRight: -7,
    borderColor: "#F73636",
    borderWidth: 1,
  },
  league: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
    textAlign: "center",
  },
  leagueContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  leagueLogo: {
    width: 20,
    height: 36,
    marginRight: 10,
  },
  timeContainer: {
    alignItems: "center",
    marginBottom: 0,
  },
  timeText: {
    color: "red",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 10,
    width: "auto",
  },
  timeTextDate: {
    color: "#8B8989",
    fontWeight: "normal",
    fontSize: 14,
  },
  teamsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "stretch",
  },
  teamContainer: {
    flex: 2,
    alignItems: "center",
  },
  separator: {
    height: 1,
    backgroundColor: "#424242",
    marginVertical: 19,
    width: "100%",
  },
  teamLogo: {
    width: 54,
    height: 54,
    resizeMode: "contain",
    marginBottom: 7,
  },
  teamName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    maxWidth: 140,
    flexShrink: 1,
    textAlign: "center",
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 3,
  },
  score: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  scoreSeparator: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "bold",
    marginHorizontal: 5,
  },
  goalEvent: {
    color: "#C4C3C3",
    fontSize: 12,
    marginBottom: 2,
    fontStyle: "italic",
    textShadowColor: "#000",
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
    marginTop: 0,
  },
  sectionTitle: {
    color: "#f33",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
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
  statLabelTitle: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 5,
    textAlign: "center",
  },
});

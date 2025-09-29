import { useLocalSearchParams } from "expo-router";
import { translateTeamName } from "../../utils/translateTeamName";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import axios from "axios";

const API_URL = "https://v3.football.api-sports.io";
const API_KEY = "b8b570d6f3ff7a8653dee3fb8922d929";

const tabs = ["Effectif", "Classement", "Prochains Matchs", "Stats"];

export default function TeamDetailsPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();

  const [team, setTeam] = useState(null);
  const [coach, setCoach] = useState(null);
  const [squad, setSquad] = useState([]);
  const [standings, setStandings] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [selectedTab, setSelectedTab] = useState("Effectif");
  const [loading, setLoading] = useState(true);
  const [leagueId, setLeagueId] = useState(null);

  const [teamStats, setTeamStats] = useState(null);
  const [topScorer, setTopScorer] = useState(null);
  const [topAssist, setTopAssist] = useState(null);

  const today = new Date();
  const season = today.getMonth() + 1 >= 7 ? today.getFullYear() : today.getFullYear() - 1;

  const [isFavorite, setIsFavorite] = useState(false);
  const toggleFavorite = () => setIsFavorite(prev => !prev);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerTitleAlign: "center",
      headerStyle: { backgroundColor: "#121212" },
      headerTitleStyle: { color: "white", fontWeight: "bold", fontSize: 18 },
      headerLeft: () => (
        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={toggleFavorite} style={{ marginRight: 10 }}>
          <Ionicons
            name={isFavorite ? "star" : "star-outline"}
            size={24}
            color={isFavorite ? "#FFD700" : "white"}
          />
        </TouchableOpacity>
      ),
      headerShown: true,
    });
  }, [navigation, isFavorite]);

  useEffect(() => {
    if (id) fetchTeamInfo();
  }, [id]);

  useEffect(() => {
    if (selectedTab === "Classement" && !leagueId) return;
    if (team) {
      if (selectedTab === "Stats") fetchStatsData();
      else fetchTabData();
    }
  }, [selectedTab, team, leagueId]);

  /** Récupération des infos de l'équipe et du coach */
  const fetchTeamInfo = async () => {
    try {
      const res = await axios.get(`${API_URL}/teams`, {
        params: { id },
        headers: { "x-apisports-key": API_KEY },
      });

      const teamData = res.data.response[0].team;
      setTeam(teamData);

      const coachData = res.data.response[0].coaches?.[0] || null;
      setCoach(coachData);

      const leagues = res.data.response[0].leagues;
      if (leagues && leagues.length > 0) setLeagueId(leagues[0].league.id);
    } catch (e) {
      console.error("Erreur chargement équipe", e);
    }
  };

  /** Récupération des données par onglet (Effectif, Classement, Prochains Matchs) */
  const fetchTabData = async () => {
    setLoading(true);
    try {
      if (selectedTab === "Effectif") {
        let page = 1;
        let allPlayers: any[] = [];
        let totalPages = 1;

        do {
          const { data } = await axios.get(`${API_URL}/players`, {
            params: { team: id, season, page },
            headers: { "x-apisports-key": API_KEY },
          });
          allPlayers = [...allPlayers, ...data.response.map((p) => p.player)];
          totalPages = data.paging.total;
          page++;
        } while (page <= totalPages);

        setSquad(allPlayers);

      } else if (selectedTab === "Prochains Matchs") {
        const { data } = await axios.get(`${API_URL}/fixtures`, {
          params: { team: id, season, next: 27 },
          headers: { "x-apisports-key": API_KEY },
        });
        setUpcoming(data.response);

      } else if (selectedTab === "Classement" && leagueId) {
        const { data } = await axios.get(`${API_URL}/standings`, {
          params: { league: leagueId, season },
          headers: { "x-apisports-key": API_KEY },
        });
        setStandings(data.response[0].league.standings[0]);
      }
    } catch (error) {
      console.error("Erreur récupération données", error);
    }
    setLoading(false);
  };

  /** Récupération stats (Meilleur buteur, meilleur passeur, stats globales + nouvelles stats) */
  const fetchStatsData = async () => {
    setLoading(true);
    try {
      // Joueurs avec stats
      let page = 1;
      let allPlayers: any[] = [];
      let totalPages = 1;

      do {
        const { data } = await axios.get(`${API_URL}/players`, {
          params: { team: id, season, page },
          headers: { "x-apisports-key": API_KEY },
        });
        allPlayers = [
          ...allPlayers,
          ...data.response.map((p) => ({
            id: p.player.id,
            name: p.player.name,
            photo: p.player.photo,
            goals: p.statistics[0]?.goals?.total || 0,
            assists: p.statistics[0]?.goals?.assists || 0,
            position: p.player.position
          }))
        ];
        totalPages = data.paging.total;
        page++;
      } while (page <= totalPages);

      const sortedByGoals = [...allPlayers].sort((a, b) => b.goals - a.goals);
      const sortedByAssists = [...allPlayers].sort((a, b) => b.assists - a.assists);
      setTopScorer(sortedByGoals[0] || null);
      setTopAssist(sortedByAssists[0] || null);

      // Stats globales
      const { data: statsData } = await axios.get(`${API_URL}/teams/statistics`, {
        params: { team: id, season },
        headers: { "x-apisports-key": API_KEY },
      });
      setTeamStats(statsData.response);

    } catch (error) {
      console.error("Erreur récupération stats", error);
    }
    setLoading(false);
  };

  /** Traduction postes */
  const traduirePoste = (poste: string) => {
    switch (poste) {
      case "Goalkeeper": return "Gardien";
      case "Defender": return "Défenseur";
      case "Midfielder": return "Milieu";
      case "Attacker": return "Attaquant";
      default: return poste;
    }
  };

  /** Rendus tab */
  const renderTab = (tab: string) => (
    <TouchableOpacity
      key={tab}
      onPress={() => setSelectedTab(tab)}
      style={{
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: selectedTab === tab ? "#ff0000" : "#2a2a2a",
        borderRadius: 20,
        marginHorizontal: 5,
      }}
    >
      <Text style={{ color: selectedTab === tab ? "#fff" : "#ccc", fontWeight: "bold" }}>
        {tab}
      </Text>
    </TouchableOpacity>
  );

  /** Rendus joueurs, classement, fixture */
  const renderPlayer = ({ item }) => (
    <View style={{ flexDirection: "row", alignItems: "center", padding: 10, borderBottomWidth: 0.5, borderColor: "#444" }}>
      <Image source={{ uri: item.photo }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }} />
      <View>
        <Text style={{ fontWeight: "bold", color: "white" }}>{item.name}</Text>
        <Text style={{ color: "#ccc" }}>
          {traduirePoste(item.position)} - Âge: {item.age}
        </Text>
      </View>
    </View>
  );

  const renderStanding = ({ item }) => (
    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, paddingHorizontal: 15, borderBottomWidth: 0.5, borderColor: "#444" }}>
      <Text style={{ color: "white" }}>{item.rank}. {translateTeamName(item.team.name)}</Text>
      <Text style={{ color: "#1e90ff" }}>{item.points} pts</Text>
    </View>
  );

  const renderFixture = ({ item }) => {
    const home = item.teams.home;
    const away = item.teams.away;
    const fixtureDate = new Date(item.fixture.date);
    const date = fixtureDate.toLocaleDateString();
    const time = fixtureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <TouchableOpacity onPress={() => router.push(`/MatchDetailsScreen/${item.fixture.id}`)} style={{ padding: 10, marginVertical: 5, backgroundColor: "#1e1e1e", borderRadius: 10 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image source={{ uri: home.logo }} style={{ width: 36, height: 36, marginRight: 12 }} />
            <Text style={{ color: "white", fontSize: 15, fontWeight: "bold" }}>{translateTeamName(home.name)}</Text>
          </View>
          <Text style={{ color: "#ccc", fontSize: 12, marginTop: 30, marginLeft: -10 }}>{date}</Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image source={{ uri: away.logo }} style={{ width: 36, height: 36, marginRight: 12 }} />
            <Text style={{ color: "white", fontSize: 15, fontWeight: "bold" }}>{translateTeamName(away.name)}</Text>
          </View>
          <Text style={{ color: "#ccc", fontSize: 12, marginBottom: 20, marginRight: 18 }}>{time}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  /** Rendu stats enrichi */
  const renderStats = () => {
    if (!teamStats) return null;

    const goalsFor = teamStats.goals?.for?.total ?? 0;
    const goalsAgainst = teamStats.goals?.against?.total ?? 0;
    const shotsPerMatch = teamStats.shots?.total && teamStats.fixtures?.played?.total
      ? (teamStats.shots.total / teamStats.fixtures.played.total).toFixed(1)
      : 0;
    const shotsOnTargetPerc = teamStats.shots?.on?.total && teamStats.shots?.total
      ? ((teamStats.shots.on.total / teamStats.shots.total) * 100).toFixed(1)
      : 0;
    const possessionAvg = teamStats.possession?.avg ?? 0;
    const foulsPerMatch = teamStats.fouls?.total && teamStats.fixtures?.played?.total
      ? (teamStats.fouls.total / teamStats.fixtures.played.total).toFixed(1)
      : 0;
    const cornersPerMatch = teamStats.corners?.total && teamStats.fixtures?.played?.total
      ? (teamStats.corners.total / teamStats.fixtures.played.total).toFixed(1)
      : 0;
    const passesAccuratePerc = teamStats.passes?.accuracy?.total ?? 0;

    return (
      <View style={{ padding: 15 }}>
        {topScorer && (
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 15 }}>
            <Image source={{ uri: topScorer.photo }} style={{ width: 50, height: 50, borderRadius: 25, marginRight: 10 }} />
            <View>
              <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Meilleur buteur</Text>
              <Text style={{ color: "#ccc" }}>{topScorer.name} - {topScorer.goals} buts</Text>
            </View>
          </View>
        )}

        {topAssist && (
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 15 }}>
            <Image source={{ uri: topAssist.photo }} style={{ width: 50, height: 50, borderRadius: 25, marginRight: 10 }} />
            <View>
              <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Meilleur passeur</Text>
              <Text style={{ color: "#ccc" }}>{topAssist.name} - {topAssist.assists} passes</Text>
            </View>
          </View>
        )}

        <View style={{ marginTop: 20 }}>
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 16, marginBottom: 10 }}>Stats de l'équipe</Text>
          <Text style={{ color: "#ccc" }}>Buts marqués : {goalsFor}</Text>
          <Text style={{ color: "#ccc" }}>Buts encaissés : {goalsAgainst}</Text>
          <Text style={{ color: "#ccc" }}>Tirs par match : {shotsPerMatch}</Text>
          <Text style={{ color: "#ccc" }}>Tirs cadrés (%) : {shotsOnTargetPerc}</Text>
          <Text style={{ color: "#ccc" }}>Possession moyenne : {possessionAvg}%</Text>
          <Text style={{ color: "#ccc" }}>Fautes par match : {foulsPerMatch}</Text>
          <Text style={{ color: "#ccc" }}>Corners par match : {cornersPerMatch}</Text>
          <Text style={{ color: "#ccc" }}>Précision passes : {passesAccuratePerc}%</Text>
        </View>
      </View>
    );
  };

  if (!team) return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#121212" }}>
      <ActivityIndicator size="large" color="#000000" />
    </View>
  );

  const listData =
    selectedTab === "Classement" ? standings :
    selectedTab === "Effectif" ? squad :
    selectedTab === "Prochains Matchs" ? upcoming : [];

  const renderItem =
    selectedTab === "Classement" ? renderStanding :
    selectedTab === "Effectif" ? renderPlayer :
    selectedTab === "Prochains Matchs" ? renderFixture :
    selectedTab === "Stats" ? renderStats :
    null;

  return (
    <View style={{ flex: 1, backgroundColor: "#121212" }}>
      <View style={{ alignItems: "center", marginVertical: 20 }}>
        <Image source={{ uri: team.logo }} style={{ width: 80, height: 80, marginBottom: 10 }} />
        <Text style={{ fontSize: 22, fontWeight: "bold", textAlign: "center", color: "white" }}>{translateTeamName(team.name)}</Text>
        {coach && <Text style={{ fontSize: 16, color: "#ccc", marginTop: 5 }}>Entraîneur: {coach.name}</Text>}
        <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 15 }}>{tabs.map(renderTab)}</View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#000000" style={{ marginTop: 20, flex: 1 }} />
      ) : (
        selectedTab === "Stats" ? (
          renderStats()
        ) : (
          <FlatList
            style={{ flex: 1, paddingHorizontal: 10 }}
            data={listData}
            keyExtractor={(item) => selectedTab === "Classement" ? item.team.id.toString() : selectedTab === "Effectif" ? item.id.toString() : item.fixture.id.toString()}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />
        )
      )}
    </View>
  );
}

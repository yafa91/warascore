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

const tabs = ["Effectif", "Classement", "Prochains Matchs"];

export default function TeamDetailsPage() {
  const { id } = useLocalSearchParams();
  const [team, setTeam] = useState(null);
  const router = useRouter();
  const navigation = useNavigation();
  const [fixtures, setFixtures] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [standings, setStandings] = useState([]);
  const [squad, setSquad] = useState([]);
  const [selectedTab, setSelectedTab] = useState("Effectif");
  const [loading, setLoading] = useState(true);
  const [leagueId, setLeagueId] = useState(null);
  const season = 2025;

  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = () => {
    setIsFavorite((prev) => !prev);
  };

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
        <TouchableOpacity
          onPress={() => setIsFavorite(!isFavorite)}
          style={{ marginRight: 10 }}
        >
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
    if (team) fetchTabData();
  }, [selectedTab, team, leagueId]);

  const fetchTeamInfo = async () => {
    try {
      const res = await axios.get(`${API_URL}/teams`, {
        params: { id },
        headers: { "x-apisports-key": API_KEY },
      });

      const teamData = res.data.response[0].team;
      setTeam(teamData);

      const leagues = res.data.response[0].leagues;
      if (leagues && leagues.length > 0) {
        setLeagueId(leagues[0].league.id);
      }
    } catch (e) {
      console.error("Erreur chargement équipe", e);
    }
  };

  const fetchTabData = async () => {
    setLoading(true);
    try {
      if (selectedTab === "Effectif") {
        const { data } = await axios.get(`${API_URL}/players`, {
          params: { team: id, season },
          headers: { "x-apisports-key": API_KEY },
        });
        setSquad(data.response.map((p) => p.player));
      } else if (selectedTab === "Prochains Matchs") {
        const { data } = await axios.get(`${API_URL}/fixtures`, {
          params: { team: id, season, next: 15 },
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

  const traduirePoste = (poste: string) => {
    switch (poste) {
      case "Goalkeeper":
        return "Gardien";
      case "Defender":
        return "Défenseur";
      case "Midfielder":
        return "Milieu";
      case "Attacker":
        return "Attaquant";
      default:
        return poste;
    }
  };

  const renderTab = (tab: string) => (
    <TouchableOpacity
      key={tab}
      onPress={() => setSelectedTab(tab)}
      style={{
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: selectedTab === tab ? "#1e90ff" : "#2a2a2a",
        borderRadius: 20,
        marginHorizontal: 5,
      }}
    >
      <Text
        style={{
          color: selectedTab === tab ? "#fff" : "#ccc",
          fontWeight: "bold",
        }}
      >
        {tab}
      </Text>
    </TouchableOpacity>
  );

 const renderFixture = ({ item }) => {
  const date = new Date(item.fixture.date).toLocaleString();
  const home = item.teams.home;
  const away = item.teams.away;
  const score = item.goals;

  return (
    <View style={{ padding: 10, borderBottomWidth: 0.5, borderColor: "#444" }}>
      <Text style={{ fontWeight: "bold", color: "white" }}>
        {translateTeamName(home.name)} vs {translateTeamName(away.name)}
      </Text>
      {["FT", "1H", "2H"].includes(item.fixture.status.short) ? (
        <Text style={{ fontSize: 16, color: "#1e90ff" }}>
          {score.home} - {score.away}
        </Text>
      ) : (
        <Text style={{ color: "#ccc" }}>{date}</Text>
      )}
    </View>
  );
};


const renderStanding = ({ item }) => (
  <View
    style={{
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderBottomWidth: 0.5,
      borderColor: "#444",
    }}
  >
    <Text style={{ color: "white" }}>
      {item.rank}. {translateTeamName(item.team.name)}
    </Text>
    <Text style={{ color: "#1e90ff" }}>{item.points} pts</Text>
  </View>
);


  const renderPlayer = ({ item }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderBottomWidth: 0.5,
        borderColor: "#444",
      }}
    >
      <Image
        source={{ uri: item.photo }}
        style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
      />
      <View>
        <Text style={{ fontWeight: "bold", color: "white" }}>{item.name}</Text>
        <Text style={{ color: "#ccc" }}>
          {traduirePoste(item.position)} - Âge: {item.age}
        </Text>
      </View>
    </View>
  );

  if (!team) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#121212",
        }}
      >
        <ActivityIndicator size="large" color="#1e90ff" />
      </View>
    );
  }

  const listData =
    selectedTab === "Classement"
      ? standings
      : selectedTab === "Effectif"
      ? squad
      : upcoming;

  const renderItem =
    selectedTab === "Classement"
      ? renderStanding
      : selectedTab === "Effectif"
      ? renderPlayer
      : renderFixture;

  return (
    <View style={{ flex: 1, backgroundColor: "#121212" }}>
      <View style={{ alignItems: "center", marginVertical: 20 }}>
        <Image
          source={{ uri: team.logo }}
          style={{ width: 80, height: 80, marginBottom: 10 }}
        />
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            textAlign: "center",
            color: "white",
          }}
        >
            {translateTeamName(team.name)}
          </Text>
    
        <View
          style={{ flexDirection: "row", justifyContent: "center", marginTop: 15 }}
        >
          {tabs.map(renderTab)}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#1e90ff"
          style={{ marginTop: 20, flex: 1 }}
        />
      ) : (
        <FlatList
          style={{ flex: 1, paddingHorizontal: 10 }}
          data={listData}
          keyExtractor={(item) =>
            selectedTab === "Classement"
              ? item.team.id.toString()
              : selectedTab === "Effectif"
              ? item.id.toString()
              : item.fixture.id.toString()
          }
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

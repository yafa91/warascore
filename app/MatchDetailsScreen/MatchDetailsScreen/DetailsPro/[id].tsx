import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Image, FlatList, Dimensions, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { ScrollView } from "react-native";
import TeamCompositionField from "../../../../components/TeamCompositionField";


const API_URL = "https://v3.football.api-sports.io";
const API_KEY = "b8b570d6f3ff7a8653dee3fb8922d929";

const windowWidth = Dimensions.get('window').width;

export default function DetailsPro() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();

  const [matchDetails, setMatchDetails] = useState(null);
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
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 10 }}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
    ),
    headerRight: () => (
      <TouchableOpacity onPress={() => {
        console.log("Match ajouté aux favoris ou notification activée");
      }} style={{ marginRight: 10 }}>
        <Ionicons name="notifications-outline" size={24} color="white" />
      </TouchableOpacity>
    ),
    headerShown: true,
  });
}, [navigation]);

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
        const homeTeam = data.response.find(team => team.team.id === matchDetails.teams.home.id);
        const awayTeam = data.response.find(team => team.team.id === matchDetails.teams.away.id);

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
  .filter(match => new Date(match.fixture.date) < now)
  .sort((a, b) => new Date(b.fixture.date) - new Date(a.fixture.date));

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
      const res = await fetch(`${API_URL}/standings?league=${leagueId}&season=${season}`, {
        headers: { "x-apisports-key": API_KEY },
      });
      const data = await res.json();

      if (!data.response.length) {
        setClassement(null);
        setClassementError(true);
      } else {
        const standingsData = data.response[0].league.standings;

        if (Array.isArray(standingsData[0]) && Array.isArray(standingsData[1])) {
          const homeId = matchDetails.teams.home.id;
          const awayId = matchDetails.teams.away.id;

          const relevantGroup = standingsData.find(group =>
            group.some(team => team.team.id === homeId || team.team.id === awayId)
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

      {/* Onglets */}
<View style={styles.tabsContainer}>
  <TouchableOpacity
    style={[styles.tabButton, activeTab === "details" && styles.activeTab]}
    onPress={() => setActiveTab("details")}
  >
    <Text style={[styles.tabText, activeTab === "details" && styles.activeTabText]}>
      Détails
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[styles.tabButton, activeTab === "composition" && styles.activeTab]}
    onPress={() => setActiveTab("composition")}
  >
    <Text style={[styles.tabText, activeTab === "composition" && styles.activeTabText]}>
      Compos
    </Text>
  </TouchableOpacity>

  {classement && classement.length > 0 && (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === "classement" && styles.activeTab]}
      onPress={() => setActiveTab("classement")}
    >
      <Text style={[styles.tabText, activeTab === "classement" && styles.activeTabText]}>
        Classement
      </Text>
    </TouchableOpacity>
  )}

  <TouchableOpacity
    style={[styles.tabButton, activeTab === "historique" && styles.activeTab]}
    onPress={() => setActiveTab("historique")}
  >
    <Text style={[styles.tabText, activeTab === "historique" && styles.activeTabText]}>
      Historiques
    </Text>
  </TouchableOpacity>
</View>

      <View style={{ flex: 1 }}>
        {activeTab === "details" && (
          <View>
            <Text style={styles.heading}>Détails du Match</Text>
            <Text style={styles.info}>Stade : {venue.name}, {venue.city}</Text>
            {broadcasters && broadcasters.length > 0 ? (
              <Text style={styles.info}>Chaîne : {broadcasters.map((b) => b.name).join(", ")}</Text>
            ) : (
              <Text style={styles.info}>Chaîne : Non disponible</Text>
            )}
          </View>
        )}

{activeTab === "composition" && (
  compositionLoading ? (
    <ActivityIndicator size="large" color="#f33" style={{ marginTop: 20 }} />
  ) : (composition.home.length === 0 && composition.away.length === 0) ? (
    <View style={styles.compositionContainer}>
      <Text style={{ textAlign: 'center', fontWeight: 'bold', marginVertical: 16, fontSize: 13, color: 'white' }}>
        La composition n'est pas encore dispo
      </Text>
    </View>
  ) : (
    <ScrollView contentContainerStyle={styles.compositionScroll}>
      <View style={styles.compositionContainer}>
        <TeamCompositionField
          team={[
            ...composition.home.map(player => ({ ...player, side: "home" })),
            ...composition.away.map(player => ({ ...player, side: "away" }))
          ]}
          isMerged={true} 
        />
      </View>
    </ScrollView>
  )
)}

{activeTab === "historique" && (
  historiqueLoading ? (
    <ActivityIndicator size="large" color="#f33" style={{ marginTop: 20 }} />
  ) : historiqueError ? (
    <Text style={styles.noClassementText}>Aucun historique disponible pour ces équipes.</Text>
  ) : historique.length === 0 ? (
    <Text style={styles.noClassementText}>Aucune confrontation récente trouvée.</Text>
  ) : (
    <FlatList
      data={historique}
      keyExtractor={(item) => item.fixture.id.toString()}
      renderItem={({ item }) => {
        const dateMatch = new Date(item.fixture.date);
        const dateFormatted = dateMatch.toLocaleDateString("fr-FR");
        const scoreHome = item.goals.home;
const scoreAway = item.goals.away;

const scoreDisplay = (scoreHome === null || scoreAway === null)
  ? "Score non dispo"
  : `${scoreHome} - ${scoreAway}`;

<Text style={styles.historiqueScore}>{scoreDisplay}</Text>


        return (
          <View style={styles.historiqueRow}>
            <Text style={styles.historiqueDate}>{dateFormatted}</Text>
            <View style={styles.historiqueTeamsRow}>
              <Text style={styles.historiqueTeam}>{item.teams.home.name}</Text>
              <Text style={styles.historiqueScore}>{scoreHome} - {scoreAway}</Text>
              <Text style={styles.historiqueTeam}>{item.teams.away.name}</Text>
            </View>
            <Text style={styles.historiqueLeague}>{item.league.name}</Text>
          </View>
        );
      }}
    />
  )
)}

        {activeTab === "classement" && (
          classementLoading ? (
            <ActivityIndicator size="large" color="#f33" style={{ marginTop: 20 }} />
          ) : classementError ? (
            <Text style={styles.noClassementText}>Aucun classement disponible pour cette compétition.</Text>
          ) : (
            <FlatList
              data={classement}
              keyExtractor={item => item.team.id.toString()}
              renderItem={({ item, index }) => (
                <View style={[styles.classementRow, index % 2 === 0 ? styles.classementRowLight : styles.classementRowDark]}>
                  <Text style={styles.classementPos}>{index + 1}</Text>
                  <Image source={{ uri: item.team.logo }} style={styles.classementLogo} />
                  <Text style={styles.classementTeam}>{item.team.name}</Text>
                  <Text style={styles.classementPoints}>{item.points} pts</Text>
                </View>
              )}
            />
          )
        )}
      </View>
    </View>
  );
}

const TeamComposition = ({ positions }) => {
  return (
    <View style={styles.teamComposition}>
      {positions.map(({ player }) => (
        <Text key={player.id} style={styles.playerName}>
          {player.number ? `${player.number}. ` : ""}{player.name}
        </Text>
      ))}
    </View>
  );
};

const MatchCard = ({ fixture, events }) => {
  const { teams, goals, league, fixture: fix } = fixture;

  const matchDate = new Date(fix.date);
  const formattedDate = matchDate.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const formattedTime = matchDate.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  
  return (
     <View style={[styles.card, { backgroundColor: "#222", height: 185, borderColor: "#F73636", borderWidth: 1, }]}>
      <Text style={styles.league}>{league.name}</Text>

      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>
          {formattedDate} à {formattedTime}
        </Text>
      </View>

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
    borderBottomColor: "#FFFFFF",
    borderBottomWidth: 2,
    paddingHorizontal: 5,
    alignSelf: 'center',
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

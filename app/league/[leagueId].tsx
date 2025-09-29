import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export const translateTeamName = (name: string): string => {
  const translations: { [key: string]: string } = {
    "Paris Saint Germain": "PSG",
    "1899 Hoffenheim": "Hoffenheim",
    "FC Volendam": "Volendam",
    "Istanbul Basaksehir": "Basaksehir",
    "Union St. Gilloise": "USG",
    "Al-Qadisiyah FC": "Al Qadsiah",
    "Al-Ahli Jeddah": "Al Ahli",
    "Suwon City FC": "Suwon FC",
    "Al Wahda FC": "Al Wahda",
    "Randers FC": "Randers",
    "Al-Ittihad FC": "Al Ittihad",
    "FC St. Pauli": "St. Pauli",
    "FC Augsburg": "Augsburg",
    "Gimcheon Sangmu FC": "Gimcheon",
    "NEC Nijmegen": "NEC",
    "GO Ahead Eagles": "GA Eagles",
    "Manchester United": "Man United",
    "Al-Hilal Saudi FC": "Al Hilal",
    "Coquimbo Unido": "Coquimbo",
    "Paris Saint-Germain": "PSG",
    "Olympique de Marseille": "OM",
    "Mali W": "Mali",
    "South Africa W": "Afrique du Sud",
    "Ghana W": "Ghana",
    "Rapid Vienna": "Rapid Vienne",
    "Slovenia": "Slovenie",
    "Sweden": "Suède",
    "Switzerland": "Suisse",
     "Iceland W": "Islande",
    "Greece": "Grèce",
    "Belarus": "Biélorussie",
    "Iceland": "Islande",
    "Tanzania W": "Tanzanie",
    "Switzerland W": "Suisse",
    "Sweden W": "Suède",
    "Dinamo Minsk": "Din.Minsk",
    "Bayern München": "Bayern",
    "FK Zalgiris Vilnius": "FK Zalgiris",
    "West Ham United U21": "West Ham 21",
    "Boreham Wood": "Boreham",
    "Hamrun Spartans": "Hamrun",
    "Hebburn Town": "Hebburn",
    "Spennymoor Town": "Spennymoor",
    "IFK Norrkoping": "Norrkoping",
    "IF Brommapojkarna": "Bromapojkarna",
    "Poland W": "Pologne",
    "Seattle Sounders": "Seattle",
    "Egnatia Rrogozhinë": "Egnatia",
    "Columbus Crew": "Columbus",
    "Haverfordwest County AFC": "Haverfordwest",
    "Bogota FC": "Bogota",
    "Vikingur Gota": "Vikingur",
    "Deportes Copiapo": "Copiapo",
    "Sevilla": "FC Séville",
    "Georgia": "Georgie",
    "Malta": "Malte",
    "Lithuania": "Lituanie",
    "Northern Ireland": "Irlande du Nord",
    "Bulgaria": "Bulgarie",
    "Slovakia": "Slovaquie",
    "Athletic Club": "Ath. Bilbao",
    "Rot-Weiß Essen": "RW Essen",
    "Moldova": "Moldavie",
    "Italy": "Italie",
    "Estonia": "Estonie",
    "Faroe Islands": "Ile Féroé",
    "Türkiye": "Turquie",
    "SC Braga": "Braga",
    "Denmark W": "Danemark",
    "FC Copenhagen": "Copenhague",
    "Borussia Mönchengladbach": "M'gladbach",
    "Avispa Fukuoka": "Fukuoka",
    "Shimizu S-pulse": "Shimizu",
    "Yokohama F. Marinos": "Yokohama",
    "Kawazaki Frontale": "Kawazaki",
    "FC Nordsjaelland": "Nordsjaelland",
    "Union San Felipe": "San Filipe",
    "Rangers de Talca": "Rangers Talca",
    "Deportes Santa Cruz": "Santa Cruz",
    "Universidad de Chile": "U.de Chile",
    "Atletico Madrid": "Atl. Madrid",
    "Everton de Vina": "Everton",
    "HNK Hajduk Split": "Hajduk",
    "Istra 1961": "Istra",
    "NK Slaven Belupo": "Slaven",
    "HNK Rijeka": "Rijeka",
    "Union La Calera": "U. Calera",
    "Mineros de Zacatecas": "Mineros",
    "Stade Brestois 29": "Brest",
    "San Marcos de Arica": "Arica",
    "Los Angeles Galaxy": "LA Galaxy",
    "Deportes Tolima": "D. Tolima",
    "Alianza Petrolera": "Alianza",
    "Maccabi Tel Aviv": "M. Tel Aviv",
    "AFC Hermannstadt": "Hermannstadt",
    "Red Bull Salzburg": "RB Salzburg ",
    "Nottingham Forest": "Nottingham",
    "Independiente Medellin": "Ind. Medellin",
    "Flora Tallinn": "Flora",
    "Kalju Nomme": "Kalju",
    "Kristiansund BK": "Kristiansund",
    "BK Hacken": "Hacken",
    "FC Midtjylland": "Midtjylland",
    "New York City FC": "New York City",
    "Germany W": "Allemagne",
    "Germany M": "Allemagne",
    "Hammarby FF": "Hammarby",
    "FSV Mainz 05": "Mayence",
    "Al Khaleej Saihat": "Al Khaleej",
    "VfB Stuttgart": "Stuttgart",
    "Malmo FF": "Malmo",
    "Algeria W": "Algerie",
    "FK Crvena Zvezda": "Etoile Rouge",
    "Deportes Temuco": "Temuco",
    "FC Basel 1893": "FC Basel",
    "SC Freiburg": "Freiburg",
    "PEC Zwolle": "Zwolle",
    "AZ Alkmaar": "Alkmaar",
    "Nigeria W": "Nigeria",
    "Fortaleza FC": "Fortaleza",
    "Dinamo Bucuresti": "D. Bucarest",
    "FC Botosani": "Botosani",
    "Estac Troyes": "Troyes",
    "Zambia W": "Zambie",
    "Clermont Foot": "Clermont",
    "Netherlands W": "Pays-Bas",
    "Deportivo Laferrere": "Laferrere",
    "Universidad de Concepcion": "U. de Concepcion",
    "Wales W": "Pays de Galles",
    "Belgium W": "Belgique",
    "Portugal W": "Portugal",
    "Spain W": "Espagne",
    "Italy W": "Italie",
    "Santiago Morning": "S.Morning",
    "Norway W": "Norvège", 
    "Finland W": "Finlande",
    "Borussia Dortmund": "Dortmund",
    "RB Leipzig": "Leipzig",
    "Bayer Leverkusen": "Leverkusen",
    "Arsenal FC": "Arsenal",
    "Chelsea FC": "Chelsea",
    "England W": "Angleterre",
    "Liverpool FC": "Liverpool",
    "Cape Verde Islands": "Cap-Vert",
    "Ethiopia": "Ethiopie",
    "GKS Katowice W": "Katowice F",
    "MB Rouisset": "Rouisset",
    "RED Star FC 93": "Red Star",
    "Twente W": "Twente F",
    "Atletico Madrid W": "Atletico Madrid F",
    "Eintracht Frankfurt W": "Frankfort F",
    "Roma W": "Roma F",
    "Sporting CP W": "Sporting F",
    "Paris FC W": "Paris FC F",
    "Manchester United W": "Man United F",
    "Brann W": "Brann F",
    "Austria Wien W": "Autria Vienne F",
    "Vorskla Poltava W": "Vorskla Poltava F",
    "OH Leuven W": "Leuven F",
    "Congo DR": "RD Congo",
    "Gambia": "Gambie",
    "Albania": "Albanie",
    "Norway": "Norvège",
    "Romania": "Roumanie",
    "Mauritania": "Mauritanie",
    "South Sudan": "Soudan du Sud",
    "Latvia": "Lettonie",
    "Manchester City": "Man City",
    "Club Brugge KV": "Club Brugge",
    "Lierse Kempenzonen": "k. Lierse SK",
    "AD Ceuta FC": "AD Ceuta",
    "Equatorial Guinea": "Guinée Equatoriale",
    "Zambia": "Zambie",
    "Chad": "Tchad",
    "Somalia": "Somalie",
    "Guinea": "Guinée",
    "Guinea-Bissau": "Guinée-Bissau",
    "Belgium": "Belgique",
    "Comoros":"Comores",
    "Central African Republic": "Centrafique",
    "Sporting CP": "Sporting",
    "Rep. Of Ireland": "Irlande",
    "Hungary": "Hongrie",
    "Austria": "Autriche",
    "Cyprus": "Chypre",
    "San Marino": "Saint-Martin",
    "CS Constantine": "Constantine",
    "Czech Republic": "République Tchèque",
    "Villa San Carlos": "San Carlos",
    "Spain": "Espagne",
    "Denmark": "Danemark",
    "Scotland": "Ecosse",
    "England": "Angleterre",
    "Eintracht Frankfurt": "Francfort",
    "VfL Wolfsburg": "Wolfsburg",
    "West Ham United": "West Ham",
    "Inter Miami CF": "Inter Miami",
    "Brazil": "Brésil",
    "The New Saints": "TNS",
    "Inter Club d'Escaldes": "Inter",
    "Valur Reykjavik": "Valur",
    "Brown DE Adrogue": "Brown Adrogue",
    "Los Angeles FC": "LAFC",
    "Lincoln Red Imps FC": "Lincoln",
    "Argentina": "Argentine",
    "Olimpija Ljubljana": "Olimpija",
    "FC Differdange 03": "Differdange",
    "Kairat Almaty": "Kairaty",
    "Cambodia": "Cambodge",
    "Saudi Arabia W ": "Arabie Saoudite",
    "Newcastle United": "Newcastle",
    "São Paulo FC": "São Paulo",
    "Japan": "Japon",
    "Uzbekistan": "Ouzbekistant",
    "South Korea": "Corée du Sud",
    "United States": "États-Unis",
    "Mexico": "Mexique",
    "Australia": "Australie",
    "Canada": "Canada",
    "Cliftonville FC": "Cliftonville",
    "Gangwon FC": "Gangwon",
    "FC Levadia Tallinn": "Levadia",
    "Tallinna Kalev": "T. Kalev",
    "Fatih Karagümrük": "Karagümrük",
    "Fortuna Sittard": "Fortuna",
    "Daejeon Citizen": "Daejeon",
    "Deportivo Armenio": "D. Armenio",
    "Senegal W": "Sénégal",
    "Pohang Steelers": "Pohang",
    "Jeju United FC": "Jeju United",
    "Jeonbuk Motors": "Jeonbuk",
    "Netherlands": "Pays-Bas",
    "Shonan Bellmare": "Shonan",
    "Cerezo Osaka": "C. Osaka",
    "Olympiacos FC": "Olympiakos",
    "Panathinaikos FC": "Panathinaikos",
    "AEK Athens FC": "AEK Athènes",
    "Croatia": "Croatie",
    "Napoli": "Naples",
    "Poland": "Pologne",
    "Serbia": "Serbie",
    "Turkey": "Turquie",
    "Morocco W": "Maroc",
    "Cameroon": "Cameroun",
    "Ivory Coast": "Côte d'Ivoire",
    "Hapoel Beer Sheva": "H. Beer Sheva",
    "Levski Sofia": "Levski",
    "Nigeria": "Nigéria",
    "Sheriff Tiraspol": "S. Tiraspol",
    "CFR 1907 Cluj": "CFR Cluj",
    "Wales": "Pays de Galles",
    "St Joseph S Fc": "St Josephs",
    "Olympiakos Piraeus": "Olympiakos",
    "South Africa": "Afrique du Sud",
    "China": "Chine",
    "Zeljeznicar Sarajevo": "Zeljeznicar",
    "France W": "France",
    "Real Madrid W": "Real Madrid F",
    "Qatar": "Qatar",
    "Egypt": "Égypte",
    "Tunisia": "Tunisie",
    "Atlètic Club d'Escaldes": "Atletic Escaldes",
    "F91 Dudelange": "Dudelange",
    "Algeria": "Algérie",
    "Uruguay": "Uruguay",
    "Morocco": "Maroc",
    "Grêmio": "Grêmio",
    "Atlético Mineiro": "Atlético MG",
    "Internacional": "Internacional",
    "Santos FC": "Santos",
    "Al-Nassr FC": "Al Nassr",
    "Al-Ittihad Club": "Al Ittihad",
    "Al-Ahli Saudi FC": "Al Ahli",
    "Bangladesh": "Bangladesh",
    "PSV Eindhoven": "PSV",
    "Senegal": "Sénégal",
  };

  return translations[name] || name;
};

const API_KEY = "b8b570d6f3ff7a8653dee3fb8922d929";

type Match = any;
type Scorer = any;

export default function LeagueUpcomingMatches() {
  const { leagueId } = useLocalSearchParams<{ leagueId: string }>();
  const [matches, setMatches] = useState<Match[]>([]);
  const [scorers, setScorers] = useState<Scorer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"matches" | "scorers">("matches");
  const router = useRouter();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerTitleAlign: "center",
      headerStyle: { backgroundColor: "#121212" },
      headerTitleStyle: { color: "white", fontWeight: "bold", fontSize: 18 },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginLeft: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      ),
      headerShown: true,
    });
  }, [navigation]);

 useEffect(() => {
  setLoading(true);

  const fetchUpcomingMatches = async () => {
    try {
      const res = await fetch(
        `https://v3.football.api-sports.io/fixtures?league=${leagueId}&next=25`,
        {
          headers: {
            "x-apisports-key": API_KEY,
          },
        }
      );
      const data = await res.json();
      setMatches(data.response);
    } catch (error) {
      console.error(error);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };
const fetchTopScorers = async () => {
  try {
    const currentSeason = new Date().getFullYear(); 

    const res = await fetch(
      `https://v3.football.api-sports.io/players/topscorers?league=${leagueId}&season=${currentSeason}`,
      {
        headers: {
          "x-apisports-key": API_KEY,
        },
      }
    );
    const data = await res.json();
    setScorers(data.response);
  } catch (error) {
    console.error(error);
    setScorers([]);
  } finally {
    setLoading(false);
  }
};

  if (leagueId) {
    if (activeTab === "matches") {
      fetchUpcomingMatches();
    } else {
      fetchTopScorers();
    }
  }
}, [leagueId, activeTab]);

  
  const handlePress = (fixtureId: number) => {
    router.push(`/MatchDetailsScreen/${fixtureId}`);
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#f33" />
        <Text style={{ color: "#fff", marginTop: 10 }}>
          Chargement en cours...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Onglets */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "matches" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("matches")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "matches" && styles.activeTabText,
            ]}
          >
            Prochains matchs
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "scorers" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("scorers")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "scorers" && styles.activeTabText,
            ]}
          >
            Meilleurs buteurs
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenu onglets */}
      {activeTab === "matches" ? (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.fixture.id.toString()}
          renderItem={({ item }) => {
            const matchDate = new Date(item.fixture.date);
            const formattedDate = matchDate.toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => handlePress(item.fixture.id)}
                activeOpacity={0.8}
              >
                <View style={styles.teamContainer}>
                  <Image
                    source={{ uri: item.teams.home.logo }}
                    style={styles.teamLogo}
                  />
                 <Text style={styles.teamName}>{translateTeamName(item.teams.home.name)}</Text>
                </View>

                <View style={styles.middleContainer}>
                  <Text style={styles.vs}>VS</Text>
                  <Text style={styles.matchDate}>{formattedDate}</Text>
                </View>

                <View style={styles.teamContainer}>
                  <Image
                    source={{ uri: item.teams.away.logo }}
                    style={styles.teamLogo}
                  />
                  <Text style={styles.teamName}>{translateTeamName(item.teams.away.name)}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <Text
              style={{ color: "white", textAlign: "center", marginTop: 20 }}
            >
              Aucun match à venir.
            </Text>
          }
        />
      ) : (
        <FlatList
          data={scorers}
          keyExtractor={(item) => item.player.id.toString()}
          renderItem={({ item }) => (
  <TouchableOpacity
    onPress={() =>
      router.push({
        pathname: "/PlayerDetailsScreen",
        params: {
          playerId: item.player.id,
          teamId: item.statistics[0].team.id,
          season: new Date().getFullYear(),
        },
      })
    }
    style={styles.scorerCard}
  >
    <Image
      source={{ uri: item.player.photo }}
      style={styles.scorerPhoto}
    />
    <View style={{ flex: 1, marginLeft: 10 }}>
      <Text style={styles.scorerName}>{item.player.name}</Text>
      <Text style={styles.scorerTeam}>{item.statistics[0].team.name}</Text>
    </View>
    <Text style={styles.scorerGoals}>{item.statistics[0].goals.total} buts</Text>
  </TouchableOpacity>
)}

          ListEmptyComponent={
            <Text
              style={{ color: "white", textAlign: "center", marginTop: 20 }}
            >
              Aucun meilleur buteur trouvé.
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#121212" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center",  backgroundColor: "#121212"  },
  card: {
    backgroundColor: "#222",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    justifyContent: "space-between",
  },
  teamContainer: {
    flex: 1,
    alignItems: "center",
  },
  teamLogo: {
    width: 40,
    height: 40,
    marginBottom: 6,
    resizeMode: "contain",
  },
  teamName: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
  },
  middleContainer: {
    flex: 1,
    alignItems: "center",
  },
  vs: {
    color: "#666",
    fontSize: 18,
    marginBottom: 6,
  },
  matchDate: {
    color: "#aaa",
    fontSize: 12,
  },
  tabsContainer: {
    flexDirection: "row",
    marginBottom: 15,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    alignItems: "center",
  },
  activeTab: {
    borderBottomColor: "white",
  },
  tabText: {
    color: "#888",
    fontWeight: "600",
    fontSize: 16,
  },
  activeTabText: {
    color: "white",
    fontWeight: "bold",
  },
  scorerCard: {
    backgroundColor: "#222",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
  },
  scorerPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  scorerName: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  scorerTeam: {
    color: "#aaa",
    fontSize: 12,
  },
  scorerGoals: {
    color: "#f33",
    fontWeight: "bold",
    fontSize: 16,
  },
});

 import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { useNavigation } from "expo-router";
import {
  View,
  TextInput,
  StyleSheet,
  Animated,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Text,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const API_URL = "https://v3.football.api-sports.io/fixtures";
const API_KEY = "b8b570d6f3ff7a8653dee3fb8922d929";

export const translateTeamName = (name: string): string => {
  const translations: { [key: string]: string } = {
    "Paris Saint Germain": "PSG",
    "Avispa Fukuoka": "Fukuoka",
    "Rot-Weiß Essen": "RW Essen",
    "Shimizu S-pulse": "Shimizu",
    "Yokohama F. Marinos": "Yokohama",
    "Georgia": "Georgie",
    "Rapid Vienna": "Rapid Vienne",
    "Slovenia": "Slovenie",
    "Sweden": "Suède",
    "Switzerland": "Suisse",
     "Iceland W": "Islande",
    "Greece": "Grèce",
    "Belarus": "Biélorussie",
    "Iceland": "Islande",
    "Malta": "Malte",
    "Lithuania": "Lituanie",
    "Northern Ireland": "Irlande du Nord",
    "Sevilla": "FC Séville",
    "Wales": "Pays de Galles",
    "Bulgaria": "Bulgarie",
    "Slovakia": "Slovaquie",
    "Türkiye": "Turquie",
    "Athletic Club": "Ath. Bilbao",
    "SC Braga": "Braga",
    "Kawazaki Frontale": "Kawazaki",
    "Manchester United": "Man United",
    "Bayern München": "Bayern",
    "Al-Hilal Saudi FC": "Al Hilal",
    "Hapoel Beer Sheva": "H. Beer Sheva",
    "Levski Sofia": "Levski",
    "Zeljeznicar Sarajevo": "Zeljeznicar",
    "Germany": "Allemagne",
    "Paris Saint-Germain": "PSG",
    "Bogota FC": "Bogota",
    "Olympique de Marseille": "OM",
    "Atlètic Club d'Escaldes": "Atletic Escaldes",
    "F91 Dudelange": "Dudelange",
    "Switzerland W": "Suisse",
    "West Ham United U21": "West Ham 21",
    "Boreham Wood": "Boreham",
    "Nottingham Forest": "Nottingham",
    "Hebburn Town": "Hebburn",
    "Spennymoor Town": "Spennymoor",
    "Deportes Tolima": "D. Tolima",
    "Alianza Petrolera": "Alianza",
    "IFK Norrkoping": "Norrkoping",
    "Senegal": "Senegal",
    "Deportivo Armenio": "D. Armenio",
    "Gangwon FC": "Gangwon",
    "Daejeon Citizen": "Daejeon",
    "Pohang Steelers": "Pohang",
    "Jeju United FC": "Jeju United",
    "Jeonbuk Motors": "Jeonbuk",
    "IF Brommapojkarna": "Bromapojkarna",
    "Poland W": "Pologne",
    "Sporting CP": "Sporting",
    "Club Brugge KV": "Club Brugge",
    "Lierse Kempenzonen": "k. Lierse SK",
    "Seattle Sounders": "Seattle",
    "Columbus Crew": "Columbus",
    "Deportes Copiapo": "Copiapo",
    "Shonan Bellmare": "Shonan",
    "Cerezo Osaka": "C. Osaka",
    "Denmark W": "Danemark",
    "Cliftonville FC": "Cliftonville",
    "Flora Tallinn": "Flora",
    "Kalju Nomme": "Kalju",
    "Germany W": "Allemagne",
    "Netherlands W": "Pays-Bas",
    "Wales W": "Pays de Galles",
    "Belgium W": "Belgique",
    "Belgium": "Belgique",
    "Inter Club d'Escaldes": "Inter",
    "Portugal W": "Portugal",
    "Spain W": "Espagne",
    "Tanzania": "Tanzanie",
    "Spain": "Espagne",
    "Morocco W": "Maroc",
    "Los Angeles FC": "LAFC",
    "Dinamo Minsk": "Din.Minsk",
    "FK Zalgiris Vilnius": "FK Zalgiris",
    "Sheriff Tiraspol": "S. Tiraspol",
    "Hamrun Spartans": "Hamrun",
    "Italy W": "Italie",
    "Italy": "italie",
    "Sweden W": "Suède",
    "Santiago Morning": "S.Morning",
    "Norway W": "Norvège", 
    "Finland W": "Finlande",
    "BK Hacken": "Hacken",
    "Hammarby FF": "Hammarby",
    "Kristiansund BK": "Kristiansund",
    "Borussia Dortmund": "Dortmund",
    "RB Leipzig": "Leipzig",
    "Bayer Leverkusen": "Leverkusen",
    "Arsenal FC": "Arsenal",
    "Chelsea FC": "Chelsea",
    "England W": "Angleterre",
    "Liverpool FC": "Liverpool",
    "Manchester City": "Man City",
    "England": "Angleterre",
    "Eintracht Frankfurt": "Francfort",
    "VfL Wolfsburg": "Wolfsburg",
    "Algeria W": "Algerie",
    "West Ham United": "West Ham",
    "Stade Brestois 29": "Brest",
    "NK Slaven Belupo": "Slaven",
    "HNK Hajduk Split": "Hajduk",
    "Istra 1961": "Istra",
    "HNK Rijeka": "Rijeka",
    "FC Copenhagen": "Copenhague",
    "Borussia Mönchengladbach": "M'gladbach",
    "FC Nordsjaelland": "Nordsjaelland",
    "Union La Calera": "U. Calera",
    "Mineros de Zacatecas": "Mineros",
    "Atletico Madrid": "Atl. Madrid",
    "Everton de Vina": "Everton",
    "Inter Miami CF": "Inter Miami",
    "Deportes Temuco": "Temuco",
    "Brazil": "Brésil",
    "Fortaleza FC": "Fortaleza",
    "Argentina": "Argentine",
    "Cambodia": "Cambodge",
    "San Marcos de Arica": "Arica",
    "Newcastle United": "Newcastle",
    "Equatorial Guinea": "Guinée Equatoriale",
    "Zambia": "Zambie",
    "Chad": "Tchad",
    "Somalia": "Somalie",
    "Guinea": "Guinée",
    "Guinea-Bissau": "Guinée-Bissau",
    "Union San Felipe": "San Filipe",
    "São Paulo FC": "São Paulo",
    "Mali W": "Mali",
    "South Africa W": "Afrique du Sud",
    "Ghana W": "Ghana",
    "Nigeria W": "Nigeria",
    "Zambia W": "Zambie",
    "Los Angeles Galaxy": "LA Galaxy",
    "Universidad de Concepcion": "U. de Concepcion",
    "Tanzania W": "Tanzanie",
    "New York City FC": "New York City",
    "Japan": "Japon",
    "Independiente Medellin": "Ind. Medellin",
    "FC Midtjylland": "Midtjylland",
    "Deportivo Laferrere": "Laferrere",
    "Uzbekistan": "Ouzbekistant",
    "South Korea": "Corée du Sud",
    "United States": "États-Unis",
    "Mexico": "Mexique",
    "Australia": "Australie",
    "Canada": "Canada",
    "Barcelona": "Barcelone",
    "Netherlands": "Pays-Bas",
    "Olympiacos FC": "Olympiakos",
    "Panathinaikos FC": "Panathinaikos",
    "AEK Athens FC": "AEK Athènes",
    "Croatia": "Croatie",
    "Napoli": "Naples",
    "Valur Reykjavik": "Valur",
    "Dinamo Bucuresti": "D. Bucarest",
    "FC Botosani": "Botosani",
    "Poland": "Pologne",
    "Serbia": "Serbie",
    "Moldova": "Moldavie",
    "CS Constantine": "Constantine",
    "Villa San Carlos": "San Carlos",
    "Czech Republic": "République Tchèque",
    "Denmark": "Danemark",
    "Scotland": "Ecosse",
    "Estonia": "Estonie",
    "Faroe Islands": "Ile Féroé",
    "Saudi Arabia W ": "Arabie Saoudite",
    "Turkey": "Turquie",
    "Cameroon": "Cameroun",
    "Ivory Coast": "Côte d'Ivoire",
    "Nigeria": "Nigéria",
    "South Africa": "Afrique du Sud",
    "China": "Chine",
    "France W": "France",
    "France": "France",
    "Qatar": "Qatar",
    "Egypt": "Égypte",
    "Tunisia": "Tunisie",
    "Algeria": "Algérie",
    "Rangers de Talca": "Rangers Talca",
    "Deportes Santa Cruz": "Santa Cruz",
    "Universidad de Chile": "U.de Chile",
    "Uruguay": "Uruguay",
    "Morocco": "Maroc",
    "AFC Hermannstadt": "Hermannstadt",
    "Grêmio": "Grêmio",
    "AD Ceuta FC": "AD Ceuta",
    "Atlético Mineiro": "Atlético MG",
    "Central African Republic": "Centrafique",
    "Internacional": "Internacional",
    "Rep. Of Ireland": "Irlande",
    "Hungary": "Hongrie",
    "Austria": "Autriche",
    "Cyprus": "Chypre",
    "Comoros":"Comores",
    "San Marino": "Saint-Martin",
    "Santos FC": "Santos",
    "Al-Nassr FC": "Al Nassr",
    "Al-Ittihad Club": "Al Ittihad",
    "Red Bull Salzburg": "RB Salzburg ",
    "Al-Ahli Saudi FC": "Al Ahli",
    "Maccabi Tel Aviv": "M. Tel Aviv",
    "Bangladesh": "Bangladesh",
    "PSV Eindhoven": "PSV",
  };

  return translations[name] || name;
};

const normalizeString = (str: string): string => {
  return str
    .normalize("NFD")                
    .replace(/[\u0300-\u036f]/g, "") 
    .toLowerCase();                  
};

const searchTranslations: { [key: string]: string } = {
  "espagne": "spain",
  "angleterre": "england",
  "allemagne": "germany",
  "tanzanie": "tanzania",
  "italie": "italy",
  "italy": "italy",
  "france": "france",
  "comores": "comoros",
  "pays bas": "netherlands",
  "portugal": "portugal",
  "belgique": "belgium",
  "argentine": "argentina",
  "centrafique":"Central African Republic",
  "bresil": "brazil",
  "psg": "paris saint germain",
  "paris": "paris saint germain",
  "om": "olympique de marseille",
  "man united": "manchester united",
  "man city": "manchester city",
  "real": "real madrid",
  "brésil": "brazil",
  "maroc": "morocco",
  "tunisie": "tunisia",
  "algerie": "algeria",
  "bulgarie": "bulgaria",
  "senegal": "senegal",
  "etats unis": "united states",
  "états unis": "united states",
  "mexique": "mexico",
  "cameroun": "cameroon",
  "cote d'ivoire": "ivory coast",
};

const getSearchQuery = (input: string): string => {
  const normalized = normalizeString(input);
  return searchTranslations[normalized] || input;
};

const sortMatchesByPriority = (matches) => {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(today.getDate() + 2);

  const liveStatuses = ["1H", "2H", "ET", "P", "LIVE", "HT", "BT", "INT"];

  const isLive = (match) => liveStatuses.includes(match.fixture.status.short);
  const isTodayOrTomorrow = (match) => {
    const date = new Date(match.fixture.date);
    return date >= today && date <= dayAfterTomorrow;
  };

  const liveMatches = matches.filter(isLive);
  const upcomingMatches = matches.filter((m) => !isLive(m) && isTodayOrTomorrow(m));
  const otherMatches = matches.filter((m) => !isLive(m) && !isTodayOrTomorrow(m));

  return [...liveMatches, ...upcomingMatches, ...otherMatches];
};

const LiveBadge = () => {
  const blinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.liveBadge, { opacity: blinkAnim }]}>
      <Text style={styles.liveBadgeText}>LIVE</Text>
    </Animated.View>
  );
};

export default function SearchScreen() {
  const inputAnim = useRef(new Animated.Value(0)).current;
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    const fetchMatchesForDay = async (date) => {
      const dateStr = date.toISOString().split("T")[0];
      const res = await fetch(`${API_URL}?date=${dateStr}`, {
        headers: {
          "x-apisports-key": API_KEY,
        },
      });
      const json = await res.json();
      return json.response || [];
    };

    const fetchMultipleDays = async () => {
      setLoading(true);
      try {
        const today = new Date();

        const days = [];
        for (let i = -30; i <= 50; i++) {
          const d = new Date();
          d.setDate(today.getDate() + i);
          days.push(d);
        }

        const results = await Promise.all(days.map(fetchMatchesForDay));
        const allMatches = results.flat();
        setMatches(allMatches);
      } catch (error) {
        console.error("Erreur lors du chargement des matchs :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMultipleDays();
  }, []);

  useEffect(() => {
  if (searchText.length < 2) {
    setSearchResults([]);
    return;
  }
  const fetchTeamMatches = async () => {
  try {
    setLoading(true);

    const query = getSearchQuery(searchText);

    const teamRes = await fetch(
      `https://v3.football.api-sports.io/teams?search=${query}`,
      { headers: { "x-apisports-key": API_KEY } }
    );
    const teamJson = await teamRes.json();

    if (!teamJson.response || teamJson.response.length === 0) {
      setSearchResults([]);
      setLoading(false);
      return;
    }

    const nationalTeam = teamJson.response.find((t) => t.team?.national === true);

    const selectedTeam = nationalTeam || teamJson.response[0];
    const teamId = selectedTeam.team.id;

    const [lastRes, nextRes] = await Promise.all([
      fetch(`${API_URL}?team=${teamId}&last=5`, {
        headers: { "x-apisports-key": API_KEY },
      }),
      fetch(`${API_URL}?team=${teamId}&next=5`, {
        headers: { "x-apisports-key": API_KEY },
      }),
    ]);

    const lastJson = await lastRes.json();
    const nextJson = await nextRes.json();

    const allMatches = [...(lastJson.response || []), ...(nextJson.response || [])];
    setSearchResults(sortMatchesByPriority(allMatches));
  } catch (error) {
    console.error("Erreur lors de la recherche :", error);
  } finally {
    setLoading(false);
  }
};

  fetchTeamMatches();
}, [searchText]);


  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <TextInput
          placeholder="Rechercher un match..."
          placeholderTextColor="#888"
          style={styles.headerSearchInput}
          value={searchText}
          onChangeText={(text) => setSearchText(text)}
        />
      ),
      headerLeft: () => (
        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      ),
      headerStyle: { backgroundColor: "#121212" },
      headerTitleAlign: "left",
      headerShown: true,
    });
  }, [navigation, searchText]);

  useEffect(() => {
    Animated.timing(inputAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, []);

  const renderItem = ({ item }) => <LiveScore item={item} />;

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator color="#fff" size="large" style={{ marginTop: 40 }} />
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.fixture.id.toString()}
          renderItem={renderItem}
        />
      ) : searchText.length >= 2 ? (
        <Text style={styles.noResultText}>Aucun match trouvé.</Text>
      ) : null}
    </View>
  );
}


const LiveScore = ({ item }) => {
  const { teams, goals, league, fixture } = item;
  const router = useRouter();

  const isClickable = true;

  const handlePress = () => {
    if (isClickable) {
      router.push(`/MatchDetailsScreen/${fixture.id}`);
    }
  };

  const isFinished = fixture.status.short === "FT" || fixture.status.long === "Match Finished";

  const liveStatuses = ["1H", "2H", "ET", "P", "LIVE", "HT", "BT", "INT"];

  const isLiveOrSpecialStatus = liveStatuses.includes(fixture.status.short);

  const displayTimeOrDate = isFinished
    ? "Terminé"
    : isLiveOrSpecialStatus
    ? fixture.status.elapsed !== null
      ? `${fixture.status.elapsed}'` 
      : fixture.status.short 
    : new Date(fixture.date).toLocaleString("fr-FR");

  const isElapsedTime = isLiveOrSpecialStatus && fixture.status.elapsed !== null;

 return (
  <TouchableOpacity
    onPress={handlePress}
    disabled={!isClickable}
    style={styles.card}
    activeOpacity={0.7}
  >
    {isLiveOrSpecialStatus && <LiveBadge />}

      <View style={styles.header}>
        <Image source={{ uri: league.logo }} style={styles.leagueLogo} />
        <Text style={styles.leagueText}>{league.name}</Text>
      </View>

      <Text
        style={
          isFinished
            ? styles.finishedText
            : isElapsedTime
            ? styles.elapsedTimeText
            : styles.dateText
        }
      >
        {displayTimeOrDate}
      </Text>

      <View style={styles.teamsRow}>
        <View style={styles.team}>
          <Image source={{ uri: teams.home.logo }} style={styles.teamLogo} />
          <Text style={styles.teamName}>{translateTeamName(teams.home.name)}</Text>
        </View>
        <Text style={styles.score}>
          {goals.home} - {goals.away}
        </Text>
        <View style={styles.team}>
          <Image source={{ uri: teams.away.logo }} style={styles.teamLogo} />
          <Text style={styles.teamName}>{translateTeamName(teams.away.name)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#121212",
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  headerSearchInput: {
    backgroundColor: "#222",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: "#fff",
    fontSize: 16,
    width: 250,
  },
    elapsedTimeText: {
    color: "red",
    fontSize: 18,
    marginTop: 8,
    textAlign: "center",
  },
  noResultText: {
    color: "#A8A5A5",
    textAlign: "center",
    marginTop: -20,
  },
  card: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  leagueLogo: {
    width: 18,
    height: 18,
    marginRight: 6,
  },
  leagueText: {
    color: "#aaa",
    fontSize: 12,
  },
  teamsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  team: {
    flexDirection: "column",
    alignItems: "center",
    width: "40%",
  },
  teamLogo: {
    width: 40,
    height: 40,
    marginBottom: 4,
  },
  teamName: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    flexShrink: 1,
  },
  score: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  dateText: {
    color: "#777",
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
    finishedText: {
    color: "#EFECEC",      
    fontWeight: "bold",    
    fontSize: 14,
    textAlign: "center",
    marginBottom: -10,       
  },
  liveBadge: {
  position: "absolute",
  top: 10,
  right: 10,
  backgroundColor: "#e50914",
  borderRadius: 5,
  paddingHorizontal: 8,
  paddingVertical: 2,
  zIndex: 10,
},
liveBadgeText: {
  color: "#fff",
  fontWeight: "bold",
  fontSize: 12,
},

});
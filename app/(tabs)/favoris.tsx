import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { useFavorites } from "@/context/FavoritesContext";
import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

const translateTeamName = (name: string) => {
  const translations: { [key: string]: string } = {
    "Paris Saint Germain": "PSG",
    "Manchester United": "Man United",
    "Al-Hilal Saudi FC": "Al Hilal",
    "Universidad de Concepcion": "U. de Concepcion",
    "Mali W": "Mali",
    "South Africa W": "Afrique du Sud",
    "Ghana W": "Ghana",
    "FC Botosani": "Botosani",
    "Tanzania W": "Tanzanie",
    "Los Angeles Galaxy": "LA Galaxy",
    "Dinamo Bucuresti": "D. Bucarest",
    "Independiente Medellin": "Ind. Medellin",
    "FK Zalgiris Vilnius": "FK Zalgiris",
    "Hamrun Spartans": "Hamrun",
    "Los Angeles FC": "LAFC",
    "Deportes Copiapo": "Copiapo",
    "Brown DE Adrogue": "Brown Adrogue",
    "Santiago Morning": "S.Morning",
    "Germany M": "Allemagne",
    "Poland W": "Pologne",
    "Netherlands W": "Pays-Bas",
    "Fortaleza FC": "Fortaleza",
    "Hammarby FF": "Hammarby",
    "Nigeria W": "Nigeria",
    "Zambia W": "Zambie",
    "Kristiansund BK": "Kristiansund",
    "BK Hacken": "Hacken",
    "Sweden W": "Suède",
    "Belgium W": "Belgique",
    "Denmark W": "Danemark",
    "Universidad de Chile": "U.de Chile",
    "Germany W": "Allemagne",
    "Paris Saint-Germain": "PSG",
    "AFC Hermannstadt": "Hermannstadt",
    "Rangers de Talca": "Rangers Talca",
    "Deportes Santa Cruz": "Santa Cruz",
    "Union San Felipe": "San Filipe",
    "Shonan Bellmare": "Shonan",
    "Gangwon FC": "Gangwon",
    "Jeju United FC": "Jeju United",
    "Senegal W": "Sénégal",
    "Pohang Steelers": "Pohang",
    "Jeonbuk Motors": "Jeonbuk",
    "Daejeon Citizen": "Daejeon",
    "Club Brugge KV": "Club Brugge",
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
    "RB Leipzig": "Leipzig",
    "Algeria W": "Algerie",
    "IFK Norrkoping": "Norrkoping",
    "IF Brommapojkarna": "Brommapojkarna",
    "England W": "Angleterre",
    "France W": "France",
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
    "Napoli": "Naples",
    "Switzerland W": "Suisse",
    "Iceland W": "Islande",
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
    "Algeria": "Algérie",
    "Uruguay": "Uruguay",
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
    "Al-Ahli Saudi FC": "Al Ahli",
    "Atlètic Club d'Escaldes": "Atletic Escaldes",
    "F91 Dudelange": "Dudelange",
    "Stade Brestois 29": "Brest",
    "Georgia": "Georgie",
    "Malta": "Malte",
    "Lithuania": "Lituanie",
    "Northern Ireland": "Irlande du Nord",
    "Türkiye": "Turquie",
    "Wales": "Pays de Galles",
    "Bulgaria": "Bulgarie",
    "Slovakia": "Slovaquie",
    "Rot-Weiß Essen": "RW Essen",
    "FC Copenhagen": "Copenhague",
    "Borussia Mönchengladbach": "M'gladbach",
    "FC Nordsjaelland": "Nordsjaelland",
    "Avispa Fukuoka": "Fukuoka",
    "Shimizu S-pulse": "Shimizu",
    "Yokohama F. Marinos": "Yokohama",
    "Sevilla": "FC Séville",
    "Athletic Club": "Ath. Bilbao",
    "SC Braga": "Braga",
    "Kawazaki Frontale": "Kawazaki",
    "NK Slaven Belupo": "Slaven",
    "HNK Rijeka": "Rijeka",
    "Union La Calera": "U. Calera",
    "Mineros de Zacatecas": "Mineros",
    "Atletico Madrid": "Atl. Madrid",
    "Everton de Vina": "Everton",
    "Bogota FC": "Bogota",
    "Red Bull Salzburg": "RB Salzburg ",
    "Nottingham Forest": "Nottingham",
    "Maccabi Tel Aviv": "M. Tel Aviv",
    "PSV Eindhoven": "PSV",
    "Senegal": "Sénégal",
  };
  return translations[name] || name;
};

const API_URL = "https://v3.football.api-sports.io/fixtures";
const API_KEY = "b8b570d6f3ff7a8653dee3fb8922d929";

export default function FavorisPage() {
  const { favorites, setFavorites, removeFavorite } = useFavorites();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const fadeAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    blink.start();
    return () => blink.stop();
  }, []);

  const handlePress = (fixtureId: number) => {
    router.push(`/MatchDetailsScreen/${fixtureId}`);
  };

  const handleDirectDelete = async (matchId: number) => {
    await removeFavorite(matchId);
  };

  const fixtureIdsRef = useRef<number[]>([]);

  const fetchMatchData = useCallback(async () => {
    try {
      setError(null);

      fixtureIdsRef.current = favorites.map((fav) => fav.fixture.id);
      if (fixtureIdsRef.current.length === 0) return;

      const idsQuery = fixtureIdsRef.current.join("-");
      const response = await fetch(`${API_URL}?ids=${idsQuery}`, {
        headers: {
          "x-apisports-key": API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur serveur : ${response.status}`);
      }

      const data = await response.json();

      if (data.response) {
        const updatedFavorites = favorites.map((fav) => {
          const updated = data.response.find(
            (item: any) => item.fixture.id === fav.fixture.id
          );
          return updated || fav;
        });
        setFavorites(updatedFavorites);
      }
    } catch (error) {
      console.error("Erreur de mise à jour des favoris :", error);
      setError("Impossible de mettre à jour les favoris.");
    }
  }, []);

  useEffect(() => {
    fetchMatchData();
    const interval = setInterval(() => {
      fetchMatchData();
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  const sortedFavorites = [...favorites].sort((a, b) => {
    const liveStatus = ["1H", "2H", "LIVE"];

    const aIsLive = liveStatus.includes(a.fixture.status.short);
    const bIsLive = liveStatus.includes(b.fixture.status.short);

    const aIsUpcoming = a.fixture.status.short === "NS";
    const bIsUpcoming = b.fixture.status.short === "NS";

    if (aIsLive && !bIsLive) return -1;
    if (!aIsLive && bIsLive) return 1;

    if (aIsUpcoming && !bIsUpcoming) return 1;
    if (!aIsUpcoming && bIsUpcoming) return -1;

    return 0;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favoris</Text>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {sortedFavorites.length === 0 ? (
          <Text style={styles.emptyText}>
            Vous n'avez aucun favoris pour le moment.
          </Text>
        ) : (
          sortedFavorites.map((item, index) => {
            const isUpcoming = item.fixture.status.short === "NS";
            const isLive =
              item.fixture.status.short === "1H" ||
              item.fixture.status.short === "2H" ||
              item.fixture.status.short === "LIVE";
            const matchDate = new Date(item.fixture.date);
            const formattedDate = matchDate.toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <TouchableOpacity
                key={item.fixture.id}
                style={styles.favoriItem}
                onPress={() => handlePress(item.fixture.id)}
                activeOpacity={0.8}
              >
                <View style={styles.matchContainer}>
                  <View style={styles.teamContainer}>
                    <Image
                      source={{ uri: item.teams.home.logo }}
                      style={styles.teamLogo}
                    />
                    <Text style={styles.teamName}>{translateTeamName(item.teams.home.name)}</Text>
                  </View>

                  <View style={styles.vsContainer}>
                    {isUpcoming ? (
                      <Text style={styles.matchDate}>{formattedDate}</Text>
                    ) : item.fixture.status.short === "HT" ? (
                      <Text style={styles.halftimeText}>MT</Text>
                    ) : item.fixture.status.short === "INT" ? (
                      <Text style={styles.halftimeText}>Interrompu</Text>
                    ) : item.fixture.status.short === "FT" ||
                      item.fixture.status.short === "AET" ||
                      item.fixture.status.short === "PEN" ? (
                      <>
                        <Text style={styles.finishedText}>Terminé</Text>
                        <Text style={styles.scoreText}>
                          {item.goals.home} - {item.goals.away}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text style={styles.liveTime}>
                          {item.fixture.status.elapsed}'
                        </Text>
                        <Text style={styles.scoreText}>
                          {item.goals.home} - {item.goals.away}
                        </Text>
                      </>
                    )}
                    {isUpcoming && <Text style={styles.vs}>VS</Text>}
                  </View>

                  <View style={styles.teamContainer}>
                    <Image
                      source={{ uri: item.teams.away.logo }}
                      style={styles.teamLogo}
                    />
                    <Text style={styles.teamName}>{translateTeamName(item.teams.away.name)}</Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleDirectDelete(item.fixture.id)}
                    style={styles.bellIconContainer}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash" size={22} color="white" />
                  </TouchableOpacity>

                  {isLive && (
                    <Animated.View
                      style={[styles.liveBadge, { opacity: fadeAnim }]}
                    >
                      <Text style={styles.liveBadgeText}>LIVE</Text>
                    </Animated.View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    color: "white",
    fontWeight: "bold",
    marginBottom: 30,
  },
  emptyText: {
    color: "gray",
    fontSize: 16,
    fontStyle: "italic",
    alignSelf: "center",
  },
  favoriItem: {
    backgroundColor: "#222",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  matchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
  },
  teamContainer: {
    flex: 1,
    alignItems: "center",
  },
  teamLogo: {
    width: 40,
    height: 40,
    marginBottom: 5,
  },
  teamName: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
  },
  vsContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
  },
  matchDate: {
    color: "#aaa",
    fontSize: 12,
    marginBottom: 2,
  },
  liveTime: {
    color: "red",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 7,
  },
  scoreText: {
    color: "white",
    fontSize: 21,
    fontWeight: "bold",
  },
  vs: {
    color: "#666",
    fontSize: 19,
  },
  bellIconContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    padding: 0,
  },
  liveBadge: {
    position: "absolute",
    top: 0,
    left: -8,
    backgroundColor: "red",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderTopLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  liveBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  deleteMessageContainer: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "#333",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 5,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  finishedText: {
    color: "#EFECEC",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 7,
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  cancelButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cancelButtonText: {
    color: "lightgray",
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: "#ff4d4d",
    padding: 10,
    borderRadius: 6,
    marginBottom: 15,
  },
  errorText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  halftimeText: {
    color: "red",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 7,
  },
});

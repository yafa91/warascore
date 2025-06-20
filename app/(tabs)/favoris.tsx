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

const API_URL = "https://v3.football.api-sports.io/fixtures";
const API_KEY = "b8b570d6f3ff7a8653dee3fb8922d929";

export default function FavorisPage() {
  const { favorites, setFavorites, removeFavorite } = useFavorites();
  const router = useRouter();
  const [matchToDelete, setMatchToDelete] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fadeAnim = useState(new Animated.Value(1))[0];
 
  const handleCancelDelete = () => {
  setMatchToDelete(null);
};

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

  const handleShowDeleteMessage = (matchId: number) => {
    setMatchToDelete(matchId);
  };

const handleDelete = async () => {
  if (matchToDelete !== null) {
    const updatedFavorites = favorites.filter(fav => fav.fixture.id !== matchToDelete);
    setFavorites(updatedFavorites);
    setMatchToDelete(null);
  }
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
          (item) => item.fixture.id === fav.fixture.id
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
                    <Text style={styles.teamName}>{item.teams.home.name}</Text>
                  </View>

                      <View style={styles.vsContainer}>
  {isUpcoming ? (
    <Text style={styles.matchDate}>{formattedDate}</Text>
  ) : item.fixture.status.short === "HT" ? (
    <Text style={styles.halftimeText}>Mi-temps</Text>
  ) : item.fixture.status.short === "INT" ? (
    <Text style={styles.halftimeText}>Interruption</Text>
  ) : item.fixture.status.short === "FT" || item.fixture.status.short === "AET" || item.fixture.status.short === "PEN" ? (
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
                    <Text style={styles.teamName}>{item.teams.away.name}</Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleShowDeleteMessage(item.fixture.id)}
                    style={styles.bellIconContainer}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons
                      name="notifications"
                      size={24}
                      color="white"
                    />
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

      {matchToDelete !== null && (
        <View style={styles.deleteMessageContainer}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="delete"
              size={20}
              color="red"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.deleteButtonText}>
              Supprimer le match des favoris
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleCancelDelete}
            style={styles.cancelButton}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      )}
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
    fontSize: 16,
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

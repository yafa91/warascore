import { removeFavorite } from "@/utils/favoriteUtils";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { useFavorites } from "@/context/FavoritesContext";

export default function FavorisPage() {
  const { favorites } = useFavorites();
  const router = useRouter();

  const handlePress = (matchId: number) => {
    router.push(`MatchDetailsScreen/MatchDetailsScreen/DetailsPro/${matchId}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favoris</Text>

      {favorites.length === 0 ? (
        <Text style={styles.emptyText}>
          Vous n'avez aucun favori pour le moment.
        </Text>
      ) : (
        favorites.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.favoriItem}
            onPress={() => handlePress(item.fixture.id)}
          >
            <View style={styles.matchContainer}>
              <View style={styles.teamContainer}>
                <Image
                  source={{ uri: item.teams.home.logo }}
                  style={styles.teamLogo}
                />
                <Text style={styles.teamName}>{item.teams.home.name}</Text>
              </View>
              <Text style={styles.vs}>VS</Text>
              <View style={styles.teamContainer}>
                <Image
                  source={{ uri: item.teams.away.logo }}
                  style={styles.teamLogo}
                />
                <Text style={styles.teamName}>{item.teams.away.name}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
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
    fontSize: 24,
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
  vs: {
    color: "#666",
    fontSize: 16,
    marginHorizontal: 10,
  },
});

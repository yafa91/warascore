import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_KEY = "favoriteMatches";

export const getFavorites = async (): Promise<any[]> => {
  const favorites = await AsyncStorage.getItem(FAVORITES_KEY);
  return favorites ? JSON.parse(favorites) : [];
};

export const addFavorite = async (match: any) => {
  try {
    const favorites = await getFavorites();
    // Vérifie si le match existe déjà dans les favoris
    const matchExists = favorites.some(
      (fav) => fav.fixture.id === match.fixture.id
    );

    if (!matchExists) {
      const updatedFavorites = [...favorites, match];
      await AsyncStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(updatedFavorites)
      );
      return true; // Ajout réussi
    }
    return false; // Match déjà dans les favoris
  } catch (error) {
    console.error("Erreur lors de l'ajout aux favoris:", error);
    return false;
  }
};

export const removeFavorite = async (match: any) => {
  try {
    const favorites = await getFavorites();
    // Vérifie si le match existe dans les favoris
    const matchExists = favorites.some(
      (fav) => fav.fixture.id === match.fixture.id
    );

    if (matchExists) {
      const updatedFavorites = favorites.filter(
        (m) => m.fixture.id !== match.fixture.id
      );
      await AsyncStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(updatedFavorites)
      );
      return true; // Suppression réussie
    }
    return false; // Match non trouvé dans les favoris
  } catch (error) {
    console.error("Erreur lors de la suppression des favoris:", error);
    return false;
  }
};

export const isFavorite = async (matchId: number): Promise<boolean> => {
  const favorites = await getFavorites();
  return favorites.some((m) => m.fixture.id === matchId);
};

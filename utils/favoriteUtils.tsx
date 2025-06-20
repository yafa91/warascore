import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_KEY = "favoriteMatches";

export const getFavorites = async (): Promise<any[]> => {
  const favorites = await AsyncStorage.getItem(FAVORITES_KEY);
  return favorites ? JSON.parse(favorites) : [];
};

export const saveFavorites = async (favorites: any[]) => {
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
};

export const addFavorite = async (match: any) => {
  try {
    const favorites = await getFavorites();
    const matchExists = favorites.some(
      (fav) => fav.fixture.id === match.fixture.id
    );

    if (!matchExists) {
      const updatedFavorites = [...favorites, match];
      await saveFavorites(updatedFavorites);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Erreur lors de l'ajout aux favoris:", error);
    return false;
  }
};

export const removeFavorite = async (matchId: number) => {
  try {
    const favorites = await getFavorites();
    const updatedFavorites = favorites.filter(
      (m) => m.fixture.id !== matchId
    );
    await saveFavorites(updatedFavorites);
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression des favoris:", error);
    return false;
  }
};

export const isFavorite = async (matchId: number): Promise<boolean> => {
  const favorites = await getFavorites();
  return favorites.some((m) => m.fixture.id === matchId);
};

export const removeFinishedMatchesFromFavorites = async (): Promise<void> => {
  try {
    const favorites = await getFavorites();

    const ongoingOrUpcoming = favorites.filter((match) => {
      const status = match?.fixture?.status?.short;
      return !["FT", "AET", "PEN", "CANC", "ABD", "AWD", "WO", "PST"].includes(status);
    });

    if (ongoingOrUpcoming.length !== favorites.length) {
      await saveFavorites(ongoingOrUpcoming);
      console.log("✅ Matchs terminés supprimés des favoris.");
    }
  } catch (error) {
    console.error("Erreur lors de la suppression automatique des matchs terminés:", error);
  }
};

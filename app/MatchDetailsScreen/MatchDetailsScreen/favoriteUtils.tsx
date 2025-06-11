import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_KEY = "user_favorites";

export const saveFavorites = async (favorites: Set<number>) => {
  try {
    const favArray = Array.from(favorites);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favArray));
  } catch (error) {
    console.error("Erreur de sauvegarde des favoris :", error);
  }
};

export const loadFavorites = async (): Promise<Set<number>> => {
  try {
    const stored = await AsyncStorage.getItem(FAVORITES_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return new Set(parsed);
    }
  } catch (error) {
    console.error("Erreur de chargement des favoris :", error);
  }
  return new Set();
};

import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = 'favoriteMatches';

export const getFavorites = async (): Promise<any[]> => {
  const favorites = await AsyncStorage.getItem(FAVORITES_KEY);
  return favorites ? JSON.parse(favorites) : [];
};

export const addFavorite = async (match: any) => {
  const favorites = await getFavorites();
  const updatedFavorites = [...favorites, match];
  console.log(updatedFavorites)
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
};

export const removeFavorite = async (matchId: number) => {
  const favorites = await getFavorites();
  const updatedFavorites = favorites.filter(m => m.id !== matchId);
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
};

export const isFavorite = async (matchId: number): Promise<boolean> => {
  const favorites = await getFavorites();
  return favorites.some(m => m.fixture.id === matchId);
};

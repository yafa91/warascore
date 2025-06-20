import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import {
  getFavorites,
  saveFavorites,
  removeFavorite as removeFavoriteUtil,
  removeFinishedMatchesFromFavorites,
} from "@/utils/favoriteUtils";

type FavoritesContextType = {
  favorites: any[];
  setFavorites: (favorites: any[]) => void;
  refreshFavorites: () => Promise<void>;
  isFavorite: (matchId: number) => boolean;
  toggleFavorite: (match: any) => Promise<void>;
  removeFavorite: (matchId: number) => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const [favorites, setFavorites] = useState<any[]>([]);

  const refreshFavorites = useCallback(async () => {
    try {
      const allFavorites = await getFavorites();
      setFavorites(allFavorites);
    } catch (error) {
      console.error("❌ Erreur lors du chargement des favoris:", error);
      setFavorites([]);
    }
  }, []);

  const isFavorite = useCallback(
    (matchId: number) => {
      return favorites.some((fav) => fav.fixture.id === matchId);
    },
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (match: any) => {
      try {
        const matchId = match.fixture.id;
        const alreadyFav = isFavorite(matchId);

        let updatedFavorites;
        if (alreadyFav) {
          updatedFavorites = favorites.filter((f) => f.fixture.id !== matchId);
        } else {
          updatedFavorites = [...favorites, match];
        }

        setFavorites(updatedFavorites);
        await saveFavorites(updatedFavorites);
      } catch (error) {
        console.error("❌ Erreur lors du toggle du favori:", error);
      }
    },
    [favorites, isFavorite]
  );

 const removeFavorite = useCallback(
  async (matchId: number) => {
    try {
      const updatedFavorites = favorites.filter(
        (fav) => fav.fixture.id !== matchId
      );
      setFavorites(updatedFavorites); 
      await saveFavorites(updatedFavorites); 
    } catch (error) {
      console.error("❌ Erreur lors de la suppression du favori:", error);
    }
  },
  [favorites]
);

  useEffect(() => {
    const init = async () => {
      await removeFinishedMatchesFromFavorites();
      await refreshFavorites();
    };
    init();
  }, [refreshFavorites]);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        setFavorites,
        refreshFavorites,
        isFavorite,
        toggleFavorite,
        removeFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};

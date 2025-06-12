import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { getFavorites } from "@/utils/favoriteUtils";

type FavoritesContextType = {
  favorites: any[];
  setFavorites: (favorites: any[]) => void;
  refreshFavorites: () => Promise<void>;
  isFavorite: (matchId: number) => boolean;
  toggleFavorite: (match: any) => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

export const FavoritesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [favorites, setFavorites] = useState<any[]>([]);

  const refreshFavorites = useCallback(async () => {
    try {
      const allFavorites = await getFavorites();
      setFavorites(allFavorites);
    } catch (error) {
      console.error("Erreur lors du chargement des favoris:", error);
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
        const isFav = isFavorite(match.fixture.id);
        if (isFav) {
          const updatedFavorites = favorites.filter(
            (fav) => fav.fixture.id !== match.fixture.id
          );
          setFavorites(updatedFavorites);
        } else {
          setFavorites([...favorites, match]);
        }
        await refreshFavorites();
      } catch (error) {
        console.error("Erreur lors de la modification des favoris:", error);
      }
    },
    [favorites, isFavorite, refreshFavorites]
  );

  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        setFavorites,
        refreshFavorites,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};

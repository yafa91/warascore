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
      console.error("❌ Erreur lors du chargement des favoris:", error);
      setFavorites([]);
    }
  }, []);

  const isFavorite = useCallback(
    (matchId: number) => {
      const result = favorites.some((fav) => fav.fixture.id === matchId);
      console.log("🔍 Vérification favori pour match", matchId, ":", result);
      return result;
    },
    [favorites]
  );

  const toggleFavorite = useCallback(async (match: any) => {
    try {
      const matchId = match.fixture.id;
      console.log("🔄 Toggle favori pour le match:", matchId);

      setFavorites((prevFavorites) => {
        const alreadyFav = prevFavorites.some(
          (fav) => fav.fixture.id === matchId
        );
        console.log("📋 Match déjà en favori:", alreadyFav);
        console.log("📋 Nombre de favoris actuels:", prevFavorites.length);

        let updatedFavorites;
        if (alreadyFav) {
          updatedFavorites = prevFavorites.filter(
            (f) => f.fixture.id !== matchId
          );
          console.log("🗑️ Match supprimé des favoris");
        } else {
          updatedFavorites = [...prevFavorites, match];
          console.log("➕ Match ajouté aux favoris");
        }

        console.log("📋 Nouveau nombre de favoris:", updatedFavorites.length);

        // Sauvegarder de manière asynchrone
        saveFavorites(updatedFavorites);
        return updatedFavorites;
      });
    } catch (error) {
      console.error("❌ Erreur lors du toggle du favori:", error);
    }
  }, []);

  const removeFavorite = useCallback(async (matchId: number) => {
    try {
      setFavorites((prevFavorites) => {
        const updatedFavorites = prevFavorites.filter(
          (fav) => fav.fixture.id !== matchId
        );
        saveFavorites(updatedFavorites);
        return updatedFavorites;
      });
    } catch (error) {
      console.error("❌ Erreur lors de la suppression du favori:", error);
    }
  }, []);

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

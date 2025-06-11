import React, { createContext, useState, useContext } from 'react';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favoriteMatches, setFavoriteMatches] = useState([]);

  const toggleFavorite = (matchId) => {
    setFavoriteMatches((prev) =>
      prev.includes(matchId)
        ? prev.filter((id) => id !== matchId)
        : [...prev, matchId]
    );
  };

  return (
    <FavoritesContext.Provider value={{ favoriteMatches, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);

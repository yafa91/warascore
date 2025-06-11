import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function FavorisPage() {
  // Exemple : favoris vide
  const [favoris, setFavoris] = useState([]);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favoris</Text>

      {favoris.length === 0 ? (
        <Text style={styles.emptyText}>Vous n'avez aucun favori pour le moment.</Text>
      ) : (
        favoris.map((item, index) => (
          <Text key={index} style={styles.favoriItem}>{item}</Text>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 30,
  },
  emptyText: {
    color: 'gray',
    fontSize: 16,
    fontStyle: 'italic',
    alignSelf: 'center',
  },
  favoriItem: {
    color: 'white',
    fontSize: 18,
    marginBottom: 10,
  },
});

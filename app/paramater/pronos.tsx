import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const STORAGE_KEY_HISTORY = 'pronostics';

export default function Pronos() {
  const [history, setHistory] = useState([]);

  const loadHistory = async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY_HISTORY);
      if (json) {
        setHistory(JSON.parse(json));
      }
    } catch (e) {
      console.error("Erreur de chargement de l'historique :", e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Historique de tes pronostics</Text>
      {history.length === 0 ? (
        <Text style={styles.emptyText}>Ton pronostic sera affiché à la fin du match.</Text>
      ) : (
        history
          .slice()
          .reverse()
          .map((entry, index) => {
            const isMatchFinished = entry.matchStatus === "FT"; 
            // adapte ce test si tu as un autre code pour fin de match

            return (
              <View key={index} style={styles.card}>
                <Text style={styles.match}>{entry.match}</Text>
                <Text style={styles.detail}>
                  Ton pronostic : <Text style={styles.bold}>{entry.prediction}</Text>
                </Text>

                {isMatchFinished ? (
                  <>
                    <Text style={styles.detail}>
                      Résultat : <Text style={styles.bold}>{entry.actualResult || '-'}</Text>
                    </Text>
                    <Text style={[
                      styles.result,
                      entry.result === 'win' ? styles.win : styles.lose
                    ]}>
                      {entry.result === 'win' ? '✅ Gagné' : '❌ Perdu'}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.detail}>Résultat disponible à la fin du match.</Text>
                )}
              </View>
            );
          })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#121212',
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  emptyText: {
    color: '#aaa',
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: '#1e1e1e',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  match: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  detail: {
    color: '#ccc',
    marginTop: 4,
  },
  bold: {
    color: 'white',
    fontWeight: 'bold',
  },
  result: {
    marginTop: 8,
    fontWeight: 'bold',
    fontSize: 16,
  },
  win: {
    color: '#4caf50',
  },
  lose: {
    color: '#f44336',
  },
});

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_HISTORY = 'pronostics';

const options = [
  { label: "Équipe A gagne", value: "home" },
  { label: "Match nul", value: "draw" },
  { label: "Équipe B gagne", value: "away" },
];

const secondaryOptions = [
  { label: "Oui", value: "yes" },
  { label: "Non", value: "no" },
];

export default function LivePrediction({ onResultCheck, teamHome, teamAway, events, matchStatus }) {
  const [selected, setSelected] = useState(null);
  const [secondSelected, setSecondSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [result, setResult] = useState(null);
  const [secondResult, setSecondResult] = useState(null);
  const [history, setHistory] = useState([]);

  const matchKey = `${teamHome}_${teamAway}_${new Date().toDateString()}`;
  const STORAGE_KEY_CURRENT = `current_pronostic_${matchKey}`;

  useEffect(() => {
    async function loadAll() {
      try {
        const jsonHistory = await AsyncStorage.getItem(STORAGE_KEY_HISTORY);
        if (jsonHistory) setHistory(JSON.parse(jsonHistory));

        const jsonCurrent = await AsyncStorage.getItem(STORAGE_KEY_CURRENT);
        if (jsonCurrent) {
          const current = JSON.parse(jsonCurrent);
          if (current.confirmed) {
            setSelected(current.selected);
            setSecondSelected(current.secondSelected || null);
            setConfirmed(current.confirmed);
            setResult(current.result || null);
            setSecondResult(current.secondResult || null);
          }
        }
      } catch (e) {
        console.error("Erreur chargement pronostics", e);
      }
    }
    loadAll();
  }, [matchKey]);

  useEffect(() => {
    if (
      confirmed &&
      matchStatus === "FT" &&
      (result === null || secondResult === null)
    ) {
      const realResult = onResultCheck();
      const res = realResult === selected ? 'win' : 'lose';

      const bothScored =
        events.some(e => e.type === 'Goal' && e.team.name === teamHome) &&
        events.some(e => e.type === 'Goal' && e.team.name === teamAway);

      const realSecond = bothScored ? 'yes' : 'no';
      const secondRes = secondSelected === realSecond ? 'win' : 'lose';

      setResult(res);
      setSecondResult(secondRes);

      const updatedEntry = {
        match: `${teamHome} vs ${teamAway}`,
        prediction: selected,
        actualResult: realResult,
        result: res,
        bothTeamsPrediction: secondSelected,
        bothTeamsActual: realSecond,
        bothTeamsResult: secondRes,
        timestamp: Date.now(),
        matchStatus,  // **ici on ajoute le statut du match**
      };

      // On remplace l'entrée correspondante non encore actualisée
      const updatedHistory = history.map(entry =>
        entry.match === updatedEntry.match && (entry.actualResult == null || entry.matchStatus !== "FT")
          ? updatedEntry
          : entry
      );

      setHistory(updatedHistory);
      saveHistory(updatedHistory);
      saveCurrent({
        selected,
        secondSelected,
        confirmed,
        result: res,
        secondResult: secondRes,
        matchStatus, // on sauvegarde aussi dans current
      });
    }
  }, [confirmed, matchStatus]);

  useEffect(() => {
    if (confirmed) {
      saveCurrent({ selected, secondSelected, confirmed, result, secondResult, matchStatus });
    }
  }, [selected, secondSelected, confirmed, result, secondResult, matchStatus]);

  async function saveHistory(data) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(data));
    } catch (e) {
      console.error("Erreur sauvegarde pronostics", e);
    }
  }

  async function saveCurrent(data) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(data));
    } catch (e) {
      console.error("Erreur sauvegarde pronostic actuel", e);
    }
  }

  if (matchStatus !== "LIVE" && matchStatus !== "NS") return null;

  if (result && secondResult) {
    return (
      <View style={styles.container}>
        <Text style={styles.resultText}>
          {result === 'win'
            ? '🔥 Bon résultat principal !'
            : '❌ Mauvais résultat principal.'}
        </Text>
        <Text style={styles.resultText}>
          {secondResult === 'win'
            ? '✅ Bonne prédiction sur les deux équipes qui marquent !'
            : '❌ Mauvaise prédiction sur les buteurs.'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Qui va gagner le match ?</Text>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[
            styles.option,
            selected === opt.value && styles.optionSelected
          ]}
          onPress={() => !confirmed && setSelected(opt.value)}
        >
          <Text style={styles.optionText}>
            {opt.label
              .replace("Équipe A", teamHome)
              .replace("Équipe B", teamAway)}
          </Text>
        </TouchableOpacity>
      ))}

      <Text style={[styles.title, { marginTop: 16 }]}>Les deux équipes marquent ?</Text>
      {secondaryOptions.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[
            styles.option,
            secondSelected === opt.value && styles.optionSelected
          ]}
          onPress={() => !confirmed && setSecondSelected(opt.value)}
        >
          <Text style={styles.optionText}>{opt.label}</Text>
        </TouchableOpacity>
      ))}

      {!confirmed && selected && secondSelected && (
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={async () => {
            setConfirmed(true);

            const newEntry = {
              match: `${teamHome} vs ${teamAway}`,
              prediction: selected,
              actualResult: null,
              result: null,
              bothTeamsPrediction: secondSelected,
              bothTeamsActual: null,
              bothTeamsResult: null,
              timestamp: Date.now(),
              matchStatus,  // **On ajoute ici aussi**
            };

            const updatedHistory = [...history, newEntry];
            setHistory(updatedHistory);
            await saveHistory(updatedHistory);
            await saveCurrent({
              selected,
              secondSelected,
              confirmed: true,
              result: null,
              secondResult: null,
              matchStatus,
            });
          }}
        >
          <Text style={styles.confirmText}>Valider mon pronostic</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  option: {
    backgroundColor: '#615F5F',
    padding: 8,
    borderRadius: 10,
    marginVertical: 5,
  },
  optionSelected: {
    backgroundColor: '#2e7d32',
  },
  optionText: { color: 'white' },
  confirmButton: {
    backgroundColor: '#0066cc',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  confirmText: { color: 'white', fontWeight: 'bold' },
  resultText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 6,
  }
});

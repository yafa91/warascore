import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Button,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const STORAGE_KEY_HISTORY = "pronostics";

interface PronosticEntry {
  matchId: string;
  match: string;
  prediction: "home" | "draw" | "away" | null;
  actualResult: string | null;
  result: "win" | "lose" | null;
  matchStatus: string;
  timestamp: number;
  bothTeamsPrediction?: "yes" | "no" | null;
}

interface MatchApiData {
  status: string;
  homeGoals: number;
  awayGoals: number;
}
const API_KEY = "b8b570d6f3ff7a8653dee3fb8922d929";

async function fetchMatchStatusAndScore(
  matchId: string
): Promise<MatchApiData | null> {
  try {
    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures?id=${matchId}`,
      { headers: { "x-apisports-key": API_KEY } }
    );
    const data = await response.json();
    if (!data.response || !data.response[0]) {
      console.log(`[API] Pas de résultat pour matchId=${matchId}`);
      return null;
    }
    const fixture = data.response[0];
    console.log(`[API] Résultat pour matchId=${matchId} :`, fixture);
    return {
      status: fixture.fixture.status.short,
      homeGoals: fixture.goals.home,
      awayGoals: fixture.goals.away,
    };
  } catch (e) {
    console.error(`[API] Erreur pour matchId=${matchId}`, e);
    return null;
  }
}

const cleanOldPronostics = async () => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY_HISTORY);
    if (json) {
      const parsed = JSON.parse(json) as PronosticEntry[];
      const filtered = parsed.filter((entry) => entry.matchId);
      await AsyncStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(filtered));
      Alert.alert(
        "Nettoyage effectué",
        `${parsed.length - filtered.length} pronostics supprimés (sans matchId)`
      );
      console.log(
        `[CLEAN] Pronostics sans matchId supprimés : ${
          parsed.length - filtered.length
        }`
      );
    }
  } catch (e) {
    Alert.alert("Erreur nettoyage", "Impossible de nettoyer l'historique");
    console.error("[CLEAN] Erreur nettoyage :", e);
  }
};

export default function Pronos() {
  const [history, setHistory] = useState<PronosticEntry[]>([]);
  const [matchResults, setMatchResults] = useState<
    Record<string, MatchApiData | null>
  >({});

  const loadHistory = async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY_HISTORY);
      if (json) {
        const parsed = JSON.parse(json) as PronosticEntry[];
        console.log("[AsyncStorage] Historique récupéré :", parsed);
        setHistory(parsed);
      } else {
        console.log("[AsyncStorage] Aucun historique trouvé.");
      }
    } catch (e) {
      console.error("[AsyncStorage] Erreur de chargement :", e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  useEffect(() => {
    async function fetchAllStatuses() {
      const results: Record<string, MatchApiData | null> = {};
      for (const entry of history) {
        if (entry.matchId) {
          const apiResult = await fetchMatchStatusAndScore(entry.matchId);
          results[entry.matchId] = apiResult;
        }
      }
      console.log("[API] Tous les résultats API :", results);
      setMatchResults(results);
    }
    if (history.length > 0) fetchAllStatuses();
  }, [history]);

  const getPredictionLabel = (prediction: PronosticEntry["prediction"]) => {
    if (prediction === "home") return "Victoire Équipe 1";
    if (prediction === "away") return "Victoire Équipe 2";
    if (prediction === "draw") return "Match Nul";
    return "N/A";
  };

  const getResultLabel = (
    entry: PronosticEntry,
    apiData: MatchApiData | null
  ) => {
    if (!apiData) return "Résultat indisponible";
    if (apiData.status !== "FT")
      return "Résultat disponible à la fin du match.";
    let realResult: "home" | "draw" | "away";
    if (apiData.homeGoals > apiData.awayGoals) realResult = "home";
    else if (apiData.homeGoals < apiData.awayGoals) realResult = "away";
    else realResult = "draw";
    return entry.prediction === realResult ? "✅ Gagné" : "❌ Perdu";
  };

  const getBothTeamsLabel = (
    entry: PronosticEntry,
    apiData: MatchApiData | null
  ) => {
    if (!apiData) return "";
    if (apiData.status !== "FT") return "";
    if (!entry.bothTeamsPrediction) return "";
    const bothScored = apiData.homeGoals > 0 && apiData.awayGoals > 0;
    const userSaidYes = entry.bothTeamsPrediction === "yes";
    const userSaidNo = entry.bothTeamsPrediction === "no";
    const prediction = userSaidYes ? "Oui" : "Non";
    const win = (userSaidYes && bothScored) || (userSaidNo && !bothScored);
    return `Les deux équipes marquent : ${prediction} — ${
      win ? "✅ Gagné" : "❌ Perdu"
    }`;
  };

  const deleteAllPronostics = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY_HISTORY);
      Alert.alert(
        "Suppression effectuée",
        "Tous les pronostics ont été supprimés."
      );
      setHistory([]);
      console.log("[DELETE] Tous les pronostics supprimés.");
    } catch (e) {
      Alert.alert("Erreur suppression", "Impossible de supprimer l'historique");
      console.error("[DELETE] Erreur suppression :", e);
    }
  };

  const resetAllPronostics = async () => {
    try {
      // Supprimer l'historique global
      await AsyncStorage.removeItem(STORAGE_KEY_HISTORY);

      // Supprimer tous les current_pronostic_*
      const allKeys = await AsyncStorage.getAllKeys();
      const pronoKeys = allKeys.filter((k) =>
        k.startsWith("current_pronostic_")
      );
      if (pronoKeys.length > 0) {
        await AsyncStorage.multiRemove(pronoKeys);
      }

      setHistory([]);
      setMatchResults({});
      Alert.alert(
        "Réinitialisation effectuée",
        "Tous les pronostics ont été réinitialisés."
      );
      console.log(
        "[RESET] Tous les pronostics réinitialisés (y compris current_pronostic_*)"
      );
    } catch (e) {
      Alert.alert(
        "Erreur réinitialisation",
        "Impossible de réinitialiser l'historique"
      );
      console.error("[RESET] Erreur réinitialisation :", e);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Historique de tes pronostics</Text>
      <Button
        title="Nettoyer l'historique (anciens pronos)"
        onPress={cleanOldPronostics}
      />
      <Button
        title="Supprimer tous les pronostics"
        color="#f44336"
        onPress={deleteAllPronostics}
      />
      <Button
        title="Réinitialiser tous les pronostics"
        color="#e67e22"
        onPress={resetAllPronostics}
      />
      {history.length === 0 ? (
        <Text style={styles.emptyText}>
          Ton pronostic sera affiché à la fin du match.
        </Text>
      ) : (
        history
          .slice()
          .reverse()
          .map((entry, index) => {
            const apiData = matchResults[entry.matchId] || null;
            return (
              <View key={index} style={styles.card}>
                <Text style={styles.match}>{entry.match}</Text>
                <Text style={styles.detail}>
                  Ton pronostic :{" "}
                  <Text style={styles.bold}>
                    {getPredictionLabel(entry.prediction)}
                  </Text>
                </Text>
                <Text style={styles.detail}>
                  {getResultLabel(entry, apiData)}
                </Text>
                {entry.bothTeamsPrediction && (
                  <Text style={styles.detail}>
                    {getBothTeamsLabel(entry, apiData)}
                  </Text>
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
    backgroundColor: "#121212",
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginBottom: 16,
  },
  emptyText: {
    color: "#aaa",
    fontStyle: "italic",
  },
  card: {
    backgroundColor: "#1e1e1e",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  match: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  detail: {
    color: "#ccc",
    marginTop: 4,
  },
  bold: {
    color: "white",
    fontWeight: "bold",
  },
  result: {
    marginTop: 8,
    fontWeight: "bold",
    fontSize: 16,
  },
  win: {
    color: "#4caf50",
  },
  lose: {
    color: "#f44336",
  },
});

import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { translateTeamName } from "../utils/translateTeamName"; 


const STORAGE_KEY_HISTORY = "pronostics";

type PredictionValue = "home" | "draw" | "away";
type SecondPredictionValue = "yes" | "no";

interface LivePredictionProps {
  onResultCheck: () => PredictionValue;
  teamHome: string;
  teamAway: string;
  events: { type: string; team: { name: string } }[];
  matchStatus: string;
  matchId: string;
  elapsed: number | null; 
}

interface PronosticEntry {
  matchId: string;
  match: string;
  prediction: PredictionValue | null;
  actualResult: PredictionValue | null;
  result: "win" | "lose" | null;
  bothTeamsPrediction: SecondPredictionValue | null;
  bothTeamsActual: SecondPredictionValue | null;
  bothTeamsResult: "win" | "lose" | null;
  timestamp: number;
  matchStatus: string;
}

interface CurrentPronostic {
  selected: PredictionValue | null;
  secondSelected: SecondPredictionValue | null;
  confirmed: boolean;
  result: "win" | "lose" | null;
  secondResult: "win" | "lose" | null;
  matchStatus: string;
}

const options: { label: string; value: PredictionValue }[] = [
  { label: "Équipe A gagne", value: "home" },
  { label: "Match nul", value: "draw" },
  { label: "Équipe B gagne", value: "away" },
];

const secondaryOptions: { label: string; value: SecondPredictionValue }[] = [
  { label: "Oui", value: "yes" },
  { label: "Non", value: "no" },
];

export default function LivePrediction({
  onResultCheck,
  teamHome,
  teamAway,
  events,
  matchStatus,
  matchId,
  elapsed,
}: LivePredictionProps) {
  const [selected, setSelected] = useState<PredictionValue | null>(null);
  const [secondSelected, setSecondSelected] =
    useState<SecondPredictionValue | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [result, setResult] = useState<"win" | "lose" | null>(null);
  const [secondResult, setSecondResult] = useState<"win" | "lose" | null>(null);
  const [history, setHistory] = useState<PronosticEntry[]>([]);

  const matchKey = `${translateTeamName(teamHome)}_${translateTeamName(teamAway)}_${new Date().toDateString()}`;
  const STORAGE_KEY_CURRENT = `current_pronostic_${matchKey}`;

  const liveStatuses = ["1H", "2H", "LIVE", "HT", "ET", "INT"];
  const canPredict =
  matchStatus === "NS" ||
  (liveStatuses.includes(matchStatus) && elapsed !== null && elapsed <= 78);

  const bothTeamsAlreadyScored =
  events.some((e) => e.type === "Goal" && e.team.name.toLowerCase().includes(teamHome.toLowerCase()))&&
  events.some((e) => e.type === "Goal" && e.team.name.toLowerCase().includes(teamAway.toLowerCase()));

  useEffect(() => {
    async function loadAll() {
      try {
        const jsonHistory = await AsyncStorage.getItem(STORAGE_KEY_HISTORY);
        if (jsonHistory) {
          setHistory(JSON.parse(jsonHistory) as PronosticEntry[]);
        }

        const jsonCurrent = await AsyncStorage.getItem(STORAGE_KEY_CURRENT);
        if (jsonCurrent) {
          const current = JSON.parse(jsonCurrent) as CurrentPronostic;
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
    setSelected(null);
    setSecondSelected(null);
    setConfirmed(false);
    setResult(null);
    setSecondResult(null);
  }, [matchId]);

  useEffect(() => {
    if (
      confirmed &&
      matchStatus === "FT" &&
      (result === null || secondResult === null)
    ) {
      const realResult = onResultCheck();
      const res = realResult === selected ? "win" : "lose";

      const bothScored =
        events.some((e) => e.type === "Goal" && e.team.name === teamHome) &&
        events.some((e) => e.type === "Goal" && e.team.name === teamAway);

      const realSecond = bothScored ? "yes" : "no";
      const secondRes = secondSelected === realSecond ? "win" : "lose";

      setResult(res);
      setSecondResult(secondRes);

      const updatedEntry: PronosticEntry = {
        matchId,
        match: `${translateTeamName(teamHome)} vs ${translateTeamName(teamAway)}`,
        prediction: selected,
        actualResult: realResult,
        result: res,
        bothTeamsPrediction: secondSelected,
        bothTeamsActual: realSecond,
        bothTeamsResult: secondRes,
        timestamp: Date.now(),
        matchStatus,
      };

      const updatedHistory = history.map((entry) =>
        entry.match === updatedEntry.match &&
        (entry.actualResult == null || entry.matchStatus !== "FT")
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
        matchStatus,
      });
    }
  }, [
    confirmed,
    matchStatus,
    selected,
    secondSelected,
    onResultCheck,
    events,
    teamHome,
    teamAway,
    history,
    matchId,
  ]);

  useEffect(() => {
    if (confirmed) {
      saveCurrent({
        selected,
        secondSelected,
        confirmed,
        result,
        secondResult,
        matchStatus,
      });
    }
  }, [selected, secondSelected, confirmed, result, secondResult, matchStatus]);

  async function saveHistory(data: PronosticEntry[]) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(data));
    } catch (e) {
      console.error("Erreur sauvegarde pronostics", e);
    }
  }

  async function saveCurrent(data: CurrentPronostic) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(data));
    } catch (e) {
      console.error("Erreur sauvegarde pronostic actuel", e);
    }
  }

  if (!canPredict && !confirmed) {
    return (
      <View style={styles.container}>
        <Text style={styles.closedText}>
          ⏳ Les pronostics sont fermés pour ce match (après la 70ᵉ minute).
        </Text>
      </View>
    );
  }

  if (result && secondResult) {
    return (
      <View style={styles.container}>
        <Text style={styles.resultText}>
          {result === "win"
            ? "🔥 Bon résultat principal !"
            : "❌ Mauvais résultat principal."}
        </Text>
        <Text style={styles.resultText}>
          {secondResult === "win"
            ? "✅ Bonne prédiction sur les deux équipes qui marquent !"
            : "❌ Mauvaise prédiction sur les buteurs."}
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
            selected === opt.value && styles.optionSelected,
          ]}
          onPress={() => !confirmed && setSelected(opt.value)}
        >
          <Text style={styles.optionText}>
            {opt.label
                .replace("Équipe A", translateTeamName(teamHome))
                .replace("Équipe B", translateTeamName(teamAway))}
          </Text>
        </TouchableOpacity>
      ))}

      {!bothTeamsAlreadyScored && (
  <>
    <Text style={[styles.title, { marginTop: 16 }]}>
      Les deux équipes marquent ?
    </Text>
    {secondaryOptions.map((opt) => (
      <TouchableOpacity
        key={opt.value}
        style={[
          styles.option,
          secondSelected === opt.value && styles.optionSelected,
        ]}
        onPress={() => !confirmed && setSecondSelected(opt.value)}
      >
        <Text style={styles.optionText}>{opt.label}</Text>
      </TouchableOpacity>
    ))}
  </>
)}

 {!confirmed && selected && (
  <TouchableOpacity
    style={styles.confirmButton}
    onPress={async () => {
      setConfirmed(true);

      const newEntry: PronosticEntry = {
        matchId,
        match: `${translateTeamName(teamHome)} vs ${translateTeamName(teamAway)}`,
        prediction: selected,
        actualResult: null,
        result: null,
        bothTeamsPrediction: secondSelected, // peut être null
        bothTeamsActual: null,
        bothTeamsResult: null,
        timestamp: Date.now(),
        matchStatus,
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
  title: { color: "white", fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  option: {
    backgroundColor: "#615F5F",
    padding: 8,
    borderRadius: 10,
    marginVertical: 5,
  },
  optionSelected: {
    backgroundColor: "#2e7d32",
  },
  optionText: { color: "white" },
  confirmButton: {
    backgroundColor: "#0066cc",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  confirmText: { color: "white", fontWeight: "bold" },
  resultText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 6,
  },
  closedText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    fontStyle: "italic",
  },
});

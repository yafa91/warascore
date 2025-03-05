import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Animated } from "react-native";
import { useEffect, useState, useRef, useContext } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import React from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import SettingsScreen from "@/screens/SettingsScreen";
import { ThemeContext } from "@/context/ThemeContext";

const API_URL = "https://api.football-data.org/v4/matches";
const API_KEY = "26ed6598240b4a39b1522f826539b998";

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}


export  function AppContent() {
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [dates, setDates] = useState([]);
  const [matches, setMatches] = useState([]);
  const [expandedMatch, setExpandedMatch] = useState(null);
  const [notifications, setNotifications] = useState({});
  const scrollX = useRef(new Animated.Value(0)).current;

  // 
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  console.log(isDark);

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const generateWeekDates = () => {
    const daysOfWeek = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const today = new Date();
    const newDates = [];

    for (let i = 0; i < 7; i++) {
      const nextDate = new Date();
      nextDate.setDate(today.getDate() + i);
      const day = nextDate.getDate().toString().padStart(2, '0');
      const month = (nextDate.getMonth() + 1).toString().padStart(2, '0');
      const dayLabel = daysOfWeek[nextDate.getDay()];
      const formattedDate = nextDate.toISOString().split("T")[0];
      newDates.push({ label: `${dayLabel} ${day}-${month}`, value: formattedDate });
    }
    return newDates;
  };

  useEffect(() => {
    setDates(generateWeekDates());
    setSelectedDate(getCurrentDate());
  }, []);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch(`${API_URL}?dateFrom=${selectedDate}&dateTo=${selectedDate}`, {
          headers: { "X-Auth-Token": API_KEY },
        });
        const data = await response.json();
        
        const filteredMatches = (data.matches || []).filter(match => {
          const matchTime = new Date(match.utcDate).getHours();
          return matchTime >= 15;
        });

        setMatches(filteredMatches);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des matchs :", error);
        setLoading(false);
      }
    };

    fetchMatches();
    const interval = setInterval(fetchMatches, 60000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  const toggleNotification = (index) => {
    setNotifications((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return loading ? (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 36 }}>WARASCORE</Text>
    </View>
  ) : (
    <ThemeProvider>
    <SafeAreaView style={{ flex: 1, backgroundColor: "#121212" }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: "row", paddingVertical: 10, paddingHorizontal: 3, height: 100 }}>
        {dates.map((date, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setSelectedDate(date.value)}
            style={{ flexDirection: "column", paddingVertical: 30, paddingHorizontal: 15, borderRadius: 20, backgroundColor: selectedDate === date.value ? "#333" : "#121212", marginRight: 10 }}>
            <Text style={{ color: selectedDate === date.value ? "#FFF" : "#BBB", fontWeight: "bold" }}>{date.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Afficher "Vivez Maintenant" uniquement si des matchs sont en cours */}
      <Text style={{ textAlign: "left", color: "#FFF", fontSize: 24, fontWeight: "bold", marginVertical: 20, marginLeft: 8, marginBottom: 500 }}>
        {matches.length > 0 && matches.some(match => new Date(match.utcDate) <= new Date()) ? "Vivez Maintenant" : ""}
      </Text>

      <Animated.ScrollView 
        horizontal 
        pagingEnabled 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={{ paddingVertical: 20 }}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
      >
        {matches.map((match, index) => (
          <View key={index} style={styles.card}>
            <TouchableOpacity onPress={() => toggleNotification(index)} style={styles.notificationIcon}>
              <Ionicons 
                name={notifications[index] ? "notifications" : "notifications-outline"} 
                size={24} 
                color={notifications[index] ? "#FFD700" : "#FFF"} 
              />
            </TouchableOpacity>

            <Text style={styles.league}>{match.competition.name}</Text>
            <View style={styles.matchInfo}>
              <Image source={{ uri: match.homeTeam.crest }} style={styles.logoTop} />
              <Image source={{ uri: match.awayTeam.crest }} style={styles.logoTop} />
            </View>
            <View style={styles.matchInfo}>
              <Text style={styles.team}>{match.homeTeam.name}</Text>
              <Text style={styles.score}>{match.score.fullTime.home ?? "-"} - {match.score.fullTime.away ?? "-"}</Text>
              <Text style={styles.team}>{match.awayTeam.name}</Text>
            </View>
          </View>
        ))}
      </Animated.ScrollView>
    </SafeAreaView></ThemeProvider>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1E1E1E",
    borderRadius: 30,
    padding: 30,
    marginHorizontal: 10,
    width: 300,
    alignItems: "center",
  },
  notificationIcon: {
    position: "absolute",
    top: 15,
    right: 15,
  },
  league: {
    color: "#ffffff",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },
  matchInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  logoTop: {
    width: 50,
    height: 40,
    marginHorizontal: 20,
  },
  team: {
    color: "#ffffff",
    fontSize: 16,
    textAlign: "center",
  },
  score: {
    color: "#ff4757",
    fontSize: 18,
    fontWeight: "bold",
  },
});

/**
import React from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import SettingsScreen from "@/screens/SettingsScreen";

export default function _App() {
  return (
    <ThemeProvider>
      <SettingsScreen />
    </ThemeProvider>
  );
}
*/

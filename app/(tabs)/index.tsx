
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Animated, Button, FlatList} from "react-native";
import { useEffect, useState, useRef, useContext } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import React from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import SettingsScreen from "@/screens/SettingsScreen";
import { ThemeContext } from "@/context/ThemeContext";
import { Item } from "react-native-paper/lib/typescript/components/Drawer/Drawer";
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
        //console.log(data);
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

  const liveSoreList = [1,2,3,4];
  const liveScoreList2 = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
  const days = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];

  return loading ? (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 36 }}>WARASCORE</Text>
    </View>
  ) : (
    <ThemeProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#121212" }}>
        
        <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 0, backgroundColor: "#111" }}>
          <View>
            <Text style={[,{color:"white", fontSize:32, marginLeft:25, fontWeight:"900"}]}>waraScore</Text>
          </View>
          <View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginRight: 20 }}>
              
              <TouchableOpacity style={{marginRight:10}}>
                <Ionicons name="search" size={24} color="#FFF"  />
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons name="notifications" size={24} color="#FFF"  />
              </TouchableOpacity>
            </View>  
          </View>
        </View>
        

        

        {/*
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
           */}
        

        <ScrollView style={{ flex: 1, padding: 10 , backgroundColor: "121212", minHeight: 1000}}> 

        <FlatList data={days} horizontal  renderItem={renderDateItem}></FlatList> 
        
        {/* Afficher "Vivez Maintenant" uniquement si des matchs sont en cours */}
        <Text style=  {[styles.title2, {}]}>
          {matches.length > 0 && matches.some(match => new Date(match.utcDate) <= new Date()) ? "Vivez Maintenant" : ""} Live Now
        </Text> 




        {/************************* Live Score *********************** */}

        <FlatList data={liveSoreList} horizontal  renderItem={LiveScore}></FlatList>
        
      
        {/************************************************ */}
        <View>

          <View style={{flexDirection: "row", justifyContent: "space-between", marginLeft: 0, marginRight: 20, marginBottom: 10}}>
            
            <TouchableOpacity>
               <Text style={[styles.title2, { borderBottomWidth:4, padding:1}]}>Favorites</Text>
            </TouchableOpacity>
            
          </View>
          
        </View>   
        {/****************Upcoming******************************* */}

        <FlatList data={liveScoreList2}  renderItem={ScoreList}></FlatList>

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

        </ScrollView>  
      </SafeAreaView>
    </ThemeProvider>
  );
}



const LiveScore =  ({item}) => {
  return (
    <View style={[styles.card, { backgroundColor: "#222" }]}>
          <View style={[styles.cardHeader, { }]}>
            <View>
              <Text style={[styles.cardHeaderTitle,{ color : "white"}]}><Image source={{ uri: "https://crests.football-data.org/65.png" }} style={{width:15, height:15}} />  Premier League</Text>
            </View> 
            <View style={[styles.cardStarBlock,{ }]}>
              <Ionicons name="notifications" size={17} color="#fff" />
            </View>
          </View >
          
          <View style={[styles.liveScoreBlock,{}]}>
            <View style={[styles.liveScoreBlockTeam,{}]}>
              <Image source={{ uri: "https://crests.football-data.org/65.png" }} style={styles.logoTop} />
              <Text numberOfLines={1} style={[styles.scoreLiveTeamName,{color:"#fff"}]}>Manchester City</Text>
            </View>
            <View>
              <Text style={[styles.liveSCoreScore,{color: "#fff"}]}>3 - 1</Text>
            </View>
            <View style={[styles.liveScoreBlockTeam,[]]}>
              <Image source={{ uri: "https://crests.football-data.org/64.png" }} style={styles.logoTop} />
              <Text numberOfLines={1} style={[styles.scoreLiveTeamName,{color:"#fff"}]}>Chelsea</Text>
            </View>
          </View>

          <View style={[styles.liveScoreButton, { }]}>
            <Button
            color={"#fff"}
              title="Details"
            />
          </View>
            
    </View>
  );

}

const ScoreList = ({item}) => {
  return (
    <View>

          <View style={[styles.card2, { backgroundColor: "#222", marginTop: 10 }]}>

            <View style={[styles.liveScoreBlock,{}]}>
              <View style={{width: "10%"}}>
                <Text style={[,{color: "#0f0", fontSize:17, fontWeight:"bold"}]}>"78</Text>
              </View>
              <View style={{width: "70%"}}>
                <View style={{flexDirection: "row", alignItems: "center"}}>
                  <Image source={{ uri: "https://crests.football-data.org/65.png" }} style={{width:30, height:30}} />  <Text numberOfLines={1} style={[,{ color : "white", marginLeft:5, fontSize:14, fontWeight:"bold" }]}>Mandchester united</Text>
                </View>
                <View style={{flexDirection: "row", alignItems: "center", marginTop: 10}}>
                  <Image source={{ uri: "https://crests.football-data.org/64.png" }} style={{width:30, height:30}} />  <Text numberOfLines={1} style={[,{ color : "white", marginLeft:5, fontSize:14, fontWeight:"bold"}]}>Chelsea</Text>
                </View>
              </View>  
              <View style={{width: "10%"}}>
                <Text style={[,{color: "#fff"}]}>1</Text>
                <Text style={[,{color: "#fff", marginTop:20}]}>0</Text>
              </View>
            </View>
          </View>

        </View> 
  )
}


const renderDateItem = (item) => {
  return (
    <TouchableOpacity style={{width:100, backgroundColor:"#333", borderRadius:10, padding:10, marginTop:10, marginLeft:5}}>
      <Text style={{color:"white", fontSize:13, fontWeight:"600", textAlign:"center"}}>Lun</Text>
      <Text style={{color:"white", fontSize:13, fontWeight:"600", textAlign:"center"}}>02-mars</Text>
    </TouchableOpacity> 
  )
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    padding: 5,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginHorizontal: 10,
    width: 300,
    maxHeight: 200,
    
  },
  card2: {
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    padding: 5,
    paddingHorizontal: 10,
    paddingVertical: 0,
    marginHorizontal: 10,
    width: "95%",
    
  },
  cardHeader:{
    flexDirection: "row",
    justifyContent: "space-between",
    margin:0,
  },

  cardStarBlock:{
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },

  scoreLiveTeamName:{
    color: "#FFF",
    fontSize: 14,
    textAlign: "center",
    marginTop: 5,
  },

  liveScoreBlock:{
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    margin: 10,
  },

  liveSCoreScore:{
    fontSize: 24,
    fontWeight: "bold",
  },
  liveScoreBlockTeam:{
    width: "40%",
    //backgroundColor: "#333",
  },
  cardTextStar:{
    fontSize: 15,
    fontWeight: "bold",
    marginLeft: 5,
  },
  cardHeaderTitle:{
    fontSize: 17,
    fontWeight: "bold",
  },
  title2:{
    textAlign: "left",
    color: "#FFF", 
    fontSize: 24, 
    fontWeight: "bold",
    marginVertical: 20,
    marginLeft: 20,
    marginBottom: 12,
    
  },
  title3:{
    textAlign: "left",
    color: "#FFF", 
    fontSize: 17, 
    fontWeight: "bold",
    marginVertical: 20,
    marginLeft: 20,
    marginBottom: 12,
    
  },

  liveScoreButton:{
    margin: 0,
    backgroundColor: "#f33",
    borderRadius: 10,
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
    width: 40,
    height: 40,
    alignSelf: "center",
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

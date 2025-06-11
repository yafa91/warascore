import React from "react";
import { View, Text, StyleSheet, ImageBackground } from "react-native";

interface Player {
  id: number;
  name: string;
  number: number;
  pos: string; 
  x: number;
  y: number; 
}

interface TeamCompositionFieldProps {
  homeTeam: Player[];
  awayTeam: Player[];
}

const TeamCompositionField: React.FC<TeamCompositionFieldProps> = ({
  homeTeam = [],
  awayTeam = [],
}) => {
  
  const filterByPos = (team: Player[], pos: string) =>
    team.filter((p) => p.pos === pos); 

  const renderLine = (players: Player[]) => (
    <View style={styles.line}>
      {players.map((p) => (
        <View key={p.id} style={styles.playerContainer}>
          <Text style={styles.playerNumber}>{p.number}</Text>
          <Text style={styles.playerName}>{p.name}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <ImageBackground
      source={require("../assets/images/field.png")}
      style={styles.field}
      resizeMode="cover"
    >
      <View style={styles.halfField}>
        {/* Équipe Home : F - M - D - G */}
        {renderLine(filterByPos(homeTeam, "F"))}
        {renderLine(filterByPos(homeTeam, "M"))}
        {renderLine(filterByPos(homeTeam, "D"))}
        {renderLine(filterByPos(homeTeam, "G"))}
      </View>

      <View style={styles.halfField}>
        {/* Équipe Away : G - D - M - F */}
        {renderLine(filterByPos(awayTeam, "G"))}
        {renderLine(filterByPos(awayTeam, "D"))}
        {renderLine(filterByPos(awayTeam, "M"))}
        {renderLine(filterByPos(awayTeam, "F"))}
      </View>
    </ImageBackground>
  );
};

export default TeamCompositionField;

const styles = StyleSheet.create({
  field: {
    width: "100%",
    height: 500,
    borderRadius: 10,
    position: "relative",
    overflow: "hidden",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  halfField: {
    flex: 1,
    justifyContent: "space-around",
  },
  line: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  playerContainer: {
    alignItems: "center",
  },
  playerNumber: {
    color: "#fff",
    fontWeight: "bold",
  },
  playerName: {
    color: "#fff",
    fontSize: 12,
    textAlign: "center",
  },
});

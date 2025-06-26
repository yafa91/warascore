import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
} from "react-native";

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

const getShortName = (fullName: string): string => {
  const parts = fullName.trim().split(" ");
  if (parts.length === 1) return parts[0];
  return parts[parts.length - 1].slice(0, 10);
};


const TeamCompositionField: React.FC<TeamCompositionFieldProps> = ({
  homeTeam = [],
  awayTeam = [],
}) => {
  const renderPlayer = (player: Player, isHome: boolean) => {
    if (!player.y || !player.x) {
      return null;
    }

    const team = isHome ? homeTeam : awayTeam;
    const playersInRow = team.filter((p) => p.y === player.y);
    const numPlayersInRow = playersInRow.length;

    const rowSpacing = 9; 
    const top = isHome ? `${0 + player.y * rowSpacing}%` : `${98 - player.y * rowSpacing}%`;


    const widthFactor = 116;
    const offset = (100 - widthFactor) / 2;

    const position = offset + (widthFactor / (numPlayersInRow + 1)) * player.x;

    const left = isHome ? `${position}%` : `${100 - position}%`;

    return (
      <View
        key={player.id}
        style={[
          styles.playerContainer,
          {
            position: "absolute",
            top: top as any,
            left: left as any,
            transform: [{ translateX: -30 }, { translateY: 0 }],

          },
        ]}
      >
    
       <Text style={styles.playerName} numberOfLines={2}>
        {player.number} {getShortName(player.name)}
       </Text>
      </View>
    );
  };

  return (
    <ImageBackground
      source={require("../assets/images/field.png")}
      style={styles.field}
      resizeMode="cover"
    >
      {homeTeam.map((p) => renderPlayer(p, true))}
      {awayTeam.map((p) => renderPlayer(p, false))}
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
  },
  playerContainer: {
    alignItems: "center",
    width: 60,
    paddingHorizontal: 0,
  },
  playerNumber: {
    color: "red",
    fontWeight: "bold",
    //backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 10,
    width: 24,
    textAlign: "center",
    overflow: "hidden",
    fontSize: 10,
  },
  playerName: {
    color: "#000",
    fontSize: 8,
    textAlign: "center",
    fontWeight: "bold",
    flexWrap: "wrap",
    //backgroundColor: "rgba(0,0,0,0.6)",
  },
});

import React, { useCallback, useRef, useState } from "react";
import FastImage from "react-native-fast-image";
import { Image as ExpoImage } from 'expo-image';

import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";

interface Player {
  id: number;
  name: string;
  number: number;
  pos: string;
  x: number;
  y: number;
  photo?: string;
  stats?: any;
}

interface TeamCompositionFieldProps {
  homeTeam: Player[];
  awayTeam: Player[];
}

const getShortName = (fullName: string): string => {
  const parts = fullName.trim().split(" ");
  if (parts.length === 1) return parts[0];
  const initials = parts[0].charAt(0).toUpperCase();
  const lastName = parts[parts.length - 1];
  return `${initials}. ${lastName.slice(0, 19)}`;
};

const TeamCompositionField: React.FC<TeamCompositionFieldProps> = ({
  homeTeam = [],
  awayTeam = [],
}) => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const preloadPlayerImages = (homeTeam: Player[], awayTeam: Player[]) => {
  const allPlayers = homeTeam.concat(awayTeam);
  allPlayers.forEach(player => {
    if (player.photo) {
      ExpoImage.prefetch(player.photo);  
      Image.prefetch(player.photo);      
    }
  });
};

React.useEffect(() => {
  if (homeTeam.length || awayTeam.length) {
    preloadPlayerImages(homeTeam, awayTeam);
  }
}, [homeTeam, awayTeam]);

  const getFullPosition = (pos: string) => {
    switch (pos) {
      case "G":
        return "Gardien";
      case "D":
        return "Défenseur";
      case "M":
        return "Milieu";
      case "F":
        return "Attaquant";
      default:
        return pos;
    }
  };

  const renderPlayer = (
    player: Player,
    isHome: boolean,
    presentModal: (player: Player) => void
  ) => {
    if (!player.y || !player.x) return null;

    const team = isHome ? homeTeam : awayTeam;
    const playersInRow = team.filter((p) => p.y === player.y);
    const numPlayersInRow = playersInRow.length;

    const rowSpacing = isHome ? 9 : 9;
    const top = isHome
      ? `${-4 + player.y * rowSpacing}%`
      : `${93 - player.y * rowSpacing}%`;

    const widthFactor = 110;
    const offset = (100 - widthFactor) / 2;
    const position = offset + (widthFactor / (numPlayersInRow + 1)) * player.x;
    const left = isHome ? `${position}%` : `${100 - position}%`;

    return (
      <TouchableOpacity
        key={player.id}
        style={[
          styles.playerContainer,
          {
            position: "absolute",
            top: top as any,
            left: left as any,
            transform: [{ translateX: -30 }],
          },
        ]}
        onPress={() => {
          presentModal(player);
        }}
      >
{player.photo ? (
  <ExpoImage
    style={styles.playerPhoto}
    source={player.photo}
    contentFit="cover"
    placeholder={require('../assets/images/avatar-image.png')}
  />
) : (
  <Image
    source={require("../assets/images/avatar-image.png")}
    style={styles.playerPhoto}
    resizeMode="cover"
  />
)}
        <Text style={styles.playerName} numberOfLines={1} ellipsizeMode="tail">
          {player.number} {getShortName(player.name)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderField = (presentModal: (player: Player) => void) => (
    <ImageBackground
      source={require("../assets/images/field2.png")}
      style={styles.field}
      resizeMode="cover"
    >
      {homeTeam.map((p) => renderPlayer(p, true, presentModal))}
      {awayTeam.map((p) => renderPlayer(p, false, presentModal))}
    </ImageBackground>
  );
   
  homeTeam.concat(awayTeam).forEach(player => {
  if (player.photo) Image.prefetch(player.photo);
});

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);
  const handleHideModalPress = useCallback(() => {
    bottomSheetModalRef.current?.close();
  }, []);

  const handlePlayerPress = (player: Player) => {
    setSelectedPlayer(player);
    handlePresentModalPress();
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={handleHideModalPress}>
        <View style={{ flex: 1 }}>{renderField(handlePlayerPress)}</View>
      </TouchableWithoutFeedback>
      <BottomSheetModalProvider>
        <BottomSheetModal
          ref={bottomSheetModalRef}
          snapPoints={[280]}
          backgroundStyle={{
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            backgroundColor: "#121212",
          }}
          handleIndicatorStyle={{
            backgroundColor: "white",
            height: 4,
            width: 80,
            borderRadius: 3,
          }}
        >
          <BottomSheetView style={styles.contentContainer}>
            {selectedPlayer && (
              <View style={styles.statsContainer}>
                {/* Photo + Nom */}
                <View style={styles.playerHeader}>
                  <Image
                    source={{ uri: selectedPlayer.photo }}
                    style={styles.playerPhotoLarge}
                  />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.playerNameLarge}>
                      {selectedPlayer.name}
                    </Text>
                    <Text style={styles.playerInfo}>
                      #{selectedPlayer.number} •{" "}
                      {getFullPosition(selectedPlayer.pos)}
                    </Text>
                    <Text style={styles.playerInfo}>
                      Minutes : {selectedPlayer.stats?.games?.minutes ?? 0} |{" "}
                      Note :{" "}
                      <Text
                        style={{
                          color:
                            selectedPlayer.stats?.games?.rating >= 7
                              ? "green"
                              : selectedPlayer.stats?.games?.rating >= 6
                              ? "red"
                              : "white",
                        }}
                      >
                        {selectedPlayer.stats?.games?.rating ?? "-"}
                      </Text>
                    </Text>
                  </View>
                </View>
                {/* Stats */}
                {selectedPlayer.pos === "G" ? (
                  <View style={styles.statsGrid}>
                    <Text style={styles.statItem}>
                      🧤 Arrêts : {selectedPlayer.stats?.goals?.saves ?? 0}
                    </Text>
                    <Text style={styles.statItem}>
                      🔄 Passes réussies :{" "}
                      {selectedPlayer.stats?.passes?.accuracy ?? "0%"}
                    </Text>
                    <Text style={styles.statItem}>
                      ❌ Buts encaissés :{" "}
                      {selectedPlayer.stats?.goals?.conceded ?? 0}
                    </Text>
                    <Text style={styles.statItem}>
                      Carton : 🟨 : {selectedPlayer.stats?.cards?.yellow ?? 0} |
                      🟥 : {selectedPlayer.stats?.cards?.red ?? 0}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.statsGrid}>
                    <Text style={styles.statItem}>
                      🎯 Tirs : {selectedPlayer.stats?.shots?.total ?? 0}
                    </Text>
                    <Text style={styles.statItem}>
                      ⚽ Buts : {selectedPlayer.stats?.goals?.total ?? 0}
                    </Text>
                    <Text style={styles.statItem}>
                      📊 Passes : {selectedPlayer.stats?.passes?.total ?? 0} (
                      {selectedPlayer.stats?.passes?.accuracy ?? "0%"})
                    </Text>
                    <Text style={styles.statItem}>
                      🎁 Passes clés : {selectedPlayer.stats?.passes?.key ?? 0}
                    </Text>
                    <Text style={styles.statItem}>
                      ⚔️ Duels gagnés : {selectedPlayer.stats?.duels?.won ?? 0}
                    </Text>
                    <Text style={styles.statItem}>
                      Jaunes 🟨 : {selectedPlayer.stats?.cards?.yellow ?? 0} |
                      Rouges 🟥 : {selectedPlayer.stats?.cards?.red ?? 0}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </BottomSheetView>
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
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
  },
  playerPhoto: {
    width: 25,
    height: 33,
    borderRadius: 19,
    marginBottom: 2,
    backgroundColor: "#eee",
  },
  playerName: {
    color: "#fff",
    fontSize: 9,
    textAlign: "center",
    fontWeight: "600",
    width: 90,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#0c0c0c",
    padding: 10,
    justifyContent: "center",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    minHeight: 200,
    padding: 16,
  },
  statsContainer: {
    flex: 1,
  },
  playerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  playerPhotoLarge: {
    width: 58,
    height: 58,
    borderRadius: 35,
  },
  playerNameLarge: {
    fontSize: 17,
    fontWeight: "bold",
    color: "white",
  },
  playerInfo: {
    fontSize: 15,
    color: "gray",
  },
  statsGrid: {
    marginTop: 12,
  },
  statItem: {
    fontSize: 16,
    marginBottom: 8,
    color: "white",
  },
});

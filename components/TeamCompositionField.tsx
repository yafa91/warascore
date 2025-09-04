import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Modal,
  TouchableWithoutFeedback,
  PanResponder,
  Animated,
} from "react-native";


interface Player {
  id: number;
  name: string;
  number: number;
  pos: string;
  x: number;
  y: number;
  photo?: string;
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
  const [modalVisible, setModalVisible] = useState(false);

  const modalTranslateY = useRef(new Animated.Value(0)).current;

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    modalTranslateY.setValue(0);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          modalTranslateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 100) {
          closeModal();
        } else {
          Animated.spring(modalTranslateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const renderPlayer = (player: Player, isHome: boolean) => {
    if (!player.y || !player.x) return null;

  console.log("Home Team players:", homeTeam);
  console.log("Away Team players:", awayTeam);


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
      <View
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
      >
        {player.photo ? (
          <Image
            source={{ uri: player.photo }}
            style={styles.playerPhoto}
            resizeMode="cover"
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
      </View>
    );
  };

  const renderField = () => (
    <ImageBackground
      source={require("../assets/images/field2.png")}
      style={styles.field}
      resizeMode="cover"
    >
      {homeTeam.map((p) => renderPlayer(p, true))}
      {awayTeam.map((p) => renderPlayer(p, false))}
    </ImageBackground>
  );

  return (
    <>
      <TouchableWithoutFeedback onPress={openModal}>
        <View>{renderField()}</View>
      </TouchableWithoutFeedback>

      <Modal visible={modalVisible} animationType="slide" transparent={false}>
        <Animated.View
          style={[styles.modalContainer, { transform: [{ translateY: modalTranslateY }] }]}
          {...panResponder.panHandlers}
        >
          {renderField()}
        </Animated.View>
      </Modal>
    </>
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
});

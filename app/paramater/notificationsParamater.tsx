import React, { useLayoutEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as IntentLauncher from 'expo-intent-launcher';

const NotificationsParamater = () => {
  const navigation = useNavigation();

  const openNotificationSettings = () => {
    if (Platform.OS === 'android') {
      IntentLauncher.startActivityAsync(
        IntentLauncher.ActivityAction.NOTIFICATION_SETTINGS
      );
    } else if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:')
        .catch(() => Alert.alert('Erreur', 'Impossible d’ouvrir les réglages.'));
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Paramètres de notifications",
      headerTitleAlign: "center",
      headerStyle: {
        backgroundColor: "#121212",
      },
      headerTitleStyle: {
        color: "white",
        fontWeight: "bold",
        fontSize: 18,
      },
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 10 }}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      ),
      headerShown: true,
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Paramètres généraux</Text>

      <TouchableOpacity
        style={styles.settingRow}
        onPress={() => navigation.push("MatchNotificationSettings")}
      >
        <Text style={styles.title}>Notifications de match</Text>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.settingRow}
        onPress={openNotificationSettings}
      >
        <Text style={styles.title}>Son de la notification</Text>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
    </View>
  );
};

export default NotificationsParamater;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  header: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  title: {
    color: 'white',
    fontSize: 16,
  },
  arrow: {
    color: 'white',
    fontSize: 24,
    paddingHorizontal: 10,
  },
});

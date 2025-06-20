import React, { useLayoutEffect, useState, useEffect } from 'react';
import { registerForPushNotificationsAsync } from '../../utils/Notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  Linking,
  Alert,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as IntentLauncher from 'expo-intent-launcher';

const NotificationsParamater = () => {
  const navigation = useNavigation();

  const [newsNotification, setNewsNotification] = useState(false);
  const [matchNotification, setMatchNotification] = useState(false);

  const handleToggleNewsNotification = async (value) => {
  setNewsNotification(value);
  if (value) {
    const token = await registerForPushNotificationsAsync();
    console.log("Token pour 'Restez dans le match':", token);
  }
};

const handleToggleMatchNotification = async (value) => {
  setMatchNotification(value);
  await AsyncStorage.setItem('matchNotification', JSON.stringify(value));

  if (value) {
    const token = await registerForPushNotificationsAsync();
    console.log("Token pour 'Notifications de match':", token);
  }
};

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
 
  useEffect(() => {
  const loadNotificationSettings = async () => {
    const matchNotif = await AsyncStorage.getItem('matchNotification');
    if (matchNotif !== null) {
      setMatchNotification(JSON.parse(matchNotif));
    }
  };
  loadNotificationSettings();
}, []);

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
    {/* Bloc switch : Articles à la Une */}
    <View style={styles.notificationRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Restez dans le match</Text>
        <Text style={styles.subtitle}>Les news sportives qui comptent, directement sur votre écran.</Text>
      </View>
         <Switch
  value={newsNotification}
  onValueChange={handleToggleNewsNotification}
  trackColor={{ false: '#444', true: '#1DA1F2' }}
  thumbColor={newsNotification ? '#fff' : '#fff'}
/>
    </View>

    {/* Bloc switch : Notifications de match */}
    <View style={styles.notificationRow}>
      <Text style={styles.title}>Notifications de match</Text>
       <Switch
  value={matchNotification}
  onValueChange={handleToggleMatchNotification}
  trackColor={{ false: '#444', true: '#1DA1F2' }}
  thumbColor={matchNotification ? '#fff' : '#fff'}
/>
    </View>

    {/* Lien vers sons de notification */}
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
  notificationRow: {
    backgroundColor: '#121212',
    paddingVertical: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#222',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: 'white',
    fontSize: 16,
  },
  subtitle: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 5,
  },
  arrow: {
    color: 'white',
    fontSize: 24,
    paddingHorizontal: 10,
  },
});

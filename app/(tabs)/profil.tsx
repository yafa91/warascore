import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Octicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>

      {/* Notifications Push */}
<Text style={styles.sectionTitle}>Notifications Push</Text>
<TouchableOpacity onPress={() => router.push('/paramater/notificationsParamater')} style={styles.row}>
  <Ionicons name="notifications-outline" size={22} color="white" />
  <Text style={styles.label}>Paramètres de notifications</Text>
  <Ionicons name="chevron-forward" size={20} color="gray" />
</TouchableOpacity>

{/* Utilisateur */}
<Text style={styles.sectionTitle}>Utilisateur</Text>
<View style={styles.row}>
  <Ionicons name="person-outline" size={22} color="white" />
  <Text style={styles.label}>Non connecté</Text>
  <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login')}>
    <Text style={styles.loginButtonText}>CONNEXION</Text>
  </TouchableOpacity>
</View>

{/* Passer à WaraScore+ */}
<Text style={styles.sectionTitle}>Passer à WaraScore+</Text>
<TouchableOpacity onPress={() => router.push('/paramater/WaraScorePlus')} style={styles.row}>
  <MaterialIcons name="block" size={22} color="white" />
  <Text style={styles.label}>Supprimer les bannières publicitaires</Text>
  <Ionicons name="chevron-forward" size={20} color="gray" />
</TouchableOpacity>

{/* Pronos */}
<Text style={styles.sectionTitle}>Lien rapide</Text>
<TouchableOpacity onPress={() => router.push('/paramater/programmeTV')} style={styles.row}>
  <MaterialCommunityIcons name="television-classic" size={22} color="white" />
  <Text style={styles.label}>Programme TV</Text>
  <Ionicons name="chevron-forward" size={20} color="gray" />
</TouchableOpacity>

{/* Lien rapide */}
<Text style={styles.sectionTitle}>Support</Text>
<TouchableOpacity onPress={() => router.push('/paramater/avis')} style={styles.row}>
  <MaterialCommunityIcons name="tooltip-text" size={22} color="white" />
  <Text style={styles.label}>Votre avis nous interesse</Text>
  <Ionicons name="chevron-forward" size={20} color="gray" />
</TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 30,
  },
  sectionTitle: {
    color: 'gray',
    fontSize: 14,
    marginBottom: 10,
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 5,
  },
  label: {
    color: 'white',
    marginLeft: 12,
    flex: 1,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#334155',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});

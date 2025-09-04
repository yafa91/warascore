import React, { useLayoutEffect } from 'react';
import {
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import { Ionicons, Entypo, AntDesign } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';


const MentionsLegales = () => {
  const navigation = useNavigation();
  const router = useRouter();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Mentions légales",
      headerTitleAlign: "center",
      headerStyle: { backgroundColor: "#121212" },
      headerTitleStyle: { color: "white", fontWeight: "bold", fontSize: 18 },
      headerLeft: () => (
        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      ),
      headerShown: true,
    });
  }, [navigation]);

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: 0, paddingBottom: 48 }}>
      <Text style={styles.title}></Text>

      <Text style={styles.sectionTitle}>Éditeur de l'application</Text>
      <Text style={styles.text}>
        WaraScore est une application édité par WARADEV, SAS au capital de 200euro dont le siege est situé au 37 rue de la dauphine 91100 Corbeil-Essonnes.
      </Text>
      <Text style={styles.text}>
        Contact : contact@warascore.com
      </Text>

      <Text style={styles.sectionTitle}>Hébergement</Text>
      <Text style={styles.text}>
        L’application est hébergée par Expo & Firebase (Google LLC).
      </Text>

      <Text style={styles.sectionTitle}>Propriété intellectuelle</Text>
      <Text style={styles.text}>
        Tous les éléments de l'application (logos, design, contenu, etc.) sont la propriété de WARADEV et ne peuvent être utilisés sans autorisation.
      </Text>

      <Text style={styles.sectionTitle}>Collecte des données</Text>
      <Text style={styles.text}>
        WaraScore utilise des services tiers comme Firebase Analytics afin de collecter des données anonymes à des fins statistiques uniquement.
        Aucune donnée personnelle sensible n'est collectée sans votre consentement explicite.
      </Text>

      <Text style={styles.sectionTitle}>Cookies & technologies similaires</Text>
      <Text style={styles.text}>
        Certaines informations peuvent être automatiquement collectées via Firebase pour améliorer les performances de l’application.
      </Text>

      <Text style={styles.sectionTitle}>Responsabilité</Text>
      <Text style={styles.text}>
        Les informations fournies dans l'application sont données à titre indicatif. WARADEV ne peut être tenu responsable en cas d'erreur ou de mauvaise interprétation.
      </Text>

      <Text style={styles.sectionTitle}>Droits d’accès et de suppression</Text>
      <Text style={styles.text}>
        Conformément au RGPD, vous pouvez demander l’accès, la modification ou la suppression de vos données en nous contactant à l’adresse email : contact@warascore.com
      </Text>

      {/* Réseaux sociaux */}
      <View style={styles.socialContainer}>
        <Text style={styles.socialTitle}>Suis-nous sur nos réseaux sociaux</Text>
        <View style={styles.iconsRow}>
          <TouchableOpacity onPress={() => openLink('https://twitter.com')}>
            <View style={styles.iconBox}>
              <Entypo name="twitter" size={24} color="#ccc" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openLink('https://instagram.com')}>
            <View style={styles.iconBox}>
              <AntDesign name="instagram" size={24} color="#ccc" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openLink('https://tiktok.com')}>
            <View style={styles.iconBox}>
            <FontAwesome5 name="tiktok" size={24} color="#ccc" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0c0c',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 6,
    color: '#fff',
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: '#ccc',
  },
  socialContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  socialTitle: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 12,
    fontWeight: '500',
  },
  iconsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  iconBox: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MentionsLegales;

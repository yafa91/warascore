import React, { useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';

export default function WaraScorePlus() {
  const router = useRouter();
  const navigation = useNavigation();
  const [selectedPlan, setSelectedPlan] = useState('annuel'); // 'mensuel' ou 'annuel'

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "WaraScore+",
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
        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      ),
      headerShown: true
    });
  }, [navigation]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.subHeader}>Passer à WaraSore+</Text>

      <View style={styles.bulletRow}>
        <Text style={styles.bullet}>✓</Text>
        <Text style={styles.bulletText}>La compo de chaques équipes 45 minutes avant le coup d'envoi</Text>
      </View>
      <View style={styles.bulletRow}>
        <Text style={styles.bullet}>✓</Text>
        <Text style={styles.bulletText}>Parie gratuitement avec tes amis</Text>
      </View>
      <View style={styles.bulletRow}>
        <Text style={styles.bullet}>✓</Text>
        <Text style={styles.bulletText}>Temps de chargement plus rapide</Text>
      </View>

      <Text style={styles.choose}>
        Choisissez un abonnement <Text style={styles.special}>OFFRE SPÉCIALE</Text>
      </Text>

      <View style={styles.plans}>
        <TouchableOpacity
          style={[styles.planBox, selectedPlan === 'mensuel' && styles.planBoxSelected]}
          onPress={() => setSelectedPlan('mensuel')}
        >
          <Text style={styles.planTitle}>PASS MENSUEL</Text>
          <Text style={styles.price}>2,99 €</Text>
          <Text style={styles.period}>Par mois</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.planBox, selectedPlan === 'annuel' && styles.planBoxSelected]}
          onPress={() => setSelectedPlan('annuel')}
        >
          {selectedPlan === 'annuel' && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-29 %</Text>
            </View>
          )}
          <Text style={styles.planTitle}>PASS ANNUEL</Text>
          <Text style={styles.oldPrice}>44,60 €</Text>
          <Text style={styles.price}>30,99 €</Text>
          <Text style={styles.period}>Par an</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.ctaButton}
        onPress={() => {
          if (selectedPlan === 'mensuel') {
            console.log("Abonnement mensuel sélectionné");
            // Ajouter logique d'achat mensuel ici
          } else {
            console.log("Abonnement annuel sélectionné");
            // Ajouter logique d'achat annuel ici
          }
        }}
      >
        <Text style={styles.ctaText}>S'abonner</Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <Text style={styles.restore}></Text>
      </TouchableOpacity>

      <Text style={styles.note}></Text>

      <TouchableOpacity><Text style={styles.link}></Text></TouchableOpacity>
      <TouchableOpacity><Text style={styles.link}></Text></TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0c0c',
    padding: 20,
  },
  subHeader: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 25,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bullet: {
    color: '#00e676',
    fontSize: 18,
    marginRight: 8,
  },
  bulletText: {
    color: 'white',
    flex: 1,
    alignSelf: "center",
  },
  choose: {
    color: 'white',
    marginTop: 30,
    fontSize: 16,
    fontWeight: 'bold',
  },
  special: {
    color: '#e11d48',
    fontWeight: 'bold',
  },
  plans: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  planBox: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 10,
    padding: 12,
  },
  planBoxSelected: {
    borderWidth: 2,
    borderColor: '#e11d48',
    position: 'relative',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#e11d48',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 4,
  },
  price: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  oldPrice: {
    color: '#9ca3af',
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  period: {
    color: 'gray',
    fontSize: 12,
  },
  ctaButton: {
    backgroundColor: '#e11d48',
    paddingVertical: 12,
    marginTop: 25,
    borderRadius: 10,
    alignItems: 'center',
  },
  ctaText: {
    color: 'white',
    fontWeight: 'bold',
  },
  restore: {
    color: '#cbd5e1',
    textAlign: 'center',
    marginTop: 20,
  },
  note: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 20,
  },
  link: {
    color: '#60a5fa',
    marginTop: 8,
  },
});

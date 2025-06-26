import React, { useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';

export default function LoginScreen() {
  const router = useRouter();
  const navigation= useNavigation()
useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Connexion",
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
    <View style={styles.container}>
      {/* Logo WaraScore */}
      <Text style={styles.logo}>WaraScore</Text>

      {/* Bloc d'expérience absolue */}
      <View style={styles.experienceCard}>
        <Text style={styles.experienceTitle}>Profitez de tous les avantages</Text>
        <Text style={styles.experienceSubtitle}>
          100% gratuite. 100% bénéfique. Rejoigner-nous dès maintenant !
        </Text>
      </View>

      {/* Bouton E-mail */}
       <TouchableOpacity style={styles.button} onPress={() => router.push('/email-login')}>
         <FontAwesome name="envelope" size={24} color="#fff" style={styles.icon} />
         <Text style={styles.buttonText}>Continuer avec l'e-mail</Text>
      </TouchableOpacity>

      {/* Bouton Google */}
      <TouchableOpacity style={styles.button}>
        <FontAwesome name="google" size={24} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Continuer avec Google</Text>
      </TouchableOpacity>

      {/* Bouton Apple */}
      <TouchableOpacity style={styles.button}>
        <FontAwesome name="apple" size={24} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Continuer avec Apple</Text>
      </TouchableOpacity>

      {/* Mentions légales */}
      <Text style={styles.terms}>
        <Text style={styles.link}></Text><Text style={styles.link}></Text>
      </Text>
    </View>
  );
}
export const options = {
  title: 'Connexion',
  headerStyle: {
    backgroundColor: '#000',
  },
  headerTintColor: '#fff',
  headerTitleAlign: 'center',
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', 
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 70,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
  },
  experienceCard: {
    backgroundColor: '#000', 
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    width: '100%',
    borderWidth: 1,
    borderColor: '#333', 
  },
  experienceTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  experienceSubtitle: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000', 
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#333', 
  },
  icon: {
    marginRight: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  terms: {
    color: 'gray',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 40,
  },
  link: {
    color: '#4F46E5',
    textDecorationLine: 'underline',
  },
});

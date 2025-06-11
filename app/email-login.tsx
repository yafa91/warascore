import React, { useState, useLayoutEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function EmailLogin() {
  const router = useRouter();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    Alert.alert('Succès', `Bienvenue ${email}`);
    router.replace('/'); // Redirection vers l'accueil
  };

  const handleForgotPassword = () => {
    Alert.prompt(
      'Mot de passe oublié',
      'Veuillez entrer votre adresse e-mail pour recevoir un lien de réinitialisation.',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Envoyer',
          onPress: (emailInput) => {
            if (!emailInput || !emailInput.includes('@')) {
              Alert.alert('Erreur', 'Veuillez entrer une adresse e-mail valide.');
              return;
            }
            // Ici tu peux appeler ta fonction pour envoyer le mail de réinitialisation
            Alert.alert('Succès', `Un lien de réinitialisation a été envoyé à ${emailInput}.`);
          },
        },
      ],
      'plain-text',
      email
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion par e-mail</Text>

      <TextInput
        style={styles.input}
        placeholder="Adresse e-mail"
        placeholderTextColor="#aaa"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Se connecter</Text>
      </TouchableOpacity>

      <View style={styles.signupWrapper}>
        <Text style={styles.noAccountText}>Pas de compte ? </Text>
        <TouchableOpacity onPress={() => router.push('/signup')}>
          <Text style={styles.signUpText}>S'inscrire</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordWrapper}>
        <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',  
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    backgroundColor: '#222',
    color: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#4F46E5',
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 10,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  signupWrapper: {
    flexDirection: 'row',        
    marginTop: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noAccountText: {
    color: '#aaa',
    fontSize: 14,
  },
  signUpText: {
    color: '#4F46E5',
    fontWeight: 'bold',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  forgotPasswordWrapper: {
    marginTop: 10,
  },
  forgotPasswordText: {
    color: '#4F46E5',
    fontSize: 14,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
});

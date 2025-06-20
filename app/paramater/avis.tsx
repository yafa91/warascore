import React, { useState, useLayoutEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';


export default function Avis() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const navigation = useNavigation();

 useLayoutEffect(() => {
  navigation.setOptions({
    headerTitle: "Ton avis",
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
    headerShown: true
  });
}, [navigation]);

  const handleImagePick = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (!email || !message || message.length < 10) {
      Alert.alert("Erreur", "Merci de remplir tous les champs requis (au moins 10 caractères pour le message).");
      return;
    }


    Alert.alert("Merci !", "Votre message a bien été envoyé.");
    setEmail('');
    setMessage('');
    setImage(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vous avec une question? Des suggestion? Ecriver nous</Text>

      <TextInput
        style={styles.input}
        placeholder="Ton e-mail*"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <Text style={styles.helperText}>*Ceci est un champ obligatoire</Text>

      <TextInput
        style={styles.textArea}
        placeholder="Décris ton problème ou ta suggestion"
        placeholderTextColor="#aaa"
        multiline
        numberOfLines={5}
        value={message}
        onChangeText={setMessage}
      />
      <Text style={styles.helperText}>Merci d'utiliser au moins 10 caractères</Text>

      <TouchableOpacity style={styles.uploadBox} onPress={handleImagePick}>
        <Text style={styles.uploadText}>+ Envoyer-nous une capture d’écran (facultatif)</Text>
      </TouchableOpacity>
      {image && <Image source={{ uri: image }} style={styles.previewImage} />}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>SOUMETTRE</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#1e1e1e',
    color: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 5,
  },
  helperText: {
    color: '#777',
    fontSize: 12,
    marginBottom: 10,
  },
  textArea: {
    backgroundColor: '#1e1e1e',
    color: '#fff',
    padding: 15,
    borderRadius: 10,
    height: 120,
    textAlignVertical: 'top',
  },
  uploadBox: {
    borderColor: '#555',
    borderWidth: 1,
    borderRadius: 10,
    padding: 20,
    marginTop: 15,
    alignItems: 'center',
  },
  uploadText: {
    color: '#aaa',
    fontSize: 14,
  },
  previewImage: {
    width: '100%',
    height: 200,
    marginTop: 10,
    borderRadius: 10,
  },
  button: {
    backgroundColor: '#7b7bff',
    padding: 15,
    borderRadius: 10,
    marginTop: 25,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

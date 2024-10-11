// MainPage.js
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ImageBackground, Linking, Image } from 'react-native';
import * as Location from 'expo-location';

const MainPage = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    };

    fetchLocation();
  }, []);

  const openLocationInMaps = () => {
    if (location) {
      const { latitude, longitude } = location.coords;
      const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
      Linking.openURL(url);
    } else {
      Alert.alert('Error', 'Location not available');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={openLocationInMaps} style={styles.imageContainer}>
        <ImageBackground
          source={require('../location-placeholder.png')}
          style={styles.backgroundImage}
        >
          <Text style={styles.locationText}>Current Location</Text>
        </ImageBackground>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('EmergencyContacts')}>
        <Text style={styles.buttonText}>Emergency Contacts</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('HelplineNumbers')}>
        <Text style={styles.buttonText}>Helpline Numbers</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CameraDetection')}>
        <Text style={styles.buttonText}>Camera Detection</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ShareLocation')}>
        <Text style={styles.buttonText}>Share Location And Media</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Record')}>
        <Text style={styles.buttonText}>Record Audio and Share</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Alert')}>
        <Text style={styles.buttonText}>Set Alert</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.chatbotButton} onPress={() => navigation.navigate('Chatbot')}>
        <Image source={require('./chatbot-icon.png')} style={styles.chatbotImage} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  imageContainer: {
    width: '100%',
    height: 200,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '40%',
    marginLeft: '80%',
    height: '30%',
    marginTop: '1%',
    borderRadius: 30,
  },
  locationText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    marginVertical: 15,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatbotButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  chatbotImage: {
    width: 80,
    height: 100,
  },
});

export default MainPage;

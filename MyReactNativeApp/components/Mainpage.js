import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ImageBackground, Linking, Image, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import MotionDetection from './Motiondetection'; // Import Motion Detection

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
    <ScrollView
      contentContainerStyle={styles.container} // Use contentContainerStyle for alignment
    >
      {/* Motion Detection Component */}
      <MotionDetection />

      <Text style={styles.motionStatus}>
        {location ? "Motion Detection Active" : "Location Not Available"}
      </Text>

      <TouchableOpacity onPress={openLocationInMaps} style={styles.imageContainer}>
        <ImageBackground
          source={require('../location-placeholder.png')}
          style={styles.backgroundImage}
        >
          <Text style={styles.locationText}>Current Location</Text>
        </ImageBackground>
      </TouchableOpacity>

      {/* Emergency Contacts and Helpline Numbers */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('EmergencyContacts')}>
          <Text style={styles.buttonText}>Emergency Contacts</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('HelplineNumbers')}>
          <Text style={styles.buttonText}>Helpline Numbers</Text>
        </TouchableOpacity>
      </View>

      {/* Camera Detection and Share Location */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CameraDetection')}>
          <Text style={styles.buttonText}>Camera Detection</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ShareLocation')}>
          <Text style={styles.buttonText}>Share Location And Media</Text>
        </TouchableOpacity>
      </View>

      {/* Record Audio and Set Alert */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Record')}>
          <Text style={styles.buttonText}>Record Audio and Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Alert')}>
          <Text style={styles.buttonText}>Set Alert(S0S)</Text>
        </TouchableOpacity>
      </View>

      {/* Period Predictor and Hospitals */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Period')}>
          <Text style={styles.buttonText}>Period Predictor</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Hospitals')}>
          <Text style={styles.buttonText}>Hospitals</Text>
        </TouchableOpacity>
      </View>

      {/* Chatbot Button below Period Predictor */}
      <View style={styles.chatbotContainer}>
        <TouchableOpacity style={styles.chatbotButton} onPress={() => navigation.navigate('Chatbot')}>
          <Image source={require('./chatbot-icon.png')} style={styles.chatbotImage} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingBottom: 20, // Add some padding at the bottom for scrolling
  },
  imageContainer: {
    width: '100%',
    height: 200,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
    height: '60%', // Fill the height of the container
    marginHorizontal: '18%', // Center the image horizontally
    borderRadius: 10,
    overflow: 'hidden', // To ensure the text does not overflow
  },
  locationText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  motionStatus: {
    fontSize: 16, // Adjusted size for motion status
    color: '#ff0000', // Optional: Change color for visibility
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    marginVertical: 15,
    width: '45%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 10,
  },
  chatbotContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2, // Add some margin for spacing
  },
  chatbotButton: {
    // You can further style the button if needed
  },
  chatbotImage: {
    width: 80,
    height: 100,
    marginRight:300,
    marginBottom:100,
  },
});

export default MainPage;

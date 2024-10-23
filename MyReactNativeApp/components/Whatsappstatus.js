
import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import * as Location from 'expo-location';
import { Linking } from 'react-native';

// Function to share a message via WhatsApp
const Whatsappstatus = (message) => {
  // Construct the WhatsApp status URL
  const url = `whatsapp://send?text=${encodeURIComponent(message)}`;

  // Open the URL
  Linking.openURL(url)
    .then((supported) => {
      if (!supported) {
        Alert.alert('Error', 'WhatsApp is not installed on your device.');
      }
    })
    .catch((err) => {
      Alert.alert('Error', 'An error occurred while opening WhatsApp.');
    });
};

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getLocationAndShare = async () => {
      // Request permission to access location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Location permission denied');
        setLoading(false);
        return;
      }

      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = currentLocation.coords;
      const message = `Check out my location: https://www.google.com/maps?q=${latitude},${longitude}`;

      // Share the location via WhatsApp
      Whatsappstatus(message);
      setLoading(false);
    };

    getLocationAndShare();
  }, []);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Your location has been shared!</Text>
    </View>
  );
};

export default App;

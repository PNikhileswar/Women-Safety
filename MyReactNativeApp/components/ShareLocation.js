import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';

const ShareLocation = () => {
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchContactsAndLocation = async () => {
      // Load emergency contacts from AsyncStorage
      try {
        const storedContacts = await AsyncStorage.getItem('emergencyContacts');
        if (storedContacts !== null) {
          setEmergencyContacts(JSON.parse(storedContacts));
        } else {
          Alert.alert('Error', 'No emergency contacts found.');
        }
      } catch (error) {
        console.log('Error loading contacts from storage:', error);
      }

      // Request location permissions and get current location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      try {
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      } catch (error) {
        setErrorMsg('Unable to get current location');
      }
    };

    fetchContactsAndLocation();
  }, []);

  useEffect(() => {
    // Automatically send location via SMS once contacts and location are available
    if (emergencyContacts.length > 0 && location) {
      shareLocationViaSMS();
    }
  }, [emergencyContacts, location]);

  const shareLocationViaSMS = () => {
    if (location) {
      const { latitude, longitude } = location.coords;
      const message = `I'm in danger! My current location is: https://www.google.com/maps?q=${latitude},${longitude}`;
      const phoneNumbers = emergencyContacts.map(contact => contact.phoneNumber).join(',');

      if (phoneNumbers) {
        Linking.openURL(`sms:${phoneNumbers}?body=${encodeURIComponent(message)}`);
      } else {
        Alert.alert('Error', 'No emergency contact numbers available.');
      }
    } else {
      Alert.alert('Error', 'Location not available. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Share Your Location</Text>
      {errorMsg ? (
        <Text style={styles.error}>{errorMsg}</Text>
      ) : (
        <Text>Location and contacts are being processed...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  error: {
    color: 'red',
  },
});

export default ShareLocation;

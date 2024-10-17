import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import * as Contacts from 'expo-contacts';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const DaughterLocationSharing = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [initialLocation, setInitialLocation] = useState(null);
  const [distanceThreshold, setDistanceThreshold] = useState(100); // 100 meters default
  const [showContacts, setShowContacts] = useState(false);

  // Twilio credentials
  const TWILIO_ACCOUNT_SID = 'AC1e8bbb02379e0cfcdd564da8023d9a02';
  const TWILIO_AUTH_TOKEN = '51fc3df3a73f48ac560b4c7e2ea0ac82'; // This should be kept secret!
  const TWILIO_PHONE_NUMBER = '+18507713183';

  useEffect(() => {
    loadStoredContacts();
    loadSelectedContact();
  }, []);

  const loadStoredContacts = async () => {
    try {
      const storedContacts = await AsyncStorage.getItem('contacts');
      if (storedContacts !== null) {
        setContacts(JSON.parse(storedContacts));
      }
    } catch (error) {
      console.log('Error loading contacts:', error);
    }
  };

  const loadSelectedContact = async () => {
    try {
      const storedSelectedContact = await AsyncStorage.getItem('selectedContact');
      if (storedSelectedContact !== null) {
        setSelectedContact(JSON.parse(storedSelectedContact));
      }
    } catch (error) {
      console.log('Error loading selected contact:', error);
    }
  };

  const saveContact = async (contact) => {
    const updatedContacts = [...contacts, contact];
    setContacts(updatedContacts);
    await AsyncStorage.setItem('contacts', JSON.stringify(updatedContacts));

    setSelectedContact(contact);
    await AsyncStorage.setItem('selectedContact', JSON.stringify(contact));

    Alert.alert('Contact added successfully!');
  };

  const startSharingLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location is required.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setInitialLocation(location.coords);
      setIsSharing(true);

      // Send the initial location to the selected contact
      await sendLocationToSMS(location.coords, selectedContact);

      await Location.watchPositionAsync(
        { distanceInterval: 1 },
        async (newLocation) => {
          if (isSharing) {
            const distance = calculateDistance(
              initialLocation.latitude,
              initialLocation.longitude,
              newLocation.coords.latitude,
              newLocation.coords.longitude
            );
            if (distance > distanceThreshold) {
              await sendLocationToSMS(newLocation.coords, selectedContact);
              stopSharingLocation();
            }
          }
        }
      );
    } catch (error) {
      console.error('Error starting location sharing:', error);
      Alert.alert('Error starting location sharing:', error.message);
    }
  };

  const pickContact = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access contacts is required.');
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
      });

      if (data.length > 0) {
        setContacts(data);
        setShowContacts(true);
      } else {
        Alert.alert('No contacts found');
      }
    } catch (error) {
      console.error('Error picking contact:', error);
      Alert.alert('Error picking contact:', error.message);
    }
  };

  const stopSharingLocation = async () => {
    try {
      setIsSharing(false);
      Alert.alert('Location sharing stopped.');
    } catch (error) {
      console.error('Error stopping location sharing:', error);
      Alert.alert('Error stopping location sharing:', error.message);
    }
  };

  const sendLocationToSMS = async (coords, contact) => {
    if (contact.phoneNumbers.length > 0) {
      const phoneNumber = contact.phoneNumbers[0].number;

      // Ensure the phone number is in E.164 format
      if (!phoneNumber.startsWith('+')) {
        Alert.alert('Invalid phone number format. Please use E.164 format.');
        return;
      }

      const message = `Current Location: https://maps.google.com/?q=${coords.latitude},${coords.longitude}`;
      await sendSMS(phoneNumber, message);
    } else {
      Alert.alert('No phone number found for this contact.');
    }
  };

  const sendSMS = async (to, message) => {
    try {
      const response = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
        new URLSearchParams({
          From: TWILIO_PHONE_NUMBER,
          To: to,
          Body: message,
        }),
        {
          auth: {
            username: TWILIO_ACCOUNT_SID,
            password: TWILIO_AUTH_TOKEN,
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded', // Set content type
          },
        }
      );

      console.log('SMS sent successfully:', response.data);
      Alert.alert('SMS sent successfully to ' + to);
    } catch (error) {
      console.error('Error sending SMS:', error.response ? error.response.data : error.message);
      Alert.alert('Error sending SMS:', error.response ? error.response.data.message : error.message);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d * 1000; // Distance in meters
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daughter Location Sharing</Text>
      <TouchableOpacity style={styles.button} onPress={pickContact}>
        <Text style={styles.buttonText}>Pick Contact</Text>
      </TouchableOpacity>
      {showContacts && (
        <FlatList
          data={contacts}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => saveContact(item)}>
              <Text style={styles.contactText}>{item.name}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
      {selectedContact && (
        <View>
          <Text style={styles.selectedContactText}>
            Selected Contact: {selectedContact.name}
          </Text>
          <TouchableOpacity style={styles.button} onPress={startSharingLocation}>
            <Text style={styles.buttonText}>Start Sharing Location</Text>
          </TouchableOpacity>
          {isSharing && (
            <TouchableOpacity style={styles.button} onPress={stopSharingLocation}>
              <Text style={styles.buttonText}>Stop Sharing Location</Text>
            </TouchableOpacity>
          )}
        </View>
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
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  contactText: {
    fontSize: 16,
    marginBottom: 10,
  },
  selectedContactText: {
    fontSize: 16,
    marginBottom: 10,
  },
});

export default DaughterLocationSharing;

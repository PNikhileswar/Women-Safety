

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import * as Notifications from 'expo-notifications';
import * as SMS from 'expo-sms';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

export default function MotionDetection() {
  const [isHighMotion, setIsHighMotion] = useState(false);
  const motionBuffer = useRef([]);
  const lastNotificationTime = useRef(0);
  const smsSentCount = useRef(0);
  const lastLocation = useRef(null);

  useEffect(() => {
    const requestPermissions = async () => {
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (locationStatus !== 'granted') {
        Alert.alert('Permission required', 'Location permission is required to send your location.');
      }
    };

    requestPermissions();

    const accelerometerSubscription = Accelerometer.addListener(accelerometerData => {
      updateMotionBuffer(accelerometerData);
    });

    Accelerometer.setUpdateInterval(10);

    const motionCheckInterval = setInterval(() => {
      checkForHighMotion();
    }, 2000);

    return () => {
      accelerometerSubscription.remove();
      clearInterval(motionCheckInterval);
    };
  }, []);

  const updateMotionBuffer = (data) => {
    motionBuffer.current.push(data);
    if (motionBuffer.current.length > 20) {
      motionBuffer.current.shift();
    }
  };

  const checkForHighMotion = async () => {
    if (motionBuffer.current.length < 20) return;
  
    const averageMotion = motionBuffer.current.reduce((sum, data) => {
      const motionStrength = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
      return sum + motionStrength;
    }, 0) / motionBuffer.current.length;
  
    if (averageMotion > 1.5) {
      setIsHighMotion(true);
      
      if (smsSentCount.current < 2) {
        await sendNotification();
        await sendEmergencySMS();
        smsSentCount.current += 1; // Increment after sending
      }
    } else {
      setIsHighMotion(false);
      // Reset smsSentCount only when transitioning from high to normal motion
      if (isHighMotion) {
        smsSentCount.current = 0; // Reset counter if previously in high motion
      }
    }
  };
  

  const sendNotification = async () => {
    const now = Date.now();
    if (now - lastNotificationTime.current < 60000) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "High Motion Detected!",
        body: "You seem to be running. Stay safe!",
      },
      trigger: null,
    });

    lastNotificationTime.current = now;
  };

  const sendEmergencySMS = async () => {
    const emergencyContacts = await getEmergencyContacts();
    const phoneNumbers = emergencyContacts.map(contact => contact.phoneNumber);

    if (phoneNumbers.length === 0) return;

    const location = await getCurrentLocation();
    const locationMessage = location
      ? `My current location: https://www.google.com/maps?q=${location.latitude},${location.longitude}`
      : 'Unable to fetch my location.';

    const message = `High motion detected! Please check on me. ${locationMessage}`;

    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      const { result } = await SMS.sendSMSAsync(phoneNumbers, message);
      if (result === 'sent') {
        smsSentCount.current += 1;
      }
    }
  };

  const getEmergencyContacts = async () => {
    try {
      const storedContacts = await AsyncStorage.getItem('emergencyContacts');
      return storedContacts !== null ? JSON.parse(storedContacts) : [];
    } catch (error) {
      console.log('Error loading contacts:', error);
      return [];
    }
  };

  const getCurrentLocation = async () => {
    try {
      let location = await Location.getCurrentPositionAsync({});
      lastLocation.current = location.coords;
      return location.coords;
    } catch (error) {
      console.log('Error fetching location:', error);
      return null;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.subHeader}>Motion Detection</Text>
      <Text style={styles.motionStatus}>
        {isHighMotion ? "High Motion Detected!" : "Normal Motion"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 10,
    alignItems: 'center',
  },
  subHeader: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 10,
  },
  motionStatus: {
    fontSize: 18,
    color: '#fff',
  },
});

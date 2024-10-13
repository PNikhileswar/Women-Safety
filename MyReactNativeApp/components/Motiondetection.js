import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import * as Notifications from 'expo-notifications';
import * as SMS from 'expo-sms';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MotionDetection() {
  const [isHighMotion, setIsHighMotion] = useState(false);
  const motionBuffer = useRef([]);
  const lastNotificationTime = useRef(0);
  const smsSent = useRef(false); // Track if SMS has been sent

  useEffect(() => {
    const accelerometerSubscription = Accelerometer.addListener(accelerometerData => {
      updateMotionBuffer(accelerometerData);
    });

    Accelerometer.setUpdateInterval(100); // 10 readings per second

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
    if (motionBuffer.current.length > 20) { // Keep last 2 seconds of data (20 * 100ms)
      motionBuffer.current.shift();
    }
  };

  const checkForHighMotion = () => {
    if (motionBuffer.current.length < 20) return; // Ensure we have 2 seconds of data

    const averageMotion = motionBuffer.current.reduce((sum, data) => {
      const motionStrength = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
      return sum + motionStrength;
    }, 0) / motionBuffer.current.length;

    if (averageMotion > 1.5) { // Adjust this threshold as needed
      setIsHighMotion(true);
      if (!smsSent.current) {
        sendNotification();
        sendEmergencySMS();
      }
    } else {
      // Only reset SMS sent status when motion is low
      if (isHighMotion) {
        smsSent.current = false; // Reset SMS sent flag when motion is normal
      }
      setIsHighMotion(false);
    }
  };

  const sendNotification = async () => {
    const now = Date.now();
    if (now - lastNotificationTime.current < 60000) return; // Limit to one notification per minute

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

    if (phoneNumbers.length === 0) {
      Alert.alert('No emergency contacts', 'Please add emergency contacts in the Emergency Contacts screen.');
      return;
    }

    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      const { result } = await SMS.sendSMSAsync(
        phoneNumbers, 
        'High motion detected! Please check on me.'
      );
      if (result === 'sent') {
        Alert.alert('SMS Sent', 'Emergency contacts have been notified.');
        smsSent.current = true; // Mark SMS as sent
      }
    } else {
      Alert.alert('Error', 'SMS service is not available on this device.');
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
    width: '100%',
    padding: 20,
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

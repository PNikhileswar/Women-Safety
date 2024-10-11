import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import { useFocusEffect } from '@react-navigation/native';

const AlertPage = () => {
  let soundObject = null;

  // Function to play alert sound
  const playAlertSound = async () => {
    if (!soundObject) {
      const { sound } = await Audio.Sound.createAsync(
        require('./alert.mp3') // Replace with your alert sound file path
      );
      soundObject = sound;
    }
    await soundObject.playAsync();
  };

  // Function to stop the alert sound
  const stopAlertSound = async () => {
    if (soundObject) {
      await soundObject.stopAsync();
    }
  };

  // Handle the behavior when page gains or loses focus
  useFocusEffect(
    useCallback(() => {
      playAlertSound(); // Play sound when the page is focused

      return () => {
        stopAlertSound(); // Stop sound when the page is unfocused
      };
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Alert Activated!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red', // Updated background color to orange
  },
  text: {
    fontSize: 30, // Increased font size
    fontWeight: 'bold', // Bold font weight
    color: '#ffffff', // White text color
    textShadowColor: '#000000', // Black text shadow
    textShadowOffset: { width: 2, height: 2 }, // Offset of the shadow
    textShadowRadius: 5, // Blurred shadow effect
  },
});

export default AlertPage;

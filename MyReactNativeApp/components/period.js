import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, Platform } from 'react-native';
import moment from 'moment';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notifications to display even when the app is in the background or killed
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const PeriodPrediction = () => {
  const [lastPeriod, setLastPeriod] = useState('');
  const [cycleLength, setCycleLength] = useState('');
  const [nextPeriod, setNextPeriod] = useState(null);

  // Request permissions for notifications
  useEffect(() => {
    const getNotificationPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission not granted to show notifications');
      }
    };

    getNotificationPermissions();
  }, []);

  useEffect(() => {
    // Load last period and cycle length from storage on component mount
    const loadStoredData = async () => {
      try {
        const storedLastPeriod = await AsyncStorage.getItem('lastPeriod');
        const storedCycleLength = await AsyncStorage.getItem('cycleLength');

        if (storedLastPeriod && storedCycleLength) {
          setLastPeriod(storedLastPeriod);
          setCycleLength(storedCycleLength);
          calculateNextPeriod(storedLastPeriod, storedCycleLength);
        }
      } catch (error) {
        console.log('Error loading stored data:', error);
      }
    };

    loadStoredData();
  }, []);

  const calculateNextPeriod = async (lastPeriodDate, cycleDays) => {
    if (lastPeriodDate && cycleDays) {
      const next = moment(lastPeriodDate).add(Number(cycleDays), 'days');
      const nextDateStr = next.format('YYYY-MM-DD');
      setNextPeriod(nextDateStr);

      // Schedule the notification
      await scheduleNotification(next);
    }
  };

  const handleCalculateNextPeriod = async () => {
    if (lastPeriod && cycleLength) {
      await calculateNextPeriod(lastPeriod, cycleLength);
      // Save last period and cycle length to storage
      await AsyncStorage.setItem('lastPeriod', lastPeriod);
      await AsyncStorage.setItem('cycleLength', cycleLength);
    } else {
      Alert.alert('Please fill in all fields');
    }
  };

  const scheduleNotification = async (nextDate) => {
    const triggerDate = new Date(nextDate);

    // For testing purposes, you can set the trigger date to a few seconds from now
    // const triggerDate = new Date(Date.now() + 10 * 1000); // 10 seconds from now

    // Ensure the date is in the future
    if (triggerDate > new Date()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Period Reminder',
          body: "This day you have to be careful, so try not to go outside today.",
        },
        trigger: {
          date: triggerDate,
        },
      });
      Alert.alert('Notification scheduled for ' + nextDate.format('YYYY-MM-DD'));
    } else {
      Alert.alert('The next period date is in the past.');
    }
  };

  // Automatically calculate the next period after the current one has passed
  useEffect(() => {
    const checkAndUpdateNextPeriod = async () => {
      const today = moment();
      if (nextPeriod && today.isAfter(nextPeriod)) {
        const newLastPeriod = nextPeriod;
        const newNextPeriod = moment(newLastPeriod).add(Number(cycleLength) || 30, 'days').format('YYYY-MM-DD');
        setLastPeriod(newLastPeriod);
        setNextPeriod(newNextPeriod);

        // Save updated dates
        await AsyncStorage.setItem('lastPeriod', newLastPeriod);
        await AsyncStorage.setItem('cycleLength', cycleLength);

        // Schedule the next notification
        await scheduleNotification(moment(newNextPeriod));
      }
    };

    checkAndUpdateNextPeriod();
  }, [nextPeriod]);

  return (
    <View style={{ padding: 20 }}>
      <Text>Last Period Start Date (YYYY-MM-DD):</Text>
      <TextInput
        placeholder="Enter Date"
        value={lastPeriod}
        onChangeText={(text) => setLastPeriod(text)}
        style={{ borderBottomWidth: 1, marginBottom: 10 }}
      />
      <Text>Average Cycle Length (in days):</Text>
      <TextInput
        placeholder="Enter Cycle Length"
        value={cycleLength}
        keyboardType="numeric"
        onChangeText={(text) => setCycleLength(text)}
        style={{ borderBottomWidth: 1, marginBottom: 10 }}
      />
      <Button title="Calculate Next Period" onPress={handleCalculateNextPeriod} />
      {nextPeriod && (
        <Text style={{ marginTop: 20 }}>Your next period is expected on: {nextPeriod}</Text>
      )}
    </View>
  );
};

export default PeriodPrediction;

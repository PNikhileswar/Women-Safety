
import React, { useState, useEffect } from 'react'; 
import { View, Text, TextInput, Button, Alert, StyleSheet, SafeAreaView, TouchableOpacity, Platform } from 'react-native';
import moment from 'moment';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker'; // Import DateTimePicker

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
  const [showDatePicker, setShowDatePicker] = useState(false); // State to manage DatePicker visibility
  const [date, setDate] = useState(new Date()); // Initial date for the picker

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

  // Show the DatePicker when the input is pressed
  const showDatePickerHandler = () => {
    setShowDatePicker(true);
  };

  // Handle the date selection
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios'); // For iOS, keep it visible after selection
    setDate(currentDate); // Set selected date
    setLastPeriod(moment(currentDate).format('YYYY-MM-DD')); // Format and set date in 'YYYY-MM-DD'
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <LinearGradient
        colors={['#FFEBEE', '#FFCDD2', '#E1F5FE', '#B3E5FC', '#B2EBF2']}
        style={styles.gradient}
      >
        <View style={styles.container}>
          <Text style={styles.header}>Period Prediction</Text>
          
          <Text style={styles.label}>Last Period Start Date (YYYY-MM-DD):</Text>
          <TouchableOpacity onPress={showDatePickerHandler}>
            <TextInput 
              placeholder="Enter Date"
              value={lastPeriod}
              style={styles.input}
              placeholderTextColor="#888"
              editable={false} // Disable manual editing, allow only via date picker
            />
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}

          <Text style={styles.label}>Average Cycle Length (in days):</Text>
          <TextInput
            placeholder="Enter Cycle Length"
            value={cycleLength}
            keyboardType="numeric"
            onChangeText={(text) => setCycleLength(text)}
            style={styles.input}
            placeholderTextColor="#888"
          />
          
          <TouchableOpacity style={styles.calculateButton} onPress={handleCalculateNextPeriod}>
            <Text style={styles.buttonText}>Calculate Next Period</Text>
          </TouchableOpacity>

          {nextPeriod && (
            <Text style={styles.resultText}>Your next period is expected on: {nextPeriod}</Text>
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 30,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    color: '#000',
    textAlign: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  calculateButton: {
    backgroundColor: '#0288D1',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#0288D1',
    marginTop: 20,
    padding: 10,
    backgroundColor: '#E1F5FE',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    textAlign: 'center',
  },
});


export default PeriodPrediction;

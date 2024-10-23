

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';

const Registration = () => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dob, setDob] = useState('');
  const [place, setPlace] = useState('');
  const [email, setEmail] = useState('');
  const [parentPhoneNumber, setParentPhoneNumber] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadUserDetails();
  }, []);

  const loadUserDetails = async () => {
    try {
      const storedName = await AsyncStorage.getItem('userName');
      const storedPhoneNumber = await AsyncStorage.getItem('userPhoneNumber');
      const storedDob = await AsyncStorage.getItem('userDob');
      const storedPlace = await AsyncStorage.getItem('userPlace');
      const storedEmail = await AsyncStorage.getItem('userEmail');
      const storedParentPhoneNumber = await AsyncStorage.getItem('userParentPhoneNumber');
      if (storedName && storedPhoneNumber && storedDob && storedPlace && storedEmail && storedParentPhoneNumber) {
        setName(storedName);
        setPhoneNumber(storedPhoneNumber);
        setDob(storedDob);
        setPlace(storedPlace);
        setEmail(storedEmail);
        setParentPhoneNumber(storedParentPhoneNumber);
        setIsEditMode(true);
      }
    } catch (error) {
      console.log('Error loading user details: ', error);
    }
  };

  const saveUserDetails = async () => {
    if (name && phoneNumber && dob && place && email && parentPhoneNumber) {
      const phoneRegex = /^[0-9]{10}$/;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!phoneRegex.test(phoneNumber) || !phoneRegex.test(parentPhoneNumber)) {
        Alert.alert('Error', 'Phone number must be 10 digits');
        return;
      }

      if (!emailRegex.test(email)) {
        Alert.alert('Error', 'Invalid email format');
        return;
      }

      try {
        await AsyncStorage.setItem('userName', name);
        await AsyncStorage.setItem('userPhoneNumber', phoneNumber);
        await AsyncStorage.setItem('userDob', dob);
        await AsyncStorage.setItem('userPlace', place);
        await AsyncStorage.setItem('userEmail', email);
        await AsyncStorage.setItem('userParentPhoneNumber', parentPhoneNumber);
        Alert.alert('Success', 'Details saved successfully');
        setIsEditMode(true);
      } catch (error) {
        console.log('Error saving user details: ', error);
        Alert.alert('Error', 'Unable to save details, please try again');
      }
    } else {
      Alert.alert('Error', 'Please fill in all fields');
    }
  };

  const enableEditing = () => {
    setIsEditMode(false);
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dob;
    setShowDatePicker(false);
    setDob(currentDate.toLocaleDateString());
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <LinearGradient
        colors={['#FFEBEE', '#FFCDD2', '#E1F5FE', '#B3E5FC', '#B2EBF2']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>User Registration</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={name}
            editable={!isEditMode}
            onChangeText={setName}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Enter your phone number"
            value={phoneNumber}
            editable={!isEditMode}
            onChangeText={setPhoneNumber}
            keyboardType="numeric"
          />

          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
            <Text style={styles.dateText}>{dob ? `DOB: ${dob}` : 'Select your date of birth'}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={new Date()}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Enter your place"
            value={place}
            editable={!isEditMode}
            onChangeText={setPlace}
          />

          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            editable={!isEditMode}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Enter your parent's phone number"
            value={parentPhoneNumber}
            editable={!isEditMode}
            onChangeText={setParentPhoneNumber}
            keyboardType="numeric"
          />

          {!isEditMode ? (
            <TouchableOpacity style={styles.button} onPress={saveUserDetails}>
              <Text style={styles.buttonText}>Save Details</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.button} onPress={enableEditing}>
              <Text style={styles.buttonText}>Edit Details</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    padding: 20,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    borderWidth: 2,
    borderColor: '#0288D1',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    backgroundColor: '#FFF',
  },
  dateText: {
    fontSize: 16,
    color: '#666',
  },
  button: {
    backgroundColor: '#0288D1',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Registration;
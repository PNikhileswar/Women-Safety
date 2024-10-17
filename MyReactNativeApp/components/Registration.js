import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Registration = () => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dob, setDob] = useState('');
  const [place, setPlace] = useState('');
  const [email, setEmail] = useState('');
  const [parentPhoneNumber, setParentPhoneNumber] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  // Load user details when the component mounts
  useEffect(() => {
    loadUserDetails();
  }, []);

  // Function to load user details from AsyncStorage
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

  // Function to save user details in AsyncStorage
  const saveUserDetails = async () => {
    if (name && phoneNumber && dob && place && email && parentPhoneNumber) {
      // Basic validation for email and phone number
      const phoneRegex = /^[0-9]{10}$/; // Example for 10 digit phone number
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

  // Function to enable editing
  const enableEditing = () => {
    setIsEditMode(false);
  };

  return (
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

      <TextInput
        style={styles.input}
        placeholder="Enter your date of birth"
        value={dob}
        editable={!isEditMode}
        onChangeText={setDob}
      />

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
        <Button title="Save Details" onPress={saveUserDetails} />
      ) : (
        <Button title="Edit Details" onPress={enableEditing} />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
});

export default Registration;

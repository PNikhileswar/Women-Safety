// App.js
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Alert } from 'react-native';
import * as Location from 'expo-location'; // Importing expo-location
import * as Permissions from 'expo-permissions'; // Importing expo-permissions

import MainPage from './components/Mainpage'; // Main page with navigation options
import EmergencyContacts from './components/EmergencyContacts'; // Emergency Contacts
import HelplineNumbers from './components/HelplineNumbers'; // Helpline Numbers
import CameraDetection from './components/CameraDetection'; // Camera Detection
import ShareLocation from './components/ShareLocation'; // Share Location screen
import MapScreen from './components/MapScreen'; // Map screen for current location

const Stack = createNativeStackNavigator();

const requestPermissions = async () => {
  // Request location permissions
  const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
  
  // Check if location permission is granted
  if (locationStatus !== 'granted') {
    Alert.alert('Permission Denied', 'Location permission is required for this feature to work.');
  }
};

export default function App() {
  useEffect(() => {
    requestPermissions();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MainPage">
        <Stack.Screen name="MainPage" component={MainPage} options={{ title: 'Women Safety' }} />
        <Stack.Screen name="EmergencyContacts" component={EmergencyContacts} options={{ title: 'Emergency Contacts' }} />
        <Stack.Screen name="HelplineNumbers" component={HelplineNumbers} options={{ title: 'Helpline Numbers' }} />
        <Stack.Screen name="CameraDetection" component={CameraDetection} options={{ title: 'Camera Detection' }} />
        <Stack.Screen name="ShareLocation" component={ShareLocation} options={{ title: 'Share Location' }} />
        <Stack.Screen name="Map" component={MapScreen} options={{ title: 'Current Location on Map' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

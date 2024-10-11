import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Alert, ActivityIndicator, View } from 'react-native';
import * as Location from 'expo-location';

import MainPage from './components/Mainpage'; 
import EmergencyContacts from './components/EmergencyContacts';
import HelplineNumbers from './components/HelplineNumbers';
import CameraDetection from './components/CameraDetection';
import ShareLocation from './components/ShareLocation';
import MapScreen from './components/MapScreen';
import Chatbot from './components/chatbot';
import AlertPage from './components/alert';
import RecordPage from './components/record'; // Import the new AlertPage component

const Stack = createNativeStackNavigator();

const requestPermissions = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission Denied', 'Location permission is required for this feature to work.');
    return false;
  }
  return true;
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getPermissions = async () => {
      const hasPermission = await requestPermissions();
      setIsLoading(false); 
      if (!hasPermission) {
        // Handle permission denial case if necessary
      }
    };
    
    getPermissions();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MainPage">
        <Stack.Screen 
          name="MainPage" 
          component={MainPage} 
          options={{ title: 'Women Safety' }} 
        />
        <Stack.Screen 
          name="EmergencyContacts" 
          component={EmergencyContacts} 
          options={{ title: 'Emergency Contacts' }} 
        />
        <Stack.Screen 
          name="HelplineNumbers" 
          component={HelplineNumbers} 
          options={{ title: 'Helpline Numbers' }} 
        />
        <Stack.Screen 
          name="CameraDetection" 
          component={CameraDetection} 
          options={{ title: 'Camera Detection' }} 
        />
        <Stack.Screen 
          name="ShareLocation" 
          component={ShareLocation} 
          options={{ title: 'Share Location and Media' }} 
        />
        <Stack.Screen 
          name="Map" 
          component={MapScreen} 
          options={{ title: 'Current Location on Map' }} 
        />
        <Stack.Screen 
          name="Chatbot" 
          component={Chatbot} 
          options={{ title: 'Chatbot Assistance' }} 
        />
        <Stack.Screen 
          name="Alert" 
          component={AlertPage}  // Add the new Alert page here
          options={{ title: 'Alert' }} 
        />
        <Stack.Screen 
          name="Record" 
          component={RecordPage}  // Add the new Alert page here
          options={{ title: 'record' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

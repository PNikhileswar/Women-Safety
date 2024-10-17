import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import SplashScreen from './components/splashscreen'; // Import the SplashScreen component
import MainPage from './components/Mainpage'; 
import EmergencyContacts from './components/EmergencyContacts';
import HelplineNumbers from './components/HelplineNumbers';
import CameraDetection from './components/CameraDetection';
import ShareLocation from './components/ShareLocation';
import MapScreen from './components/MapScreen';
import Chatbot from './components/chatbot';
import AlertPage from './components/alert';
import RecordPage from './components/record';
import Period from './components/period'; 
import Hospitals from './components/Hospitals';
import DaughterLocationSharing from './components/DaughterLocationSharing';
import Registration from './components/Registration';
import Policestation from './components/policestation';
import Routeselector from './components/Routeselector';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SplashScreen">
        <Stack.Screen 
          name="SplashScreen" 
          component={SplashScreen} 
          options={{ headerShown: false }} // Hide the header for the splash screen
        />
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
          component={AlertPage} 
          options={{ title: 'Alert' }} 
        />
        <Stack.Screen 
          name="Record" 
          component={RecordPage} 
          options={{ title: 'Record' }} 
        />
        <Stack.Screen 
          name="Period" 
          component={Period} 
          options={{ title: 'Period' }} 
        />
        <Stack.Screen 
          name="Hospitals" 
          component={Hospitals} 
          options={{ title: 'Hospitals' }} 
        />
        <Stack.Screen 
          name="DaughterLocationSharing" 
          component={DaughterLocationSharing} 
          options={{ title: 'Daughter Location Sharing' }} 
        />
         <Stack.Screen 
          name="Registration" 
          component={Registration} 
          options={{ title: 'Register' }} 
        />
        
        <Stack.Screen 
          name="Policestation" 
          component={Policestation} 
          options={{ title: 'Policestation' }} 
        /><Stack.Screen 
          name="Routeselector" 
          component={Routeselector} 
          options={{ title: 'Routeselector' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

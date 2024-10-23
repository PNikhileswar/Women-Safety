
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import SplashScreen from './components/splashscreen'; // Import the SplashScreen component
import MainPage from './components/Mainpage'; 
import EmergencyContacts from './components/EmergencyContacts';
import Helpline from './components/Helpline';
import CameraDetection from './components/CameraDetection';
import ShareLocation from './components/ShareLocation';
import MapScreen from './components/MapScreen';
import AlertPage from './components/alert';
import RecordPage from './components/record';
import Period from './components/period'; 
import Hospitals from './components/Hospitals';
import DaughterLocationSharing from './components/DaughterLocationSharing';
import Registration from './components/Registration';
import Policestation from './components/policestation';
import Routeselector from './components/Routeselector';
import Call from './components/Call';
import Whatsappstatus from './components/Whatsappstatus';

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
          // options={{ title: 'Women Safety' }} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="EmergencyContacts" 
          component={EmergencyContacts} 
          // options={{ title: 'Emergency Contacts' }} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Helpline" 
          component={Helpline} 
          // options={{ title: 'Helpline Numbers' }} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="CameraDetection" 
          component={CameraDetection} 
          // options={{ title: 'Camera Detection' }} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Whatsappstatus" 
          component={ Whatsappstatus} 
          // options={{ title: 'Camera Detection' }} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="ShareLocation" 
          component={ShareLocation} 
          // options={{ title: 'Share Location and Media' }} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Map" 
          component={MapScreen} 
          // options={{ title: 'Current Location on Map' }}
          options={{ headerShown: false }}  
        />
       
        <Stack.Screen 
          name="Alert" 
          component={AlertPage} 
          // options={{ title: 'Alert' }} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Record" 
          component={RecordPage} 
          // options={{ title: 'Record' }} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Period" 
          component={Period} 
          // options={{ title: 'Period' }} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Hospitals" 
          component={Hospitals} 
          // options={{ title: 'Hospitals' }} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="DaughterLocationSharing" 
          component={DaughterLocationSharing} 
          // options={{ title: 'Daughter Location Sharing' }} 
          options={{ headerShown: false }} 
        />
         <Stack.Screen 
          name="Registration" 
          component={Registration} 
          // options={{ title: 'Register' }} 
          options={{ headerShown: false }} 
        />
        
        <Stack.Screen 
          name="Policestation" 
          component={Policestation} 
          // options={{ title: 'Policestation' }} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Call" 
          component={Call} 
          // options={{ title: 'Policestation' }} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Routeselector" 
          component={Routeselector} 
          // options={{ title: 'Routeselector' }} 
          options={{ headerShown: false }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


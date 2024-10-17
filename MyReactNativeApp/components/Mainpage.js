import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking, ScrollView, SafeAreaView } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MotionDetection from './Motiondetection'; // Assuming this is your motion detection logic
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from 'react-native-elements';

// TabIcon component definition
const TabIcon = ({ title, icon, color, navigation, targetScreen, action }) => {
  return (
    <TouchableOpacity
      style={styles.tabIconContainer}
      onPress={action ? action : () => navigation.navigate(targetScreen)}
    >
      <Icon name={icon} size={30} color={color} />
      <Text style={[styles.tabIconText, { color }]}>{title}</Text>
    </TouchableOpacity>
  );
};

const FeatureBox = ({ title, icon, color, navigation, targetScreen }) => {
  return (
    <TouchableOpacity
      style={[styles.box, { backgroundColor: color }]}
      onPress={() => navigation.navigate(targetScreen)}
    >
      <Icon name={icon} size={50} color="white" />
      <Text style={styles.boxText}>{title}</Text>
    </TouchableOpacity>
  );
};

// LocationSharingButton component definition
const LocationSharingButton = ({ fetchAndShareLocation }) => {
  return (
    <TouchableOpacity
      style={styles.shareButton}
      onPress={fetchAndShareLocation}
    >
      <Text style={styles.shareButtonText}>Share My Location</Text>
    </TouchableOpacity>
  );
};

const MainPage = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState([]);

  const checkRegistration = async () => {
    try {
      const storedName = await AsyncStorage.getItem('userName');
      const storedPhoneNumber = await AsyncStorage.getItem('userPhoneNumber');
      const storedDob = await AsyncStorage.getItem('userDob');
      const storedPlace = await AsyncStorage.getItem('userPlace');
      const storedEmail = await AsyncStorage.getItem('userEmail');
      const storedParentPhoneNumber = await AsyncStorage.getItem('userParentPhoneNumber');

      if (storedName && storedPhoneNumber && storedDob && storedPlace && storedEmail && storedParentPhoneNumber) {
        setIsRegistered(true);
      } else {
        setIsRegistered(false);
        Alert.alert('Incomplete Registration', 'Please fill in your information.');
      }
    } catch (error) {
      console.log('Error checking registration status: ', error);
    }
  };

  const fetchLocation = async () => {
    await checkRegistration();
    if (!isRegistered) return;

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return;
    }
    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation);
  };

  const fetchEmergencyContacts = async () => {
    try {
      const storedContacts = await AsyncStorage.getItem('emergencyContacts');
      if (storedContacts !== null) {
        setEmergencyContacts(JSON.parse(storedContacts));
      } else {
        Alert.alert('Error', 'No emergency contacts found.');
      }
    } catch (error) {
      console.log('Error loading contacts from storage:', error);
    }
  };

  const shareLocationViaSMS = () => {
    if (location) {
      const { latitude, longitude } = location.coords;
      const message = `I'm in danger! My current location is: https://www.google.com/maps?q=${latitude},${longitude}`;
      const phoneNumbers = emergencyContacts.map(contact => contact.phoneNumber).join(',');

      if (phoneNumbers) {
        Linking.openURL(`sms:${phoneNumbers}?body=${encodeURIComponent(message)}`);
      } else {
        Alert.alert('Error', 'No emergency contact numbers available.');
      }
    } else {
      Alert.alert('Error', 'Location not available. Please try again.');
    }
  };

  const fetchAndShareLocation = async () => {
    await fetchLocation();
    shareLocationViaSMS();
  };

  useEffect(() => {
    checkRegistration();
    fetchEmergencyContacts(); // Load emergency contacts when the component mounts
  }, []);

  return (
    <SafeAreaView style={styles.safeContainer}>
      <LinearGradient
        colors={['#FFEBEE', '#FFCDD2', '#E1F5FE', '#B3E5FC', '#B2EBF2']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.menuIcon}>
              <Icon name="menu" size={30} color="black" />
            </TouchableOpacity>
            <Animatable.Text animation="fadeInUp" style={styles.header}>
              Welcome to Protection App
            </Animatable.Text>
          </View>

          <TouchableOpacity style={[styles.box, styles.largeBox]}>
            <Text style={styles.largeBoxText}>Motion Detection & Normal Motion</Text>
          </TouchableOpacity>

          <LocationSharingButton fetchAndShareLocation={fetchAndShareLocation} />

          <View style={styles.boxContainer}>
            <FeatureBox title="Emergency Contacts" icon="contacts" color="#ff6f61" navigation={navigation} targetScreen="EmergencyContacts" />
            <FeatureBox title="Camera Detection" icon="camera-alt" color="#4caf50" navigation={navigation} targetScreen="CameraDetection" />
            <FeatureBox title="Share Location & Media" icon="perm-media" color="#2196f3" navigation={navigation} targetScreen="ShareLocation" />
            <FeatureBox title="Set Alert (SOS)" icon="warning" color="#ff9800" navigation={navigation} targetScreen="Alert" />
            <FeatureBox title="Record Audio" icon="mic" color="#673ab7" navigation={navigation} targetScreen="Record" />
            <FeatureBox title="Period Predictor" icon="calendar-today" color="#ff5722" navigation={navigation} targetScreen="Period" />
            <FeatureBox title="Nearby Hospitals" icon="local-hospital" color="#3f51b5" navigation={navigation} targetScreen="Hospitals" />
            <FeatureBox title="Nearby Police Stations" icon="security" color="#009688" navigation={navigation} targetScreen="Policestation" />
            <FeatureBox title="Route Selection" icon="directions" color="#9c27b0" navigation={navigation} targetScreen="Routeselector" />
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <TabIcon title="Home" icon="home" color="#ff9800" navigation={navigation} targetScreen="MainPage" />
          <TabIcon title="Chatbot" icon="chat" color="#4caf50" navigation={navigation} targetScreen="Chatbot" />
          <TabIcon title="Location" icon="location-on" color="#2196f3" action={fetchAndShareLocation} />
          <TabIcon title="Register" icon="app-registration" color="#673ab7" navigation={navigation} targetScreen="Registration" />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    alignItems: 'center',
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  header: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  menuIcon: {
    marginRight: 10,
  },
  boxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  box: {
    width: '48%',
    marginBottom: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    elevation: 3,
  },
  largeBox: {
    backgroundColor: '#4caf50',
  },
  largeBoxText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  boxText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  shareButton: {
    backgroundColor: '#2196f3',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
  },
  tabIconContainer: {
    alignItems: 'center',
  },
  tabIconText: {
    marginTop: 5,
    fontSize: 12,
  },
});

export default MainPage;

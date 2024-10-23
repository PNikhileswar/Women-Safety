

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking, ScrollView, SafeAreaView, Modal } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from 'react-native-elements';
import MapView, { Marker } from 'react-native-maps';
import Motiondetection from './Motiondetection'; // Importing the Motiondetection component

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

const LocationSharingButton = ({ fetchAndShareLocation }) => {
  return (
    <Animatable.View
      animation="zoomIn"
      iterationCount="infinite"
      direction="alternate"
      duration={2000}
      style={styles.animatableContainer}
    >
      <TouchableOpacity
        style={styles.shareButtonRounded}
        onPress={fetchAndShareLocation}
      >
        <Icon
          name="location-on"
          size={24}
          color="white"
          style={styles.iconStyle}
        />
        <Text style={styles.shareButtonText}>Share Live Location</Text>
      </TouchableOpacity>
    </Animatable.View>
  );
};

const MainPage = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);

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
      const message =` I'm in danger! My current location is: https://www.google.com/maps?q=${latitude},${longitude}`;
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

  const openLiveLocation = async () => {
    await fetchLocation();
    if (location) {
      setIsMapVisible(true);
    } else {
      Alert.alert('Error', 'Unable to fetch location. Try again.');
    }
  };

  useEffect(() => {
    checkRegistration();
    fetchEmergencyContacts();
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
          </View>

          {/* <TouchableOpacity style={[styles.box, styles.largeBox]}>
            <Text style={styles.largeBoxText}>Motion Detection & Normal Motion</Text>
          </TouchableOpacity> */}

          {/* Motiondetection component included */}
          <Motiondetection />

          <LocationSharingButton fetchAndShareLocation={fetchAndShareLocation} />

          <View style={styles.boxContainer}>
            <FeatureBox title="Emergency Contacts" icon="contacts" color="#ff6f61" navigation={navigation} targetScreen="EmergencyContacts" />
            <FeatureBox title="call" icon="phone-in-talk" color="#ff5722" navigation={navigation} targetScreen="Call" />
            <FeatureBox title="Camera Detection" icon="camera-alt" color="#4caf50" navigation={navigation} targetScreen="CameraDetection" />
            <FeatureBox title="Share Media" icon="perm-media" color="#2196f3" navigation={navigation} targetScreen="ShareLocation" />
            <FeatureBox title="Set Alert (SOS)" icon="warning" color="#ff9800" navigation={navigation} targetScreen="Alert" />
            <FeatureBox title="Record Audio" icon="mic" color="#673ab7" navigation={navigation} targetScreen="Record" />
            <FeatureBox title="Period Predictor" icon="calendar-today" color="#ff5722" navigation={navigation} targetScreen="Period" />
            <FeatureBox title="Nearby Hospitals" icon="local-hospital" color="#3f51b5" navigation={navigation} targetScreen="Hospitals" />
            <FeatureBox title="Nearby Police Stations" icon="security" color="#009688" navigation={navigation} targetScreen="Policestation" />
            <FeatureBox title="Route Selection" icon="directions" color="#9c27b0" navigation={navigation} targetScreen="Routeselector" />
            <FeatureBox title="Helpline" icon="phone-in-talk" color="#ff5722" navigation={navigation} targetScreen="Helpline" />
            <FeatureBox title="Whatsappstatus" icon="phone" color="#ff5982" navigation={navigation} targetScreen="Whatsappstatus" />

          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <TabIcon title="Home" icon="home" color="#ff9800" navigation={navigation} targetScreen="MainPage" />
          {/* <TabIcon title="Chatbot" icon="chat" color="#4caf50" navigation={navigation} targetScreen="Chatbot" /> */}
          <TabIcon title="Location" icon="location-on" color="#2196f3" action={openLiveLocation}/>
          <TabIcon title="Register" icon="app-registration" color="#673ab7" navigation={navigation} targetScreen="Registration" />
        </View>

        {isMapVisible && location && (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
           
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="You are here"
            />
          </MapView>
        )}
      </LinearGradient>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
          <TouchableOpacity style={styles.modalOption} onPress={() => {
              setModalVisible(false);
              Alert.alert('About Hershield', 
    'Hershield is a dedicated womenÅs safety app designed to empower women and enhance their personal security. Our mission is to provide tools and resources that ensure safety and support during emergencies. Key features of the app include:\n\n' +
    '1. **Emergency Contacts:** Quickly alert friends or family in times of distress.\n' +
    '2. **Live Location Sharing:** Share your location with trusted contacts to enhance your safety.\n' +
    '3. **SOS Alerts:** Instantly send distress signals to emergency services and contacts.\n' +
    '4. **Motion Detection:** Get notified of unusual movements around you for added security.\n' +
    '5. **Nearby Assistance:** Find nearby hospitals and police stations at your fingertips.\n\n' +
    'We believe that safety is a fundamental right, and with Hershield, you can feel more secure and confident in your daily life. Together, letcs create a safer environment for everyone.');
            }}>
              <Icon name="info" size={30} color="black" />
              <Text style={styles.modalText}>About</Text>
            </TouchableOpacity>
          

            <TouchableOpacity style={styles.modalOption} onPress={() => {
              setModalVisible(false);
              Alert.alert('App Guidelines', '1. Register your details for accurate location sharing.\n2. Add emergency contacts.\n3. Use the SOS feature in case of danger.\n4. Share your location with contacts in emergencies.');
            }}>
              <Icon name="rule" size={30} color="black" />
              <Text style={styles.modalText}>App Guidelines</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  menuIcon: {
    marginRight: 10,
    marginTop: 15,
  },
  boxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  box: {
    width: '45%', // Decreased width
    marginBottom: 20,
    padding: 15, // Decreased padding
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
  shareButtonRounded: {
    backgroundColor: '#2196f3',
    padding: 15,
    borderRadius: 100, // Make the button fully rounded
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'transparent',
  },
  tabIconContainer: {
    alignItems: 'center',
  },
  tabIconText: {
    marginTop: 5,
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  modalText: {
    fontSize: 18,
    marginLeft: 10,
  },
  closeButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#ff9800',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
  map: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default MainPage;
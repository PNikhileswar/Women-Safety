import React, { useEffect, useState } from 'react';
import { View, Text, Alert, StyleSheet, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { LinearGradient } from 'expo-linear-gradient'; // Importing LinearGradient
import { useFocusEffect } from '@react-navigation/native'; // Importing useFocusEffect

const Call = () => {
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null); // State for selected image or video
  const [currentContactIndex, setCurrentContactIndex] = useState(0); // State to track current contact index

  useEffect(() => {
    const fetchContactsAndLocation = async () => {
      // Load emergency contacts from AsyncStorage
      try {
        const storedContacts = await AsyncStorage.getItem('emergencyContacts');
        if (storedContacts !== null) {
          const contacts = JSON.parse(storedContacts);
          setEmergencyContacts(contacts);

          // Call the first contact immediately
          if (contacts.length > 0) {
            makeCall(contacts[currentContactIndex].phoneNumber); // Call the first contact
          }
        } else {
          Alert.alert('Error', 'No emergency contacts found.');
        }
      } catch (error) {
        console.log('Error loading contacts from storage:', error);
      }

      // Request location permissions and get current location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      try {
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      } catch (error) {
        setErrorMsg('Unable to get current location');
      }
    };

    fetchContactsAndLocation();
  }, []); // Fetch contacts and location only on mount

  // Function to make an immediate call to the selected emergency contact's number
  const makeCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  // Function to go to the next contact
  const goToNextContact = () => {
    if (emergencyContacts.length > 0) {
      setCurrentContactIndex((prevIndex) => (prevIndex + 1) % emergencyContacts.length);
    }
  };

  const pickMedia = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedMedia(result.assets[0]); // Set the selected media
    }
  };

  const takeMediaWithCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission to access camera is required!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedMedia(result.assets[0]); // Set the selected media
    }
  };

  const shareMedia = async () => {
    if (selectedMedia) {
      const message = `Incident Alert! Please come fast! An incident has occurred, and I have captured a media file for your reference.`;
      const phoneNumbers = emergencyContacts.map(contact => contact.phoneNumber).join(',');

      if (phoneNumbers) {
        // Use the Sharing API to share the media directly along with the message
        try {
          // First, share the media
          await Sharing.shareAsync(selectedMedia.uri, {
            dialogTitle: 'Share this media',
            UTI: selectedMedia.mediaType === 'video' ? 'public.video' : 'public.image',
          });

          // After sharing the media, send the SMS (if you want to send a message)
          Linking.openURL(`sms:${phoneNumbers}?body=${encodeURIComponent(message)}`);
        } catch (error) {
          Alert.alert('Error', 'Unable to share media. Please try again.');
        }
      } else {
        Alert.alert('Error', 'No emergency contact numbers available.');
      }
    } else {
      Alert.alert('Error', 'No media selected to share.');
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      // Check if there are emergency contacts available
      if (emergencyContacts.length > 0) {
        // Make a call to the current emergency contact when the component is focused
        makeCall(emergencyContacts[currentContactIndex].phoneNumber);
        
        // Call the next contact after a certain interval (e.g., 30 seconds)
        const interval = setInterval(() => {
          goToNextContact(); // Move to the next contact
          makeCall(emergencyContacts[(currentContactIndex + 1) % emergencyContacts.length].phoneNumber);
        }, 30000); // Change to your desired interval (e.g., 30000 for 30 seconds)

        // Clear the interval when the component is unfocused or unmounted
        return () => clearInterval(interval);
      }
    }, [currentContactIndex, emergencyContacts]) // Dependency on currentContactIndex and emergencyContacts
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <LinearGradient
        colors={['#FFEBEE', '#FFCDD2', '#E1F5FE', '#B3E5FC', '#B2EBF2']}
        style={styles.gradient} // Apply the gradient style
      >
        <View style={styles.container}>
          <Text style={styles.title}>Emergency Contacts</Text>
          {errorMsg ? (
            <Text style={styles.error}>{errorMsg}</Text>
          ) : (
            <Text style={styles.infoText}>Calling {emergencyContacts[currentContactIndex]?.name}...</Text>
          )}
          {/* Display emergency contacts */}
          {emergencyContacts.map((contact, index) => (
            <Text key={index} style={styles.contactText}>{contact.name}: {contact.phoneNumber}</Text>
          ))}
          {/* <TouchableOpacity style={styles.button} onPress={pickMedia}>
            <Text style={styles.buttonText}>Pick Media</Text>
          </TouchableOpacity> */}
          {/* <TouchableOpacity style={styles.button} onPress={takeMediaWithCamera}>
            <Text style={styles.buttonText}>Take Photo/Video</Text>
          </TouchableOpacity> */}
          <TouchableOpacity style={styles.button} onPress={goToNextContact}>
            <Text style={styles.buttonText}>Next Contact</Text>
          </TouchableOpacity>
          {selectedMedia && (
            <>
              {selectedMedia.mediaType === 'image' ? (
                <Image source={{ uri: selectedMedia.uri }} style={styles.image} />
              ) : (
                <Text style={styles.videoText}>Media Selected</Text>
              )}
              <TouchableOpacity style={styles.button} onPress={shareMedia}>
                <Text style={styles.buttonText}>Share Message and Media</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'transparent', // Make the container background transparent
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  error: {
    color: 'red',
  },
  infoText: {
    color: '#666',
    marginBottom: 20,
  },
  contactText: {
    fontSize: 16,
    marginVertical: 5,
  },
  button: {
    backgroundColor: '#ff4081',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 50,
    width: '80%',
    alignItems: 'center',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 300,
    marginVertical: 20,
    borderRadius: 10,
  },
  videoText: {
    fontSize: 18,
    marginVertical: 20,
    color: '#007AFF',
  },
});

export default Call;
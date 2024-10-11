import React, { useEffect, useState } from 'react';
import { View, Text, Alert, StyleSheet, Image, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';

const ShareLocation = () => {
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null); // State for selected image or video

  useEffect(() => {
    const fetchContactsAndLocation = async () => {
      // Load emergency contacts from AsyncStorage
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
  }, []);

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Share message & Media</Text>
      {errorMsg ? (
        <Text style={styles.error}>{errorMsg}</Text>
      ) : (
        <Text style={styles.infoText}>Share location first and then image.</Text>
      )}
      <TouchableOpacity style={styles.button} onPress={shareLocationViaSMS}>
        <Text style={styles.buttonText}>Share Location</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={pickMedia}>
        <Text style={styles.buttonText}>Pick Media</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={takeMediaWithCamera}>
        <Text style={styles.buttonText}>Take Photo/Video</Text>
      </TouchableOpacity>
      {selectedMedia && (
        <>
          {selectedMedia.mediaType === 'image' ? (
            <Image source={{ uri: selectedMedia.uri }} style={styles.image} />
          ) : (
            <Text style={styles.videoText}>media Selected</Text>
          )}
          <TouchableOpacity style={styles.button} onPress={shareMedia}>
            <Text style={styles.buttonText}>Share Message and media</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f7f9fc',
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
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
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
    color: '#007bff',
  },
});

export default ShareLocation;

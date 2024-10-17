import React, { useState, useEffect } from 'react';
import { View, Button, Alert, Dimensions, Modal, StyleSheet, TouchableOpacity, Text, TextInput } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import haversine from 'haversine-distance';
import * as SMS from 'expo-sms';
import * as TaskManager from 'expo-task-manager';
import axios from 'axios'; // Add axios for API calls

const LOCATION_TASK_NAME = 'location-tracking';

const RouteSelector = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [startLocation, setStartLocation] = useState(null);
  const [endLocation, setEndLocation] = useState(null);
  const [route, setRoute] = useState([]);
  const [tracking, setTracking] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]); // State to hold search results

  useEffect(() => {
    const getPermissionsAndLoadData = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location permission denied');
        return;
      }

      const savedRoute = await AsyncStorage.getItem('savedRoute');
      const savedTracking = await AsyncStorage.getItem('tracking');

      if (savedRoute) {
        const routeData = JSON.parse(savedRoute);
        setStartLocation(routeData.startLocation);
        setEndLocation(routeData.endLocation);
        setRoute(routeData.route);
      }

      if (savedTracking === 'true') {
        setTracking(true);
        await startTracking();
      }

      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      await Notifications.requestPermissionsAsync();
    };
    getPermissionsAndLoadData();
  }, []);

  useEffect(() => {
    if (tracking && currentLocation && route.length > 0) {
      checkDeviationFromRoute(currentLocation);
    }
  }, [currentLocation, tracking]);

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    if (isEditing) {
      if (!startLocation) {
        setStartLocation({ latitude, longitude });
        setRoute([{ latitude, longitude }]);
      } else if (!endLocation) {
        setEndLocation({ latitude, longitude });
        setRoute([...route, { latitude, longitude }]);
      }
    }
  };

  // Fetch places from Twilio API
  const fetchPlaces = async (query) => {
    try {
      const response = await axios.get(`YOUR_TWILIO_API_ENDPOINT?query=${query}`, {
        headers: {
          'Authorization': `Basic ${btoa('AC1e8bbb02379e0cfcdd564da8023d9a02:51fc3df3a73f48ac560b4c7e2ea0ac82')}`, // Encode SID and Auth Token
        },
      });
      // Assuming the response contains an array of place objects
      setSearchResults(response.data.places); // Adjust based on the actual response structure
    } catch (error) {
      console.error("Error fetching places:", error);
      Alert.alert('Error fetching places');
    }
  };

  // Search for a place
  const handleSearch = () => {
    if (searchInput.trim()) {
      fetchPlaces(searchInput.trim());
    } else {
      Alert.alert('Please enter a place name.');
    }
  };

  // Select a place from search results
  const selectPlace = (place) => {
    setCurrentLocation({
      latitude: place.latitude, // Adjust according to your place object
      longitude: place.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
    setSearchInput(""); // Clear the search input
    setSearchResults([]); // Clear search results
  };

  const saveRoute = async () => {
    if (startLocation && endLocation) {
      const routeData = {
        startLocation,
        endLocation,
        route: [...route],
      };
      await AsyncStorage.setItem('savedRoute', JSON.stringify(routeData));
      Alert.alert('Route saved!');
      setIsEditing(false);
    } else {
      Alert.alert('Please select both start and end points');
    }
  };

  const startTracking = async () => {
    const { status } = await Location.requestBackgroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Background location permission denied');
      return;
    }

    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      timeInterval: 10000,
      distanceInterval: 10,
    });

    await AsyncStorage.setItem('tracking', 'true');
    setTracking(true);
  };

  const stopTracking = async () => {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    await AsyncStorage.setItem('tracking', 'false');
    setTracking(false);
  };

  const checkDeviationFromRoute = (currentLocation) => {
    let deviated = true;

    route.forEach((point) => {
      const distance = haversine(currentLocation, point);
      if (distance <= 50) { // Change the deviation threshold to 50 meters
        deviated = false;
      }
    });

    if (deviated) {
      sendSMS();  
      sendNotification();  
    }
  };

  const sendSMS = async () => {
    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      await SMS.sendSMSAsync(['9381017897'], 'I have deviated from the route');
    } else {
      Alert.alert('SMS is not available on this device');
    }
  };

  const sendNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Route Deviation Alert',
        body: 'You have deviated from your route!',
      },
      trigger: null,
    });
  };

  const editRoute = () => {
    setIsEditing(true);
    setStartLocation(null);  
    setEndLocation(null);    
    setRoute([]);            
  };

  return (
    <View style={styles.container}>
      {currentLocation && (
        <MapView
          style={styles.map}
          region={currentLocation}
          onPress={handleMapPress}
          showsUserLocation
          loadingEnabled
        >
          {startLocation && <Marker coordinate={startLocation} title="Start" />}
          {endLocation && <Marker coordinate={endLocation} title="End" />}
          {route.length > 1 && <Polyline coordinates={route} strokeColor="blue" strokeWidth={4} />}
        </MapView>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a place"
          value={searchInput}
          onChangeText={setSearchInput}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Display search results */}
      {searchResults.length > 0 && (
        <View style={styles.resultsContainer}>
          {searchResults.map((place, index) => (
            <TouchableOpacity key={index} onPress={() => selectPlace(place)}>
              <Text style={styles.resultText}>{place.name}</Text> {/* Adjust based on your place object structure */}
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Button title="Save Route" onPress={saveRoute} />
        {!tracking ? (
          <Button title="Start Tracking" onPress={startTracking} />
        ) : (
          <Button title="Stop Tracking" onPress={stopTracking} />
        )}
        {startLocation && endLocation && !isEditing && (
          <Button title="Edit Route" onPress={editRoute} />
        )}
        {isEditing && (
          <Button title="Done Editing" onPress={() => setIsEditing(false)} />
        )}
      </View>
    </View>
  );
};

// Styling for UI
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  searchContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 5,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
  },
  searchButton: {
    padding: 10,
    backgroundColor: 'blue',
    borderRadius: 5,
  },
  searchButtonText: {
    color: 'white',
  },
  resultsContainer: {
    position: 'absolute',
    top: 90,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 5,
    elevation: 5,
    maxHeight: 200,
  },
  resultText: {
    padding: 10,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default RouteSelector;


TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error(error);
    return;
  }
  if (data) { 
    const { locations } = data;
    const currentLocation = locations[0].coords;
    
    // Perform route deviation check in background
    let savedRoute = await AsyncStorage.getItem('savedRoute');
    if (savedRoute) {
      savedRoute = JSON.parse(savedRoute);
      const route = savedRoute.route;

      let deviated = true;
      route.forEach((point) => {
        const distance = haversine(currentLocation, point);
        if (distance <= 50) { 
          deviated = false;
        }
      });

      if (deviated) {
        // Send SMS and Notification in background
        const isAvailable = await SMS.isAvailableAsync();
        if (isAvailable) {
          await SMS.sendSMSAsync(['1234567890'], 'I have deviated from the route');
        }
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Route Deviation Alert',
            body: 'You have deviated from your route!',
          },
          trigger: null,
        });
      }
    }
  }
}); 
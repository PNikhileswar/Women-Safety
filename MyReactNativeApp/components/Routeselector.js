

import React, { useState, useEffect, useRef } from 'react';
import { View, Button, Alert, StyleSheet, TouchableOpacity, Text, TextInput, ScrollView } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import axios from 'axios';
import haversine from 'haversine';

const LOCATION_TASK_NAME = 'background-location-task';
const DEVIATION_THRESHOLD = 50;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function Component() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [startLocation, setStartLocation] = useState(null);
  const [endLocation, setEndLocation] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const searchTimeoutRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const setupLocationAndNotifications = async () => {
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        Alert.alert('Location permission denied');
        return;
      }

      const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
      if (notificationStatus !== 'granted') {
        Alert.alert('Notification permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const initialRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      setCurrentLocation(initialRegion);
      setStartLocation(initialRegion);
    };

    setupLocationAndNotifications();
  }, []);

  useEffect(() => {
    if (searchInput.trim().length > 0) {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(() => {
        fetchPlaces(searchInput.trim());
      }, 300);
    } else {
      setSearchResults([]);
    }
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchInput]);

  const fetchPlaces = async (query) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=5`,
        {
          headers: {
            'User-Agent': 'YourAppName/1.0', // Replace with your app name and version
          }
        }
      );
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error fetching places:", error);
      Alert.alert('Error fetching places', 'Please try again later.');
    }
  };

  const selectPlace = (place) => {
    const newLocation = {
      latitude: parseFloat(place.lat),
      longitude: parseFloat(place.lon),
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };

    setEndLocation(newLocation);
    fetchRoutes(startLocation, newLocation);
    setSearchInput("");
    setSearchResults([]);

    if (mapRef.current && startLocation) {
      mapRef.current.fitToCoordinates([startLocation, newLocation], {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  };

  const fetchRoutes = async (start, end) => {
    try {
      const response = await axios.get(`http://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson&alternatives=true`);
      if (response.data.routes && response.data.routes.length > 0) {
        const fetchedRoutes = response.data.routes.map(route => ({
          points: route.geometry.coordinates.map(([longitude, latitude]) => ({ latitude, longitude })),
          duration: route.duration,
          distance: route.distance,
        }));
        setRoutes(fetchedRoutes);
        setSelectedRoute(0);
      } else {
        Alert.alert('No routes found');
      }
    } catch (error) {
      console.error("Error fetching routes:", error);
      Alert.alert('Error fetching routes');
    }
  };

  const renderRoutes = () => {
    return routes.map((route, index) => (
      <Polyline
        key={index}
        coordinates={route.points}
        strokeColor={selectedRoute === index ? 'red' : `hsl(${index * 60}, 100%, 50%)`}
        strokeWidth={selectedRoute === index ? 6 : 4}
        tappable
        onPress={() => setSelectedRoute(index)}
      />
    ));
  };

  const startTracking = async () => {
    if (selectedRoute === null) {
      Alert.alert('Please select a route first');
      return;
    }

    const { status } = await Location.requestBackgroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Background location permission denied');
      return;
    }

    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 10000,
      distanceInterval: 10,
      foregroundService: {
        notificationTitle: 'Route Tracking',
        notificationBody: 'Tracking your route in the background',
      },
    });

    setIsTracking(true);
  };

  const stopTracking = async () => {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    setIsTracking(false);
  };

  TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
    if (error) {
      console.error(error);
      return;
    }
    if (data) {
      const { locations } = data;
      const currentLocation = locations[0].coords;

      if (selectedRoute !== null && routes[selectedRoute] && routes[selectedRoute].points) {
        const closestPointOnRoute = findClosestPointOnRoute(currentLocation, routes[selectedRoute].points);
        const distanceFromRoute = haversine(currentLocation, closestPointOnRoute);

        if (distanceFromRoute > DEVIATION_THRESHOLD) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Route Deviation Alert',
              body: 'You have deviated from your selected route by more than 50 meters!',
            },
            trigger: null,
          });
        }
      }
    }
  });

  const findClosestPointOnRoute = (currentLocation, routePoints) => {
    let closestPoint = routePoints[0];
    let minDistance = haversine(currentLocation, routePoints[0]);

    for (let i = 1; i < routePoints.length; i++) {
      const distance = haversine(currentLocation, routePoints[i]);
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = routePoints[i];
      }
    }

    return closestPoint;
  };

  return (
    <View style={styles.container}>
      {currentLocation && (
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={currentLocation}
          showsUserLocation
        >
          {startLocation && (
            <Marker coordinate={startLocation} pinColor="green">
              <View style={styles.markerContainer}>
                <Text style={styles.markerText}>Start</Text>
              </View>
            </Marker>
          )}
          {endLocation && (
            <Marker coordinate={endLocation} pinColor="red">
              <View style={styles.markerContainer}>
                <Text style={styles.markerText}>End</Text>
              </View>
            </Marker>
          )}
          {renderRoutes()}
        </MapView>
      )}

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a destination"
          value={searchInput}
          onChangeText={setSearchInput}
        />
      </View>

      {searchResults.length > 0 && (
        <ScrollView style={styles.resultsContainer}>
          {searchResults.map((place, index) => (
            <TouchableOpacity key={index} onPress={() => selectPlace(place)}>
              <Text style={styles.resultText}>
                {place.display_name || "Unknown Place"}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={styles.buttonContainer}>
        <Button
          title="Reset"
          onPress={() => {
            setEndLocation(null);
            setRoutes([]);
            setSelectedRoute(null);
            stopTracking();
            if (mapRef.current && startLocation) {
              mapRef.current.animateToRegion(startLocation, 1000);
            }
          }}
        />
        {selectedRoute !== null && (
          <Button
            title={isTracking ? "Stop Ride" : "Start Ride"}
            onPress={isTracking ? stopTracking : startTracking}
          />
        )}
      </View>
    </View>
  );
}

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
    backgroundColor: 'white',
    borderRadius: 5,
    elevation: 5,
  },
  searchInput: {
    height: 40,
    paddingHorizontal: 10,
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
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  markerContainer: {
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 5,
    borderColor: 'black',
    borderWidth: 1,
  },
  markerText: {
    fontWeight: 'bold',
  },
});

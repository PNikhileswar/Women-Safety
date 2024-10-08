// components/MapScreen.js
import React, { useEffect, useState } from 'react';
import { View, Button, Alert, StyleSheet } from 'react-native'; // Importing Button here
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const MapScreen = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      getCurrentLocation();
    };

    requestPermissions();
  }, []);

  const getCurrentLocation = async () => {
    try {
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    } catch (error) {
      setErrorMsg('Unable to get current location');
    }
  };

  // Show alert if there is an error
  useEffect(() => {
    if (errorMsg) {
      Alert.alert('Error', errorMsg);
    }
  }, [errorMsg]);

  return (
    <View style={styles.container}>
      {location ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="You are here"
            description="Your current location"
          />
        </MapView>
      ) : (
        <View style={styles.loadingContainer}>
          <Button title="Get Current Location" onPress={getCurrentLocation} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MapScreen;

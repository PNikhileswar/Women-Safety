import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert, TouchableOpacity, Linking, ScrollView, Dimensions, TextInput, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const TOMTOM_API_KEY = 'Ef53CTgxRVmqpfickZ0r8CiKzpjuzTqU'; // Your updated API key

const PoliceStations = () => {
  const [location, setLocation] = useState(null);
  const [policeStations, setPoliceStations] = useState([]);
  const [radius, setRadius] = useState(5000); // Default radius is set to 5000 meters

  useEffect(() => {
    const fetchLocationAndPoliceStations = async () => {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }

      // Get the user's current location
      const userLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });

      // Fetch nearby police stations
      fetchPoliceStations(userLocation.coords.latitude, userLocation.coords.longitude);
    };

    fetchLocationAndPoliceStations();
  }, []);

  const fetchPoliceStations = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.tomtom.com/search/2/nearbySearch/.json?key=${TOMTOM_API_KEY}&lat=${latitude}&lon=${longitude}&radius=${radius}&categorySet=7322` // Ensure this category code is correct for police stations
      );
      const data = await response.json();

      if (response.ok && data.results) {
        setPoliceStations(data.results);
      } else {
        Alert.alert('Error fetching police stations');
      }
    } catch (error) {
      Alert.alert('Failed to fetch police stations:', error.message);
    }
  };

  const openPoliceStationPage = (station) => {
    const query = encodeURIComponent(station.poi.name + ' ' + station.address.freeformAddress);
    Linking.openURL(`https://www.google.com/search?q=${query}`); // Open Google search for the police station
  };

  const handleCall = (phoneNumber) => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`); // Initiates a call to the police station's phone number
    } else {
      Alert.alert('No phone number available to make a call.'); // Alert when no phone number is present
    }
  };

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {location ? (
          <MapView
            style={{ width: Dimensions.get('window').width, height: 300 }} // Fixed height for the map
            initialRegion={location}
            showsUserLocation={true}
          >
            {policeStations.map((station) => (
              <Marker
                key={station.id}
                coordinate={{
                  latitude: station.position.lat,
                  longitude: station.position.lon,
                }}
                title={station.poi.name}
                description={station.address.freeformAddress}
              />
            ))}
          </MapView>
        ) : (
          <Text>Loading map...</Text>
        )}

        <View style={{ padding: 10 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Nearby Police Stations</Text>

          {/* Input for the radius */}
          <TextInput
            style={{ borderWidth: 1, borderColor: '#ccc', marginBottom: 10, padding: 5 }}
            placeholder="Enter radius in meters"
            keyboardType="numeric"
            value={radius.toString()}
            onChangeText={(text) => setRadius(Number(text))}
          />
          <Button title="Search Police Stations" onPress={() => location && fetchPoliceStations(location.latitude, location.longitude)} />

          {policeStations.length > 0 ? (
            <FlatList
              data={policeStations}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.poi.name}</Text>
                  <Text>{item.address.freeformAddress}</Text>

                  {/* Display the phone number if available */}
                  {item.poi.phone ? (
                    <Text style={{ fontSize: 14, marginVertical: 5 }}>Phone: {item.poi.phone}</Text>
                  ) : (
                    <Text style={{ fontSize: 14, marginVertical: 5, color: 'red' }}>No phone number available</Text>
                  )}

                  {/* Button to call the police station */}
                  <TouchableOpacity onPress={() => handleCall(item.poi.phone)}>
                    <Text style={{ color: 'blue', marginTop: 10 }}>Call Police Station</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={() => openPoliceStationPage(item)}>
                    <Text style={{ color: 'blue' }}>Open for more info</Text>
                  </TouchableOpacity>
                </View>
              )}
              scrollEnabled={false} // Disable FlatList scrolling since we want the whole screen to scroll
            />
          ) : (
            <Text>Loading police stations...</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default PoliceStations;

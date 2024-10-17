import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert, TouchableOpacity, Linking, ScrollView, Dimensions, TextInput, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const TOMTOM_API_KEY = 'Ef53CTgxRVmqpfickZ0r8CiKzpjuzTqU'; // Your updated API key

const Hospitals = () => {
  const [location, setLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [radius, setRadius] = useState(5000); // Default radius is set to 5000 meters

  useEffect(() => {
    const fetchLocationAndHospitals = async () => {
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

      // Fetch nearby hospitals
      fetchHospitals(userLocation.coords.latitude, userLocation.coords.longitude);
    };

    fetchLocationAndHospitals();
  }, []);

  const fetchHospitals = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.tomtom.com/search/2/nearbySearch/.json?key=${TOMTOM_API_KEY}&lat=${latitude}&lon=${longitude}&radius=${radius}&categorySet=7321`
      );
      const data = await response.json();

      if (response.ok && data.results) {
        setHospitals(data.results);
      } else {
        Alert.alert('Error fetching hospitals');
      }
    } catch (error) {
      Alert.alert('Failed to fetch hospitals:', error.message);
    }
  };

  const openHospitalPage = (hospital) => {
    const query = encodeURIComponent(hospital.poi.name + ' ' + hospital.address.freeformAddress);
    Linking.openURL(`https://www.google.com/search?q=${query}`); // Open Google search for the hospital
  };

  const sendSms = (phoneNumber) => {
    if (phoneNumber) {
      Linking.openURL(`sms:${phoneNumber}`); // Initiates SMS to the hospital's phone number
    } else {
      Alert.alert('No phone number available to send SMS.');
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
            {hospitals.map((hospital) => (
              <Marker
                key={hospital.id}
                coordinate={{
                  latitude: hospital.position.lat,
                  longitude: hospital.position.lon,
                }}
                title={hospital.poi.name}
                description={hospital.address.freeformAddress}
              />
            ))}
          </MapView>
        ) : (
          <Text>Loading map...</Text>
        )}

        <View style={{ padding: 10 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Nearby Hospitals</Text>

          {/* Input for the radius */}
          <TextInput
            style={{ borderWidth: 1, borderColor: '#ccc', marginBottom: 10, padding: 5 }}
            placeholder="Enter radius in meters"
            keyboardType="numeric"
            value={radius.toString()}
            onChangeText={(text) => setRadius(Number(text))}
          />
          <Button title="Search Hospitals" onPress={() => location && fetchHospitals(location.latitude, location.longitude)} />

          {hospitals.length > 0 ? (
            <FlatList
              data={hospitals}
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

                  <TouchableOpacity onPress={() => openHospitalPage(item)}>
                    <Text style={{ color: 'blue' }}>Open for more info & appoitments</Text>
                  </TouchableOpacity>
                  <View style={{ flexDirection: 'row', marginTop: 10 }}>
                    <Button title="Chat" onPress={() => sendSms(item.poi.phone)} />
                  </View>
                </View>
              )}
              scrollEnabled={false} // Disable FlatList scrolling since we want the whole screen to scroll
            />
          ) : (
            <Text>Loading hospitals...</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default Hospitals; 
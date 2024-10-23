
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert, TouchableOpacity, Linking, ScrollView, Dimensions, TextInput, StyleSheet, SafeAreaView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';

const TOMTOM_API_KEY = 'Ef53CTgxRVmqpfickZ0r8CiKzpjuzTqU'; // Your updated API key

const PoliceStations = () => {
  const [location, setLocation] = useState(null);
  const [policeStations, setPoliceStations] = useState([]);
  const [radius, setRadius] = useState(5000); // Default radius is set to 5000 meters

  useEffect(() => {
    const fetchLocationAndPoliceStations = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }
      const userLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });

      fetchPoliceStations(userLocation.coords.latitude, userLocation.coords.longitude);
    };

    fetchLocationAndPoliceStations();
  }, []);

  const fetchPoliceStations = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.tomtom.com/search/2/nearbySearch/.json?key=${TOMTOM_API_KEY}&lat=${latitude}&lon=${longitude}&radius=${radius}&categorySet=7322`
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
    Linking.openURL(`https://www.google.com/search?q=${query}`);
  };

  const handleCall = (phoneNumber) => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    } else {
      Alert.alert('No phone number available to make a call.');
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <LinearGradient
        colors={['#FFEBEE', '#FFCDD2', '#E1F5FE', '#B3E5FC', '#B2EBF2']}
        style={styles.gradient}
      >
        <ScrollView style={{ flex: 1 }}>
          <View style={styles.container}>
            {location ? (
              <MapView
                style={styles.map}
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
              <Text style={styles.loadingText}>Loading map...</Text>
            )}

            <View style={styles.infoContainer}>
              <Text style={styles.header}>Nearby Police Stations</Text>

              <TextInput
                style={styles.input}
                placeholder="Enter radius in meters"
                keyboardType="numeric"
                value={radius.toString()}
                onChangeText={(text) => setRadius(Number(text))}
              />
              <TouchableOpacity style={styles.searchButton} onPress={() => location && fetchPoliceStations(location.latitude, location.longitude)}>
                <Text style={styles.buttonText}>Search Police Stations</Text>
              </TouchableOpacity>

              {policeStations.length > 0 ? (
                <FlatList
                  data={policeStations}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={styles.stationCard}>
                      <Text style={styles.stationName}>{item.poi.name}</Text>
                      <Text style={styles.stationAddress}>{item.address.freeformAddress}</Text>

                      {item.poi.phone ? (
                        <Text style={styles.stationPhone}>Phone: {item.poi.phone}</Text>
                      ) : (
                        <Text style={styles.noPhone}>No phone number available</Text>
                      )}

                      <TouchableOpacity style={styles.callButton} onPress={() => handleCall(item.poi.phone)}>
                        <Text style={styles.buttonText}>Call Police Station</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.infoButton} onPress={() => openPoliceStationPage(item)}>
                        <Text style={styles.buttonText}>Open for more info</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  scrollEnabled={false}
                />
              ) : (
                <Text style={styles.noDataText}>No police stations found within the specified radius.</Text>
              )}
            </View>
          </View>
        </ScrollView>
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
  },
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: 'transparent',
  },
  map: {
    width: Dimensions.get('window').width,
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
  },
  infoContainer: {
    padding: 10,
    backgroundColor: '#FFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#F9F9F9',
  },
  stationCard: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  stationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0288D1',
  },
  stationAddress: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  stationPhone: {
    fontSize: 14,
    color: '#555',
  },
  noPhone: {
    fontSize: 14,
    color: '#D32F2F',
  },
  searchButton: {
    backgroundColor: '#FF4081', // Unique color for search button
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 5,
  },
  callButton: {
    backgroundColor: '#0288D1', // Color for call button
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 5,
  },
  infoButton: {
    backgroundColor: '#D32F2F', // Color for info button
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#D32F2F',
  },
});

export default PoliceStations;

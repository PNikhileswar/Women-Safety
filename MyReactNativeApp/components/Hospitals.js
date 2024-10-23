
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert, TouchableOpacity, Linking, ScrollView, Dimensions, TextInput, StyleSheet, SafeAreaView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient

const TOMTOM_API_KEY = 'Ef53CTgxRVmqpfickZ0r8CiKzpjuzTqU'; // Your updated API key

const Hospitals = () => {
  const [location, setLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [radius, setRadius] = useState(5000); // Default radius is set to 5000 meters
  const [noHospitalsFound, setNoHospitalsFound] = useState(false); // New state for no hospitals message

  useEffect(() => {
    const fetchLocationAndHospitals = async () => {
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
        setNoHospitalsFound(data.results.length === 0); // Set the noHospitalsFound state
      } else {
        Alert.alert('Error fetching hospitals');
      }
    } catch (error) {
      Alert.alert('Failed to fetch hospitals:', error.message);
    }
  };

  const openHospitalPage = (hospital) => {
    const query = encodeURIComponent(hospital.poi.name + ' ' + hospital.address.freeformAddress);
    Linking.openURL(`https://www.google.com/search?q=${query}`);
  };

  const sendSms = (phoneNumber) => {
    if (phoneNumber) {
      Linking.openURL(`sms:${phoneNumber}`);
    } else {
      Alert.alert('No phone number available to send SMS.');
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
              <Text style={styles.loadingText}>Loading map...</Text>
            )}

            <View style={styles.infoContainer}>
              <Text style={styles.header}>Nearby Hospitals</Text>

              <TextInput
                style={styles.input}
                placeholder="Enter radius in meters"
                keyboardType="numeric"
                value={radius.toString()}
                onChangeText={(text) => setRadius(Number(text))}
              />
              <TouchableOpacity style={styles.searchButton} onPress={() => location && fetchHospitals(location.latitude, location.longitude)}>
                <Text style={styles.searchButtonText}>Search Hospitals</Text>
              </TouchableOpacity>

              {noHospitalsFound ? (
                <Text style={styles.noHospitalsText}>No hospitals found within the radius.</Text>
              ) : hospitals.length > 0 ? (
                <FlatList
                  data={hospitals}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={styles.hospitalCard}>
                      <Text style={styles.hospitalName}>{item.poi.name}</Text>
                      <Text style={styles.hospitalAddress}>{item.address.freeformAddress}</Text>

                      {item.poi.phone ? (
                        <Text style={styles.hospitalPhone}>Phone: {item.poi.phone}</Text>
                      ) : (
                        <Text style={styles.noPhone}>No phone number available</Text>
                      )}

                      <TouchableOpacity onPress={() => openHospitalPage(item)}>
                        <Text style={styles.linkText}>Open for more info & appointments</Text>
                      </TouchableOpacity>

                      <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.chatButton} onPress={() => sendSms(item.poi.phone)}>
                          <Text style={styles.chatButtonText}>Chat</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                  scrollEnabled={false}
                />
              ) : (
                <Text style={styles.loadingText}>Loading hospitals...</Text>
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
    backgroundColor: '#FAFAFA',
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
  noHospitalsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#D32F2F',
    marginTop: 20,
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
  searchButton: {
    backgroundColor: '#FF4081', // Distinct color for search button
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  searchButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hospitalCard: {
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
  hospitalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0288D1',
  },
  hospitalAddress: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  hospitalPhone: {
    fontSize: 14,
    color: '#555',
  },
  noPhone: {
    fontSize: 14,
    color: '#D32F2F',
  },
  linkText: {
    fontSize: 14,
    color: '#0288D1',
    textDecorationLine: 'underline',
    marginVertical: 5,
  },
  buttonContainer: {
    marginTop: 10,
  },
  chatButton: {
    backgroundColor: '#0288D1', // Distinct color for chat button
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  chatButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Hospitals;
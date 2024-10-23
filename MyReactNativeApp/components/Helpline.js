
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, Linking, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons'; // Ensure to install this package for icons

const Helpline = () => {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [city, setCity] = useState('');
  
  const TOMTOM_API_KEY = 'Ef53CTgxRVmqpfickZ0r8CiKzpjuzTqU';

  const getUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      fetchLocationDetails(latitude, longitude);
    } catch (error) {
      console.error('Error getting location:', error);
      setErrorMsg('Error getting location');
      setLoading(false);
    }
  };

  const fetchLocationDetails = async (latitude, longitude) => {
    try {
      const response = await axios.get(`https://api.tomtom.com/search/2/reverseGeocode/${latitude},${longitude}.json?key=${TOMTOM_API_KEY}`);
      const address = response.data.addresses[0]?.address;
      const fetchedCity = address?.municipality || address?.countrySubdivision;

      setCity(fetchedCity || '');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching location details:', error);
      setErrorMsg('Error fetching location details');
      setLoading(false);
    }
  };

  const helplines = [
    { name: 'Police', number: '100' },
    { name: 'Fire', number: '101' },
    { name: 'Ambulance', number: '102' },
    // ... other helplines
  ];

  const handleCallHelpline = (number) => {
    Linking.openURL(`tel:${number}`);
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Helpline Numbers</Text>
      {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
      {city ? <Text style={styles.city}>City: {city}</Text> : null}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {helplines.length > 0 ? (
          helplines.map((helpline, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.infoContainer}>
                <Text style={styles.helplineName}>{helpline.name}</Text>
                <Text style={styles.helplineNumber}>{helpline.number}</Text>
              </View>
              <TouchableOpacity style={styles.callButton} onPress={() => handleCallHelpline(helpline.number)}>
                <Ionicons name="call" size={24} color="white" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text>No helplines found</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#eaeaea',
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333',
  },
  city: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#555',
  },
  scrollView: {
    marginBottom: 20,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  infoContainer: {
    flex: 1,
  },
  helplineName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  helplineNumber: {
    fontSize: 16,
    color: '#777',
  },
  callButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default Helpline;

// components/MainPage.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const MainPage = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Women Safety App</Text>

      {/* Navigate to Emergency Contacts */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('EmergencyContacts')}
      >
        <Text style={styles.buttonText}>Emergency Contacts</Text>
      </TouchableOpacity>

      {/* Navigate to Helpline Numbers */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('HelplineNumbers')}
      >
        <Text style={styles.buttonText}>Helpline Numbers</Text>
      </TouchableOpacity>

      {/* Navigate to Camera Detection */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('CameraDetection')}
      >
        <Text style={styles.buttonText}>Camera Detection</Text>
      </TouchableOpacity>

      {/* Navigate to Share Location */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ShareLocation')}
      >
        <Text style={styles.buttonText}>Share Location</Text>
      </TouchableOpacity>

      {/* Navigate to Map */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Map')}
      >
        <Text style={styles.buttonText}>View Current Location on Map</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    marginVertical: 15,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MainPage;
  
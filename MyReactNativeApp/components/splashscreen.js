import React, { useEffect } from 'react';
import { View, Image, StyleSheet, ActivityIndicator, Text } from 'react-native';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('MainPage'); // Navigate to the MainPage after 10 seconds
    }, 1000); // 10000 ms = 10 seconds

    return () => clearTimeout(timer); // Cleanup the timer on component unmount
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Ensure this is an image source, no text strings directly inside Image */}
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      
      {/* Text for the Women Safety App */}
      <Text style={styles.text}>Women Safety App</Text>

      {/* Activity Indicator for Loading */}
      <ActivityIndicator size="large" color="#0000ff" style={styles.spinner} />
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
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    color: '#000',
    marginBottom: 20,
  },
  spinner: {
    marginTop: 20,
  },
});

export default SplashScreen;

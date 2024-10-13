// CameraDetection.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert, TextInput } from 'react-native';
import { Magnetometer } from 'expo-sensors';
import Svg, { Circle, Line } from 'react-native-svg';
import axios from 'axios'; // Import axios to make HTTP requests

const CameraDetection = () => {
  const [magnetometerData, setMagnetometerData] = useState(null);
  const [isCameraDetected, setIsCameraDetected] = useState(false);
  const [userText, setUserText] = useState(''); // For user input text for sentiment analysis
  const [sentimentResult, setSentimentResult] = useState(null); // To store the sentiment result

  // Magnetic field detection useEffect
  useEffect(() => {
    const subscription = Magnetometer.addListener(data => {
      setMagnetometerData(data);
      checkForCamera(data);
    });

    Magnetometer.setUpdateInterval(1000); // Set the update interval

    return () => {
      subscription.remove();
    };
  }, []);

  // Magnetic field detection logic
  const checkForCamera = (data) => {
    const fieldStrength = getMagneticFieldStrength(data);
    if (fieldStrength > 50) { // Set an appropriate threshold for camera detection
      setIsCameraDetected(true);
      Alert.alert("Camera Detected", "A camera has been detected in your vicinity!");
    } else {
      setIsCameraDetected(false);
    }
  };

  const getMagneticFieldStrength = (data) => {
    if (!data) return 0;
    return Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
  };

  // Function to handle sentiment analysis
  const analyzeSentiment = async () => {
    try {
      const response = await axios.post('http://192.168.189.222:5000/analyze', { // Replace with actual server IP
        text: userText,
      });
      setSentimentResult(response.data); // Store the result
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      Alert.alert('Error', 'Failed to analyze sentiment.');
    }
  };

  // Function for the meter visual representation
  const renderMeter = (value) => {
    const radius = 100; // Radius of the meter
    const center = 120; // Center of the circle
    const startAngle = 0.5 * Math.PI; // Start angle for the needle
    const endAngle = 2.5 * Math.PI; // End angle for the needle
    const totalRange = 100; // Total range for magnetic field strength

    // Calculate the angle for the needle based on the value
    const angle = startAngle + (value / totalRange) * (endAngle - startAngle);
    const needleLength = radius * 0.8; // Length of the needle

    // Calculate the position of the needle's end point
    const needleX = center + needleLength * Math.cos(angle);
    const needleY = center - needleLength * Math.sin(angle);

    // Determine color based on value
    const color = value < 40 ? 'green' : value < 80 ? 'yellow' : 'red';

    return (
      <View style={{ alignItems: 'center', marginVertical: 20 }}>
        <Svg height="240" width="240">
          {/* Background Circle */}
          <Circle cx={center} cy={center} r={radius} fill="#e0e0e0" />

          {/* Needle */}
          <Line
            x1={center}
            y1={center}
            x2={needleX}
            y2={needleY}
            stroke={color}
            strokeWidth={4}
          />
        </Svg>
        <Text style={{ fontSize: 24, color }}>{`${value.toFixed(2)} µT`}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Hidden Camera Detector</Text>

      {/* Magnetic Field Detection */}
      <Text style={styles.subHeader}>
        {isCameraDetected ? "Camera Detected!" : "No Camera Detected."}
      </Text>
      {renderMeter(getMagneticFieldStrength(magnetometerData))}

      {/* Sentiment Analysis Section */}
      {/* <View style={styles.sentimentContainer}>
        <Text style={styles.subHeader}>Sentiment Analysis</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter text for sentiment analysis"
          value={userText}
          onChangeText={setUserText}
        />
        <Button title="Analyze Sentiment" onPress={analyzeSentiment} />
        {sentimentResult && (
          <Text style={styles.result}>
            Sentiment: {sentimentResult.sentiment}, Score: {sentimentResult.score.toFixed(2)}
          </Text>
        )}
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1c1c1c', // Dark background for better contrast
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  subHeader: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 20,
  },
  sentimentContainer: {
    marginTop: 30,
    width: '100%',
    padding: 20,
    backgroundColor: '#333',
    borderRadius: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    color: '#fff',
    padding: 10,
    backgroundColor: '#555',
  },
  result: {
    marginTop: 10,
    color: '#fff',
  },
});

export default CameraDetection;

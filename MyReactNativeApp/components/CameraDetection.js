
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { Magnetometer } from 'expo-sensors';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

export default function CameraDetection() {
  const [magnetometerData, setMagnetometerData] = useState(null);
  const [isCameraDetected, setIsCameraDetected] = useState(false);

  useEffect(() => {
    const subscription = Magnetometer.addListener(data => {
      setMagnetometerData(data);
      checkForCamera(data);
    });

    Magnetometer.setUpdateInterval(1000);

    return () => {
      subscription.remove();
    };
  }, []);

  const checkForCamera = (data) => {
    const fieldStrength = getMagneticFieldStrength(data);
    if (fieldStrength > 50) {
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

  const renderMeter = (value) => {
    const radius = 100; // Radius for the circular meter
    const center = 120; // Center coordinates for the circle (x and y)
    const totalRange = 100; // Total range for the meter
    const fullCircle = 2 * Math.PI; // 360 degrees in radians

    // Calculate the angle for the needle (value determines needle's position)
    const angle = (value / totalRange) * fullCircle;
    const needleLength = radius * 0.8; // Needle length to 80% of the radius

    // Calculate the x and y coordinates for the needle tip
    const needleX = center + needleLength * Math.cos(angle - Math.PI / 2); // Adjust to start from top
    const needleY = center + needleLength * Math.sin(angle - Math.PI / 2); // Adjust to start from top

    const color = value < 40 ? '#4CAF50' : value < 80 ? '#FFC107' : '#FF5252'; // Color changes with value

    return (
      <View style={styles.meterContainer}>
        <Svg height="240" width="240">
          {/* Full 360-degree circle */}
          <Circle cx={center} cy={center} r={radius} fill="#2C3E50" />
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#34495E"
            strokeWidth="20"
            fill="none"
          />
          
          {/* Active arc representing the magnetic field strength */}
          <Path
            d={`M ${center} ${center - radius} A ${radius} ${radius} 0 ${value > 50 ? 1 : 0} 1 ${needleX} ${needleY}`}
            fill="none"
            stroke={color}
            strokeWidth="20"
          />

          {/* Needle */}
          <Circle cx={center} cy={center} r="15" fill="#ECF0F1" />
          <Line
            x1={center}
            y1={center}
            x2={needleX}
            y2={needleY}
            stroke="#ECF0F1"
            strokeWidth={4}
          />
        </Svg>
        <Text style={[styles.meterValue, { color }]}>{`${value.toFixed(2)} µT`}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <LinearGradient
        colors={['#141E30', '#243B55']}
        style={styles.gradient}
      >
        <View style={styles.container}>
          <Text style={styles.header}>Hidden Camera Detector</Text>

          <View style={styles.detectionContainer}>
            <Text style={styles.subHeader}>
              {isCameraDetected ? "Camera Detected!" : "No Camera Detected"}
            </Text>
            {renderMeter(getMagneticFieldStrength(magnetometerData))}
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ECF0F1',
    marginBottom: 20,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 20,
    color: '#ECF0F1',
    marginBottom: 10,
    textAlign: 'center',
  },
  detectionContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(44, 62, 80, 0.7)',
    borderRadius: 20,
    padding: 20,
    width: '100%',
  },
  meterContainer: {
    alignItems: 'center',
  },
  meterValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
});

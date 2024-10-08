import React, { useEffect, useState } from 'react';
import { View, Text, Alert, Button } from 'react-native';
import { Audio } from 'expo-av';
import { BleManager } from 'react-native-ble-plx';

const CameraDetection = () => {
  const [sound, setSound] = useState();
  const [manager, setManager] = useState(null);
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    // Initialize the BLE manager
    const bleManager = new BleManager();
    setManager(bleManager);

    // Cleanup function to destroy the manager
    return () => {
      bleManager.destroy();
    };
  }, []);

  const playSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/detection_sound.mp3')
    );
    setSound(sound);
    await sound.playAsync();
  };

  const scanForDevices = () => {
    if (!manager) {
      console.warn('Bluetooth manager is not initialized');
      return;
    }

    setDevices([]); // Reset devices before scanning

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.warn(error);
        return;
      }

      if (device) {
        setDevices((prevDevices) => [...prevDevices, device]);

        // Example condition to detect cameras based on name
        if (device.name && device.name.includes('Camera')) {
          Alert.alert('Camera Detected', `Found device: ${device.name}`, [{ text: 'OK' }]);
          playSound();
        }
      }
    });

    // Stop scanning after 5 seconds
    setTimeout(() => {
      manager.stopDeviceScan();
    }, 5000);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Camera Detection Page</Text>
      <Button title="Scan for Cameras" onPress={scanForDevices} />
      {devices.length > 0 && (
        <View>
          <Text>Detected Devices:</Text>
          {devices.map((device, index) => (
            <Text key={index}>{device.name || 'Unnamed Device'}</Text>
          ))}
        </View>
      )}
    </View>
  );
};

export default CameraDetection;

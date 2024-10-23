
import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import * as Sharing from 'expo-sharing'; // Import expo-sharing
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient

const RecordPage = () => {
  const [recording, setRecording] = useState(null);
  const [audioUri, setAudioUri] = useState(null);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true });

        // Define recording options
        const recordingOptions = {
          ios: {
            extension: '.m4a',
            outputFormat: Audio.RECORDING_OPTIONS_IOS_OUTPUT_FORMAT_M4A,
            audioQuality: Audio.RECORDING_OPTIONS_IOS_AUDIO_QUALITY_HIGH,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
          },
          android: {
            extension: '.m4a',
            outputFormat: Audio.RECORDING_OPTIONS_ANDROID_OUTPUT_FORMAT_MPEG_4,
            audioEncoder: Audio.RECORDING_OPTIONS_ANDROID_AUDIO_ENCODER_AAC,
          },
        };

        const { recording } = await Audio.Recording.createAsync(recordingOptions);
        setRecording(recording);
      } else {
        Alert.alert('Permission Denied', 'Audio recording permission is required.');
      }
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setAudioUri(uri);
      setRecording(null);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const shareRecording = async () => {
    if (audioUri) {
      const message = "I am in danger at this location, please come and listen to this audio."; // Custom message
      try {
        // Prompt the user to share the audio
        await Sharing.shareAsync(audioUri, {
          dialogTitle: 'Share Audio Recording',
          UTI: 'public.audio', // Specify the UTI for audio files
        });

        // Show an alert instructing to add the message
        Alert.alert('Note', `Please remember to include this message:\n"${message}"`);
      } catch (error) {
        console.error('Failed to share audio', error);
        Alert.alert('Error', 'File format not supported or sharing failed.');
      }
    } else {
      Alert.alert('No recording to share', 'Please record audio first.');
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <LinearGradient
        colors={['#FFEBEE', '#FFCDD2', '#E1F5FE', '#B3E5FC', '#B2EBF2']}
        style={styles.gradient}
      >
        <View style={styles.container}>
          <Text style={styles.header}>Record Audio and Share</Text>
          <Text style={styles.infoText}>Share location first and then Audio.</Text>

          {recording ? (
            <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
              <Text style={styles.buttonText}>Stop Recording</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.startButton} onPress={startRecording}>
              <Text style={styles.buttonText}>Start Recording</Text>
            </TouchableOpacity>
          )}

          {audioUri && (
            <TouchableOpacity style={styles.shareButton} onPress={shareRecording}>
              <Text style={styles.buttonText}>Share Recording</Text>
            </TouchableOpacity>
          )}
        </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    alignItems: 'center',
    width: '100%',
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#D32F2F',
  },
  infoText: {
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
  },
  startButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  stopButton: {
    backgroundColor: '#B71C1C',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  shareButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default RecordPage;
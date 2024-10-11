// Record.js
import React, { useState } from 'react';
import { View, Button, Text, Alert, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import * as Sharing from 'expo-sharing'; // Import expo-sharing

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
    <View style={styles.container}>
      <Text style={styles.header}>Record Audio and Share</Text>
      {recording ? (
        <Button title="Stop Recording" onPress={stopRecording} />
      ) : (
        <Button title="Start Recording" onPress={startRecording} />
      )}
      {audioUri && <Button title="Share Recording" onPress={shareRecording} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default RecordPage;

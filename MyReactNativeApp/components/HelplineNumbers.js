import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Linking } from 'react-native';

const HelplineNumbers = () => {
  const helplines = [
    { name: 'Police', number: '100' },
    { name: 'Ambulance', number: '102' },
    { name: 'Child Helpline', number: '1098' },
    { name: 'mani', number: '9381017897' },
    // Add more helplines as needed
  ];

  const handleCallHelpline = (number) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Helpline Numbers</Text>
      {helplines.map((helpline, index) => (
        <View key={index} style={styles.helpline}>
          <Text>{helpline.name}: {helpline.number}</Text>
          <Button title="Call" onPress={() => handleCallHelpline(helpline.number)} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  helpline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default HelplineNumbers;

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Modal } from 'react-native';
import * as Contacts from 'expo-contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EmergencyContacts = ({ navigation }) => {
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [allContacts, setAllContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    loadStoredContacts();
  }, []);

  const loadStoredContacts = async () => {
    try {
      const storedContacts = await AsyncStorage.getItem('emergencyContacts');
      if (storedContacts !== null) {
        setEmergencyContacts(JSON.parse(storedContacts));
      }
    } catch (error) {
      console.log('Error loading contacts from storage:', error);
    }
  };

  const saveContacts = async (contacts) => {
    try {
      await AsyncStorage.setItem('emergencyContacts', JSON.stringify(contacts));
    } catch (error) {
      console.log('Error saving contacts:', error);
    }
  };

  const pickContact = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === 'granted') {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
      });
      if (data.length > 0) {
        setAllContacts(data);
        setFilteredContacts(data);
        setIsModalVisible(true);
      }
    } else {
      alert('Permission to access contacts is required.');
    }
  };

  const addContact = (contact) => {
    if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
      const newContact = {
        id: contact.id + emergencyContacts.length, // Generate a unique id
        name: contact.name,
        phoneNumber: contact.phoneNumbers[0].number,
      };
      const updatedContacts = [...emergencyContacts, newContact];
      setEmergencyContacts(updatedContacts);
      saveContacts(updatedContacts);
    } else {
      alert('Selected contact does not have a phone number.');
    }
    setIsModalVisible(false);
  };

  const deleteContact = (id) => {
    const updatedContacts = emergencyContacts.filter(contact => contact.id !== id);
    setEmergencyContacts(updatedContacts);
    saveContacts(updatedContacts);
  };

  const navigateToShareLocation = () => {
    if (emergencyContacts.length > 0) {
      // Navigate to ShareLocation and pass emergencyContacts
      navigation.navigate('ShareLocation', { emergencyContacts });
    } else {
      alert('Please add at least one emergency contact before sharing your location.');
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = allContacts.filter(contact => 
      contact.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredContacts(filtered);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Contacts</Text>

      <TouchableOpacity style={styles.addButton} onPress={pickContact}>
        <Text style={styles.addButtonText}>Add Contact</Text>
      </TouchableOpacity>

      <FlatList
        data={emergencyContacts}
        keyExtractor={(item) => item.id.toString()} // Use unique id
        renderItem={({ item }) => (
          <View style={styles.contactItem}>
            <View>
              <Text>{item.name}</Text>
              <Text>{item.phoneNumber}</Text>
            </View>
            <TouchableOpacity onPress={() => deleteContact(item.id)}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text>No emergency contacts added yet.</Text>}
      />

      {/* Search bar to filter contacts in modal */}
      <Modal visible={isModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Select a Contact</Text>
          <TextInput
            style={styles.searchBar}
            placeholder="Search Contacts"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <FlatList
            data={filteredContacts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.contactItem} onPress={() => addContact(item)}>
                <Text>{item.name}</Text>
                {item.phoneNumbers && (
                  <Text>{item.phoneNumbers[0].number}</Text>
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text>No contacts found.</Text>}
          />
          <TouchableOpacity onPress={() => setIsModalVisible(false)}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
    borderRadius: 5,
  },
  deleteText: {
    color: 'red',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  searchBar: {
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
  },
  closeText: {
    fontSize: 18,
    color: '#0000FF',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default EmergencyContacts;

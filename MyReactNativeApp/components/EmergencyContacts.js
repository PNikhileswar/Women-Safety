import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Modal, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Contacts from 'expo-contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function EmergencyContacts({ navigation }) {
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [allContacts, setAllContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    loadStoredContacts();
  }, []);

  useEffect(() => {
    if (isModalVisible) {
      setSearchQuery('');
      setFilteredContacts(allContacts);
    }
  }, [isModalVisible, allContacts]);

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
        id: contact.id + emergencyContacts.length,
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
    setSearchQuery('');
    setFilteredContacts(allContacts);
  };

  const deleteContact = (id) => {
    const updatedContacts = emergencyContacts.filter(contact => contact.id !== id);
    setEmergencyContacts(updatedContacts);
    saveContacts(updatedContacts);
  };

  const navigateToShareLocation = () => {
    if (emergencyContacts.length > 0) {
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
    <SafeAreaView style={styles.safeContainer}>
      <LinearGradient
        colors={['#FFEBEE', '#FFCDD2', '#E1F5FE', '#B3E5FC', '#B2EBF2']}
        style={styles.gradient}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Emergency Contacts</Text>

          <TouchableOpacity style={styles.addButton} onPress={pickContact}>
            <Ionicons name="add-circle-outline" size={24} color="white" />
            <Text style={styles.addButtonText}>Add Contact</Text>
          </TouchableOpacity>

          <FlatList
            data={emergencyContacts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.contactItem}>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{item.name}</Text>
                  <Text style={styles.contactNumber}>{item.phoneNumber}</Text>
                </View>
                <TouchableOpacity onPress={() => deleteContact(item.id)} style={styles.deleteButton}>
                  <Ionicons name="trash-outline" size={24} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>No emergency contacts added yet.</Text>}
          />

          <TouchableOpacity style={styles.shareLocationButton} onPress={navigateToShareLocation}>
            <Ionicons name="location-outline" size={24} color="white" />
            <Text style={styles.shareLocationText}>Share Location</Text>
          </TouchableOpacity>

          <Modal visible={isModalVisible} animationType="slide">
            <SafeAreaView style={styles.modalContainer}>
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
                  <TouchableOpacity style={styles.modalContactItem} onPress={() => addContact(item)}>
                    <Text style={styles.modalContactName}>{item.name}</Text>
                    {item.phoneNumbers && (
                      <Text style={styles.modalContactNumber}>{item.phoneNumbers[0].number}</Text>
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>No contacts found.</Text>}
              />
              <TouchableOpacity style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </SafeAreaView>
          </Modal>
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
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
    letterSpacing: 1,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  contactNumber: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    padding: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
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
    color: '#333',
    textAlign: 'center',
  },
  searchBar: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  modalContactItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalContactName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContactNumber: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  closeText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  shareLocationButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
  },
  shareLocationText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16,
  },
});
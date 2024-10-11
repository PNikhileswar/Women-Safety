// import React, { useState, useEffect } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, FlatList } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';
// import * as Sharing from 'expo-sharing';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as Contacts from 'expo-contacts';

// export default function EmergencyImageShare() {
//   const [image, setImage] = useState(null);
//   const [emergencyContacts, setEmergencyContacts] = useState([]);
//   const [selectedContacts, setSelectedContacts] = useState([]);

//   useEffect(() => {
//     loadEmergencyContacts();
//   }, []);

//   const loadEmergencyContacts = async () => {
//     try {
//       const contacts = await AsyncStorage.getItem('emergencyContacts');
//       if (contacts) {
//         setEmergencyContacts(JSON.parse(contacts));
//       } else {
//         Alert.alert('No contacts', 'No emergency contacts found. Please add some in the settings.');
//       }
//     } catch (error) {
//       console.error('Error loading emergency contacts:', error);
//       Alert.alert('Error', 'Failed to load emergency contacts.');
//     }
//   };

//   const pickImage = async () => {
//     let result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [4, 3],
//       quality: 1,
//     });

//     if (!result.canceled) {
//       setImage(result.assets[0].uri);
//     }
//   };

//   const toggleContactSelection = (contact) => {
//     if (selectedContacts.includes(contact.id)) {
//       setSelectedContacts(selectedContacts.filter(id => id !== contact.id));
//     } else {
//       setSelectedContacts([...selectedContacts, contact.id]);
//     }
//   };

//   const shareImageWithContacts = async () => {
//     if (image && selectedContacts.length > 0) {
//       // Prepare the message for sharing
//       const message = `Emergency alert! Image shared with: ${selectedContacts.map(id => emergencyContacts.find(contact => contact.id === id)?.name).join(', ')}`;
      
//       // Sharing the image
//       await Sharing.shareAsync(image, {
//         dialogTitle: 'Share Emergency Image',
//         UTI: 'public.image',
//         mimeType: 'image/jpeg',
//         message: message,
//       });
//       Alert.alert('Success', 'Image shared with selected contacts.');
//     } else {
//       Alert.alert('No Image', 'Please select an image and at least one contact to share with.');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {image && <Image source={{ uri: image }} style={styles.image} />}
//       <FlatList
//         data={emergencyContacts}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <TouchableOpacity onPress={() => toggleContactSelection(item)} style={styles.contactItem}>
//             <Text style={styles.contactText}>{item.name}</Text>
//             {selectedContacts.includes(item.id) && <Text style={styles.selectedText}>✔️</Text>}
//           </TouchableOpacity>
//         )}
//       />
//       <View style={styles.buttonContainer}>
//         <TouchableOpacity style={styles.button} onPress={pickImage}>
//           <Text style={styles.buttonText}>Pick from Gallery</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.button} onPress={shareImageWithContacts}>
//           <Text style={styles.buttonText}>Share Emergency Image</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f0f0f0',
//   },
//   image: {
//     width: 300,
//     height: 300,
//     marginBottom: 20,
//     borderRadius: 10,
//   },
//   contactItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//     width: '100%',
//   },
//   contactText: {
//     fontSize: 16,
//   },
//   selectedText: {
//     color: 'green',
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     width: '100%',
//     paddingHorizontal: 20,
//   },
//   button: {
//     backgroundColor: '#007AFF',
//     padding: 15,
//     borderRadius: 5,
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: '45%',
//   },
//   buttonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });

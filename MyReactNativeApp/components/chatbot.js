import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { GoogleGenerativeAI } from '@google/generative-ai';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isAskingFollowUp, setIsAskingFollowUp] = useState(false);  // For follow-up questions
  const [options, setOptions] = useState([]);  // For multiple-choice options
  const [loading, setLoading] = useState(false);  // For showing a loading indicator

  const apiKey = 'AIzaSyB6DsVrl0MVDm2FZN4wPVB35YWwdXfjju4'; // Replace with your Gemini API key
  const genAI = new GoogleGenerativeAI(apiKey);

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage = { text: input, sender: 'user' };
      setMessages(prev => [...prev, userMessage]);

      setInput('');
      setLoading(true);

      try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(input);
        const response = await result.response;
        const text = await response.text();
        console.log(text);
        const botMessage = { text, sender: 'bot' };
        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        console.error(error);
        const errorMessage = { text: 'There was an error with the request.', sender: 'bot' };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setLoading(false);
      }
    }
  };

  const processMessage = (message) => {
    if (!isAskingFollowUp) {
      if (message.toLowerCase().includes('women')) {
        respond("What would you like to know about women? You can ask about rights, education, or health.");
      } else if (message.toLowerCase().includes('child care')) {
        respond("What do you want to know about child care? You can ask about nutrition, education, or safety.");
      } else {
        // If the question isn't directly related, ask follow-up questions
        respond("I didn't understand your question. Please select a topic:");
        setOptions(['Women', 'Child Care']);
        setIsAskingFollowUp(true);
      }
    } else {
      handleFollowUp(message);
    }
  };

  const handleFollowUp = (option) => {
    if (option.toLowerCase() === 'women') {
      respond("Great! What would you like to ask about women?");
      setIsAskingFollowUp(false);
      setOptions([]);
    } else if (option.toLowerCase() === 'child care') {
      respond("Good choice! What do you want to know about child care?");
      setIsAskingFollowUp(false);
      setOptions([]);
    } else {
      respond("Please choose a valid option.");
    }
  };

  const respond = (botMessage) => {
    const botReply = { text: botMessage, sender: 'bot' };
    setMessages(prev => [...prev, botReply]);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <Text style={item.sender === 'user' ? styles.userMessage : styles.botMessage}>
            {item.text}
          </Text>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      {options.length > 0 && (
        <View style={styles.optionsContainer}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionButton}
              onPress={() => handleFollowUp(option)}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      <TextInput
        style={styles.input}
        value={input}
        onChangeText={setInput}
        placeholder="Type your message..."
      />
      <Button title="Send" onPress={handleSend} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4CAF50',
    color: '#fff',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f1f1',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 10,
  },
  optionButton: {
    backgroundColor: '#008CBA',
    padding: 10,
    borderRadius: 5,
    margin: 5,
  },
  optionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
});

export default Chatbot;
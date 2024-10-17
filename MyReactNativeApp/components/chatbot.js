import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { GoogleGenerativeAI } from '@google/generative-ai';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isAskingFollowUp, setIsAskingFollowUp] = useState(false); // For follow-up questions
  const [options, setOptions] = useState([]); // For multiple-choice options
  const [loading, setLoading] = useState(false); // For showing a loading indicator
  const flatListRef = useRef(); // Ref for FlatList to control scrolling

  const apiKey = 'AIzaSyB6DsVrl0MVDm2FZN4wPVB35YWwdXfjju4'; // Replace with your Gemini API key
  const genAI = new GoogleGenerativeAI(apiKey);

  // Scroll to the bottom whenever a new message is added
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage = { text: input, sender: 'user' };
      setMessages(prev => [...prev, userMessage]);

      setInput('');
      setLoading(true);

      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
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

  const processMessage = message => {
    if (!isAskingFollowUp) {
      if (message.toLowerCase().includes('women')) {
        respond('What would you like to know about women? You can ask about rights, education, or health.');
      } else if (message.toLowerCase().includes('child care')) {
        respond('What do you want to know about child care? You can ask about nutrition, education, or safety.');
      } else {
        respond("I didn't understand your question. Please select a topic:");
        setOptions(['Women', 'Child Care']);
        setIsAskingFollowUp(true);
      }
    } else {
      handleFollowUp(message);
    }
  };

  const handleFollowUp = option => {
    if (option.toLowerCase() === 'women') {
      respond('Great! What would you like to ask about women?');
      setIsAskingFollowUp(false);
      setOptions([]);
    } else if (option.toLowerCase() === 'child care') {
      respond('Good choice! What do you want to know about child care?');
      setIsAskingFollowUp(false);
      setOptions([]);
    } else {
      respond('Please choose a valid option.');
    }
  };

  const respond = botMessage => {
    const botReply = { text: botMessage, sender: 'bot' };
    setMessages(prev => [...prev, botReply]);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} // Adjust offset for iOS
        style={styles.container}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={({ item }) => (
            <View
              style={item.sender === 'user' ? styles.userMessageContainer : styles.botMessageContainer}
            >
              <Text style={item.sender === 'user' ? styles.userMessage : styles.botMessage}>
                {item.text}
              </Text>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
          style={styles.chatList}
          onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
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

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type your message..."
            placeholderTextColor="#888"
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F0F4F8', // Light background color for modern look
  },
  container: {
    flex: 1,
    padding: 10,
  },
  chatList: {
    flex: 1,
    marginBottom: 10,
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    maxWidth: '80%',
    backgroundColor: '#4CAF50', // User message in green
    padding: 10,
    borderRadius: 20,
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 4,
  },
  botMessageContainer: {
    alignSelf: 'flex-start',
    maxWidth: '80%',
    backgroundColor: '#ECEFF1', // Bot message in light gray
    padding: 10,
    borderRadius: 20,
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 4,
  },
  userMessage: {
    color: '#FFFFFF', // White text for user messages
  },
  botMessage: {
    color: '#000000', // Dark text for bot messages
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
    borderRadius: 20,
    margin: 5,
  },
  optionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#ccc',
    padding: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    padding: 10,
    backgroundColor: '#fff',
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Chatbot;

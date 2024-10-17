const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const cors = require('cors'); // Ensure CORS is enabled for cross-origin requests

const app = express();

app.use(cors()); // Allow CORS
app.use(bodyParser.json());

const accountSid = 'AC1e8bbb02379e0cfcdd564da8023d9a02'; // Twilio Account SID
const authToken = '51fc3df3a73f48ac560b4c7e2ea0ac82';   // Twilio Auth Token
const client = new twilio(accountSid, authToken);

// Endpoint to handle location sharing
app.post('/send-location', async (req, res) => {
  console.log('Received location request from frontend...');
  try {
    const { contacts, latitude, longitude } = req.body;
    if (!contacts || !Array.isArray(contacts) || contacts.length === 0 || !latitude || !longitude) {
      return res.status(400).json({ error: 'Missing required fields: contacts (array), latitude, and longitude.' });
    }

    const message = `Current location is Latitude: ${latitude}, Longitude: ${longitude}.`;

    await Promise.all(contacts.map(number => sendSms(number, message)));
    res.status(200).json({ message: 'Location shared via SMS.' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while sharing location.' });
  }
});

// Endpoint to handle stopping location sharing
app.post('/stop-sharing', async (req, res) => {
  console.log('Received stop notification request from frontend...');
  try {
    const { contacts } = req.body;
    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({ error: 'Missing required field: contacts (array).' });
    }

    const message = 'Location sharing has been stopped.';
    await Promise.all(contacts.map(number => sendSms(number, message)));
    res.status(200).json({ message: 'Stop notification sent via SMS.' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while sending stop notification.' });
  }
});

// Function to send SMS using Twilio
const sendSms = async (number, message) => {
  try {
    await client.messages.create({
      body: message,
      from: '+18507713183', // Twilio phone number
      to: number,
    });
    console.log(`SMS sent to ${number}`);
  } catch (error) {
    console.error(`Error sending SMS to ${number}:`, error);
  }
};

// Start the server
app.listen(5000, () => {
  console.log('Server started on port 5000');
});

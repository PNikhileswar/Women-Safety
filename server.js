const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const twilio = require('twilio'); // Twilio for SMS notifications

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create a schema for storing media URLs
const MediaSchema = new mongoose.Schema({
  mediaUrl: String,
});

const Media = mongoose.model('Media', MediaSchema);

// Setup Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory for uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Appending extension
  },
});

const upload = multer({ storage });

// API endpoint to handle media uploads
app.post('/upload', upload.single('media'), async (req, res) => {
  const mediaUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
  const newMedia = new Media({ mediaUrl });

  try {
    await newMedia.save();
    res.json({ success: true, mediaUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Twilio configuration
const twilioAccountSid = 'AC1e8bbb02379e0cfcdd564da8023d9a02';
const twilioAuthToken = '51fc3df3a73f48ac560b4c7e2ea0ac82';
const twilioPhoneNumber = '18507713183';
const client = twilio(twilioAccountSid, twilioAuthToken);

// API endpoint to notify emergency contacts via SMS
app.post('/notify', async (req, res) => {
  const { phoneNumber, mediaUrl } = req.body;

  // Validate input
  if (!phoneNumber || !mediaUrl) {
    return res.status(400).json({ success: false, message: 'Phone number and media URL are required.' });
  }

  try {
    await client.messages.create({
      body: `Emergency Alert: Media shared. View it here: ${mediaUrl}`,
      from: twilioPhoneNumber,
      to: phoneNumber,
    });
    res.json({ success: true, message: 'Notification sent successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

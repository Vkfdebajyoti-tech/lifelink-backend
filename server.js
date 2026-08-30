const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Donor = require('./models/Donor');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// MongoDB কানেকশন
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully!'))
  .catch((err) => console.log('DB Connection Error:', err));

// নতুন ডোনার অ্যাড করার এপিআই (POST)
app.post('/api/donors', async (req, res) => {
  try {
    const { name, bloodGroup, phone, location, district, available, aadhaarFront, aadhaarBack } = req.body;

    // স্কিমার সাথে মিল রেখে ডেটা তৈরি করা (location পাঠালে সেটা district এ ম্যাপ হবে)
    const newDonor = new Donor({
      name,
      bloodGroup,
      phone,
      district: district || location, 
      available: available !== undefined ? available : true,
      aadhaarFront,
      aadhaarBack
    });

    await newDonor.save();
    res.status(201).json({ message: 'Donor registered successfully!', donor: newDonor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// সব ডোনার দেখার এপিআই (GET - লেটেস্ট ডোনারদের আগে দেখানোর জন্য .sort যোগ করা হয়েছে)
app.get('/api/donors', async (req, res) => {
  try {
    const donors = await Donor.find().sort({ createdAt: -1 });
    res.status(200).json(donors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Higher limit for Base64 images

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sevasetu';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'User' }
});

const User = mongoose.model('User', userSchema);

// Report Schema
const reportSchema = new mongoose.Schema({
  description: String,
  image: String, // Storing as Base64 for now
  timestamp: { type: Date, default: Date.now },
  status: { type: String, default: 'pending' },
  urgencyScore: { type: Number, default: 0 },
  location: {
    lat: Number,
    lng: Number,
    address: String
  }
});

const Report = mongoose.model('Report', reportSchema);

// Urgency Engine Logic
const calculateUrgency = async (description, location) => {
  let score = 10; // Base score for any report
  if (!description) return score;

  const descLower = description.toLowerCase();
  
  // 1. Keyword Analysis
  const criticalKeywords = ['critical', 'urgent', 'dying', 'dead', 'starving', 'bleeding', 'emergency', 'trapped', 'fire', 'collapsed', 'severe', 'death'];
  const highKeywords = ['need', 'help', 'shortage', 'food', 'water', 'medical', 'injured', 'sick', 'broken', 'stuck', 'flood', 'power', 'outage'];
  
  let keywordScore = 0;
  criticalKeywords.forEach(kw => { if(descLower.includes(kw)) keywordScore += 30; });
  highKeywords.forEach(kw => { if(descLower.includes(kw)) keywordScore += 15; });
  
  // Max keyword score is 60 to allow frequency/recency to play a role
  score += Math.min(keywordScore, 60);

  // 2. Frequency / Recency Analysis
  // If many similar problems are reported in the last 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  // Currently checking all recent pending reports. 
  // In a full map integration, we would filter by `location` radius here.
  const similarReportsCount = await Report.countDocuments({
    status: 'pending',
    timestamp: { $gte: oneDayAgo }
  });

  // Boost score by 5 for every recent active report, max 30 points
  score += Math.min(similarReportsCount * 5, 30);

  return Math.min(score, 100); // Cap at 100
};

// API Endpoints
const JWT_SECRET = process.env.JWT_SECRET || 'sevasetu_super_secret_key_2026';

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/reports', async (req, res) => {
  try {
    const reportData = req.body;
    
    // Calculate Urgency Score
    reportData.urgencyScore = await calculateUrgency(reportData.description, reportData.location);
    
    const newReport = new Report(reportData);
    await newReport.save();
    res.status(201).json(newReport);
  } catch (err) {
    console.error('Save error:', err);
    res.status(400).json({ message: err.message });
  }
});

app.get('/api/reports', async (req, res) => {
  try {
    const reports = await Report.find().sort({ timestamp: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

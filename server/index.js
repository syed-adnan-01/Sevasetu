const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); 

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sevasetu';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// --- Schemas (Kept as is) ---
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'User' },
  skills: [String],
  availability: { type: Boolean, default: true },
  location: { lat: Number, lng: Number }
});
const User = mongoose.model('User', userSchema);

const reportSchema = new mongoose.Schema({
  description: String,
  image: String, 
  timestamp: { type: Date, default: Date.now },
  status: { type: String, default: 'pending' },
  urgencyScore: { type: Number, default: 0 },
  location: { lat: Number, lng: Number, address: String },
  userEmail: String
});
const Report = mongoose.model('Report', reportSchema);

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: { type: String, default: 'open' },
  assignedTo: String,
  reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report' },
  urgencyScore: { type: Number, default: 0 },
  requiredSkills: [String],
  location: { lat: Number, lng: Number },
  completionProof: String,
  completionNotes: String,
  proofLocation: { lat: Number, lng: Number },
  verifiedByAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const Task = mongoose.model('Task', taskSchema);

// --- Gemini AI Initialization (Updated for 2026) ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// UPDATED: Using the specific preview string to avoid 404
const MODEL_NAME = "gemini-3-flash-preview"; 

/**
 * Visual Severity Analysis
 * UPDATED: Optimized multimodal request structure
 */
const analyzeImageSeverity = async (base64Image) => {
  try {
    if (!base64Image) return 0;
    const imageData = base64Image.split(',')[1] || base64Image;
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = "Act as a disaster first-responder. Analyze this image. On a scale of 1-100, how life-threatening is this? Return ONLY a raw number. High intensity fires/floods = 80+. Minor issues = 10-30. Nothing wrong = 0.";

    // UPDATED: Current SDK expects an array of parts
    const result = await model.generateContent([
      { inlineData: { data: imageData, mimeType: "image/jpeg" } },
      { text: prompt } 
    ]);

    const response = await result.response;
    const score = parseInt(response.text().trim());
    return isNaN(score) ? 0 : score;
  } catch (err) {
    console.error("⚠️ AI Vision Score Error:", err.message);
    return 0; 
  }
};

/**
 * Urgency Engine Logic (Kept as is)
 */
const calculateUrgency = async (description, location, image) => {
  let score = 10; 
  let textScore = 0;

  if (description) {
    const descLower = description.toLowerCase();
    const critical = ['critical', 'urgent', 'dying', 'trapped', 'fire', 'collapsed', 'severe'];
    const high = ['need', 'help', 'food', 'water', 'injured', 'flood', 'outage'];
    
    critical.forEach(kw => { if(descLower.includes(kw)) textScore += 30; });
    high.forEach(kw => { if(descLower.includes(kw)) textScore += 15; });
  }
  
  const visualScore = await analyzeImageSeverity(image);
  score += (Math.min(textScore, 60) * 0.4) + (visualScore * 0.6);

  const similarReports = await Report.countDocuments({
    status: 'pending',
    timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
  });
  score += Math.min(similarReports * 5, 20);

  return Math.min(Math.round(score), 100);
};

// --- API Endpoints ---
const JWT_SECRET = process.env.JWT_SECRET || 'sevasetu_secret_2026';

/**
 * AUTO-DETECT ENDPOINT
 * UPDATED: Fixed multimodal request to solve OCR "alphabet soup"
 */
app.post('/api/analyze-image', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ message: 'Image required' });

    const imageData = image.split(',')[1] || image;
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    
    const prompt = "Describe this disaster scene for a formal report in one clear, objective sentence. Focus on the scale (e.g., 'A building is engulfed in high-intensity flames'). Avoid jargon.";
    
    // UPDATED: Current SDK structure
    const result = await model.generateContent([
      { inlineData: { data: imageData, mimeType: "image/jpeg" } },
      { text: prompt }
    ]);
    
    const response = await result.response;
    res.json({ description: response.text().trim() });
  } catch (err) {
    console.error("❌ Gemini API Error:", err.message);
    res.status(500).json({ description: "Emergency detected. Detailed analysis currently unavailable." });
  }
});

app.post('/api/reports', async (req, res) => {
  try {
    const reportData = req.body;
    reportData.urgencyScore = await calculateUrgency(reportData.description, reportData.location, reportData.image);
    
    const newReport = new Report(reportData);
    await newReport.save();

    await generateTasksForReport(newReport); 

    res.status(201).json(newReport);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post('/api/reports/:id/tasks/initiate', async (req, res) => {
  try {
    const { email } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    
    await generateTasksForReport(report);
    const tasks = await Task.find({ reportId: report._id });
    
    if (tasks.length > 0 && email) {
      tasks[0].assignedTo = email;
      tasks[0].status = 'assigned';
      await tasks[0].save();
    }
    
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


const generateTasksForReport = async (report) => {
  const descLower = report.description ? report.description.toLowerCase() : "";
  const tasksToCreate = [];

  if (descLower.includes('flood') || descLower.includes('water')) {
    tasksToCreate.push({
      title: 'Distribute Clean Water & Rations',
      description: 'Deliver emergency water supplies and food to the affected area.',
      requiredSkills: ['Logistics', 'Driving'],
    });
    tasksToCreate.push({
      title: 'Water Pumping & Drainage',
      description: 'Assist in pumping out stagnant water from residential buildings.',
      requiredSkills: ['Engineering', 'Heavy Machinery'],
    });
  }

  if (descLower.includes('fire') || descLower.includes('smoke') || descLower.includes('burn')) {
    tasksToCreate.push({
      title: 'Distribute Masks & Inhalers',
      description: 'Provide respiratory protection and medical supplies for smoke inhalation.',
      requiredSkills: ['Medical', 'Logistics'],
    });
    tasksToCreate.push({
      title: 'Evacuation Assistance',
      description: 'Help evacuate residents from buildings near the fire zone.',
      requiredSkills: ['Search & Rescue', 'First Aid'],
    });
  }

  if (descLower.includes('medical') || descLower.includes('injured') || descLower.includes('bleeding')) {
    tasksToCreate.push({
      title: 'Emergency Triage & First Aid',
      description: 'Provide immediate medical attention to injured individuals on site.',
      requiredSkills: ['Medical', 'First Aid', 'Doctor', 'Nurse'],
    });
  }

  if (tasksToCreate.length === 0) {
    tasksToCreate.push({
      title: 'On-site Assessment & Recon',
      description: 'Deploy to the location to assess the situation and report back needs.',
      requiredSkills: ['Communication', 'Observation'],
    });
  }

  for (const t of tasksToCreate) {
    const newTask = new Task({
      ...t,
      reportId: report._id,
      urgencyScore: report.urgencyScore,
      location: report.location
    });
    await newTask.save();
  }
};

// --- Auth, Profile, and Task APIs (Kept as is) ---
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
  } catch (err) { res.status(500).json({ message: err.message }); }
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
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.put('/api/auth/profile', async (req, res) => {
  try {
    const { email, skills, availability, location } = req.body;
    const user = await User.findOneAndUpdate({ email }, { skills, availability, location }, { new: true });
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/reports', async (req, res) => {
  const reports = await Report.find().sort({ timestamp: -1 });
  res.json(reports);
});

app.get('/api/reports/user/:email', async (req, res) => {
  try {
    const reports = await Report.find({ userEmail: req.params.email }).sort({ timestamp: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/tasks', async (req, res) => {
  const tasks = await Task.find().sort({ createdAt: -1 }).populate('reportId');
  res.json(tasks);
});

// Haversine distance helper
const getDistanceInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

app.get('/api/tasks/recommendations', async (req, res) => {
  try {
    const { email } = req.query;
    const user = await User.findOne({ email });
    const openTasks = await Task.find({ status: 'open' });
    const scoredTasks = openTasks.map(task => {
      let matchScore = 0;
      let distanceKm = null;
      
      const matchedSkills = task.requiredSkills.filter(skill => user.skills?.includes(skill));
      matchScore += (matchedSkills.length * 20) + (task.urgencyScore * 0.5);
      
      if (user.location?.lat && user.location?.lng && task.location?.lat && task.location?.lng) {
        distanceKm = getDistanceInKm(user.location.lat, user.location.lng, task.location.lat, task.location.lng);
        // Boost score based on proximity
        if (distanceKm <= 5) matchScore += 40;
        else if (distanceKm <= 15) matchScore += 20;
        else if (distanceKm <= 50) matchScore += 10;
      }
      
      return { ...task.toObject(), matchScore, matchedSkills, distanceKm };
    });
    scoredTasks.sort((a, b) => b.matchScore - a.matchScore);
    res.json(scoredTasks.slice(0, 10));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.put('/api/tasks/:id/assign', async (req, res) => {
  try {
    const { email } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id, 
      { status: 'assigned', assignedTo: email }, 
      { new: true }
    );
    res.json(task);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/tasks/assigned/:email', async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.params.email }).sort({ createdAt: -1 }).populate('reportId');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/tasks/report/:reportId', async (req, res) => {
  try {
    const tasks = await Task.find({ reportId: req.params.reportId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/tasks/:id/complete', async (req, res) => {
  const { completionNotes, completionProof, proofLocation } = req.body;
  const task = await Task.findByIdAndUpdate(req.params.id, { 
    status: 'completed', 
    completionNotes, 
    completionProof,
    proofLocation 
  }, { new: true });
  res.json(task);
});

app.put('/api/tasks/:id/verify', async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, { verifiedByAdmin: true }, { new: true });
  if (task.reportId) {
    const report = await Report.findById(task.reportId);
    if (report) {
      report.urgencyScore = Math.max(0, report.urgencyScore - 30);
      if (report.urgencyScore === 0) report.status = 'resolved';
      await report.save();
    }
  }
  res.json(task);
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Seva-Setu Server live on port ${PORT}`);
  });
}

module.exports = app;
# 🌉 Sevasetu

Sevasetu is a real-time system that gathers scattered community information to clearly show the most urgent local needs.  By combining AI, geographic intelligence, and real-time coordination, it ensures a smart way to quickly match and connect available volunteers with the specific tasks and areas where they are needed most..

---

## 🚀 Features

### 🤖 AI-Driven Reporting
- Upload paper surveys and field reports to:
  - Structured descriptions
  - Emergency categories
  - Urgency scores (0–100)
- Reduces manual reporting effort and speeds up response

---

### 🧠 Smart Volunteer Matching
- Matches volunteers to tasks based on:
  - 📍 Proximity (Haversine Formula)
  - 🛠️ Skills (Medical, Rescue, Logistics, etc.)
  - 🚨 Urgency of the task
- Ensures efficient and optimized task allocation

---

### 📋 Volunteer Dashboard
- Personalized “My Missions” board
- Accept and track assigned tasks
- Upload completion proof (images/notes)

---

### 🌍 Public Issues Feed
- Real-time list of reported incidents
- Location-based grouping
- Anyone can volunteer directly for an issue

---

### 🗺️ Geographic Intelligence
- Interactive maps for:
  - Selecting volunteer work areas
  - Viewing nearby incidents
- Accurate distance calculations using spherical geometry

---

## 🛠️ Tech Stack

### Frontend
- React 18 (Vite)
- TypeScript
- Tailwind CSS
- Framer Motion
- Leaflet.js
- Lucide React

---

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication

---

### APIs & Integrations
- Google Generative AI (Gemini Vision)
- OpenStreetMap (Nominatim Geocoding)

---

### Tools & Infrastructure
- Git & GitHub
- Dotenv (Environment Management)

---

## 🏗️ Architecture Overview

- **AI Processing Layer**
  - Image → Description → Category → Urgency Score

- **Matching Engine**
  - Combines distance, skills, and urgency to rank tasks

- **Task Automation**
  - Automatically generates sub-tasks based on report keywords

- **Real-Time System**
  - Dynamic dashboards for volunteers and public users

---

## 📊 Urgency Score Logic

The urgency score is calculated using multiple factors:

- Visual severity (image analysis)
- Text-based indicators (keywords)
- Location risk level
- Time sensitivity

---

## 📍 Smart Matching Algorithm

Tasks are ranked using:
Match Score =
(1 / Distance) * Weight +
Skill Match * Weight +
Urgency * Weight

This ensures the most relevant volunteers are prioritized.

---

## 💡 Key Highlights

- ⚡ Real-time disaster coordination  
- 🤖 AI-powered automation  
- 🌍 Location-aware intelligence  
- 📱 Mobile-first responsive design  
- 🔄 Scalable and modular architecture  

---

## 🚧 Future Enhancements

- 🔊 Voice-to-report (multi-language support)
- 📶 Offline reporting with sync
- 🧪 Fake report detection using AI
- 🔔 Push notifications for nearby emergencies
- 📊 Advanced analytics dashboard

---

## 🧑‍💻 Getting Started

### Prerequisites
- Node.js
- MongoDB
- API keys for AI services

---

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/sevasetu.git

# Navigate to project folder
cd sevasetu

# Install dependencies
npm install
```
Setup Environment Variables

Create a .env file in the root directory:
```bash
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_api_key
```
Run the Application
```bash
# Start backend
npm run server

# Start frontend
npm run dev
```

🤝 Contributing

Contributions are welcome!

Fork the repo
Create a new branch
Make your changes
Submit a pull request

📜 License

This project is licensed under the MIT License.

🙌 Acknowledgements
OpenStreetMap for geolocation services
Google Generative AI for vision analysis
Open-source community


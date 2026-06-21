# 🌍 EcoSphere AI

**AI-Powered Carbon Footprint Awareness Platform**

EcoSphere AI is a modern, AI-powered sustainability platform that helps individuals understand, track, and reduce their carbon footprint through personalized insights and actionable recommendations. Built for the **Google Antigravity Challenge**, the platform combines carbon analytics with Google's AI ecosystem to encourage sustainable living.

---

## 🚀 Live Demo

### 🌐 Frontend

**https://deployfesthack.web.app**

### 🤖 Backend API

**https://ecosphere-api-905201834317.us-central1.run.app**

### 📚 API Documentation

**https://ecosphere-api-905201834317.us-central1.run.app/docs**

---

## ✨ Features

### 🧮 Carbon Footprint Calculator

* Personalized carbon footprint estimation
* Transportation, energy, food, shopping, and waste analysis
* Carbon Score generation
* Monthly CO₂ emission breakdown

### 🤖 AI Sustainability Coach

* Powered by Google Gemini
* Personalized sustainability advice
* Interactive conversational interface
* Context-aware recommendations

### 📅 Weekly AI Action Plan

* Customized weekly sustainability goals
* Practical carbon reduction tasks
* Trackable eco-friendly habits

### ✈️ Travel Emission Comparison

* Compare different transportation modes
* Estimate travel emissions
* Recommend greener alternatives

### ⚡ Electricity Bill Analysis

* Upload electricity bills
* AI-powered consumption insights
* Energy-saving recommendations

### 🛍️ Product Sustainability Advisor

* Multimodal product analysis
* Eco-friendly shopping guidance
* Sustainability scoring

### 📊 Progress Analytics

* Carbon emission trends
* Performance tracking
* Environmental impact visualization

### 🎮 Gamification Dashboard

* Carbon Score
* Sustainability achievements
* Progress tracking
* Environmental milestones

### 🌱 Carbon Reduction Simulator

* Simulate lifestyle changes
* Estimate emission savings
* Explore sustainable choices

---

# 🏗️ Architecture

```
                    EcoSphere AI

             Firebase Hosting
                     │
                     ▼
            React + Vite Frontend
                     │
                     ▼
             Google Cloud Run
                     │
                     ▼
               FastAPI Backend
                     │
                     ▼
               Google Gemini
                     │
                     ▼
                  Vertex AI
```

---

# 🛠️ Tech Stack

## Frontend

* React
* TypeScript
* Vite
* Vanilla CSS
* Lucide React
* Responsive UI
* Glassmorphism Design

## Backend

* FastAPI
* Python
* Uvicorn
* Pydantic

## AI

* Google Gemini
* Vertex AI
* Google GenAI SDK
* Multimodal AI

## Google Cloud

* Firebase Hosting
* Cloud Run
* Vertex AI
* Cloud Build

---

# 📂 Project Structure

```
EcoSphere-AI/

├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── main.py
│   ├── ai_agent.py
│   ├── calculator.py
│   └── requirements.txt
│
└── README.md
```

---

# 🚀 Local Setup

## Clone Repository

```bash
git clone https://github.com/justinmathew2/EcoSphere-AI.git

cd EcoSphere-AI
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

Runs at:

```
http://localhost:5173
```

---

## Backend

```bash
cd backend

pip install -r requirements.txt

uvicorn main:app --reload --port 8080
```

Runs at:

```
http://localhost:8080
```

API Docs:

```
http://localhost:8080/docs
```

---

# ☁️ Deployment

## Frontend

Hosted on Firebase Hosting:

https://deployfesthack.web.app

Deploy:

```bash
npm run build

firebase deploy
```

---

## Backend

Hosted on Google Cloud Run:

https://ecosphere-api-905201834317.us-central1.run.app

Deploy:

```bash
gcloud run deploy ecosphere-api \
--source . \
--region us-central1 \
--allow-unauthenticated
```

---

# 🤖 Google AI Integration

EcoSphere AI leverages Google's AI ecosystem to provide intelligent sustainability insights.

### AI Features

* Personalized sustainability coaching
* Weekly action plan generation
* Electricity bill analysis
* Product sustainability evaluation
* Carbon reduction recommendations
* Context-aware environmental advice

Powered by:

* Google Gemini
* Vertex AI
* Google GenAI SDK

---

# 🌍 Sustainability Goals

EcoSphere AI helps users:

* Understand their carbon footprint
* Build sustainable habits
* Reduce household emissions
* Make eco-friendly purchasing decisions
* Lower energy consumption
* Choose greener travel options

---

# 🎯 Google Antigravity Challenge

EcoSphere AI addresses the challenge of increasing carbon footprint awareness through:

* AI-powered personalization
* Interactive sustainability coaching
* Carbon footprint tracking
* Practical carbon reduction strategies
* Gamification and engagement
* Real-world environmental impact measurement

---

# 🔮 Future Enhancements

* Firebase Authentication
* Firestore user profiles
* Carbon history tracking
* Community sustainability challenges
* Smart home integrations
* Wearable device support
* Carbon offset marketplace
* Enterprise sustainability dashboards

---

# 👨‍💻 Author

**Justin Mathew**

GitHub:
https://github.com/justinmathew2

---

# 📄 License

This project is developed for educational and hackathon purposes as part of the Google Antigravity Challenge.

---

## 🌱 Building a greener future with AI and Google Cloud.

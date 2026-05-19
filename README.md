<![CDATA[<div align="center">

# 🎙️ EchoCareAI PRO

### AI-Powered Speech Emotion Recognition & Stress Detection Platform

[![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)](https://pytorch.org)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

*Your Voice. Your Wellness.* — Analyze speech patterns using deep learning to detect emotions and stress levels in real time.

---

</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🧠 Overview

**EchoCareAI PRO** is a full-stack healthcare monitoring platform that uses advanced deep learning to analyze human speech for emotional content and stress indicators. The system combines Meta's **Wav2Vec2** speech representation model with a custom **Bi-LSTM** neural network to perform multi-task prediction — simultaneously classifying emotions and quantifying stress levels from voice recordings.

The platform provides:
- **Real-time voice recording** and analysis via browser microphone
- **Multi-task AI inference** (emotion classification + stress regression)
- **Personalized wellness guidance** from an AI consultant
- **Downloadable PDF wellness reports** per analysis session
- **Historical trend tracking** with interactive charts

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🎤 **Voice Recorder** | In-browser audio capture with live waveform visualization (WaveSurfer.js) |
| 🤖 **Hybrid AI Model** | Wav2Vec2 feature extraction → Bi-LSTM temporal learning → dual prediction heads |
| 📊 **Analytics Dashboard** | Emotion probability charts, stress gauge, and confidence metrics (Chart.js) |
| 💬 **AI Wellness Consultant** | Context-aware chatbot that tailors advice based on detected emotion, stress level, and user history |
| 📄 **PDF Reports** | Auto-generated wellness reports with analysis summary and personalized guidance (ReportLab) |
| 🔐 **User Authentication** | JWT-based signup/login with bcrypt password hashing |
| 📈 **History Tracking** | Per-user analysis history with trend visualization and record management |
| 👤 **Profile Management** | Account settings, session controls, and data privacy features |
| 🎨 **Glassmorphism UI** | Premium dark-mode interface with animations, gradients, and responsive design |

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI** | Async web framework & REST API |
| **SQLAlchemy** | ORM & database management |
| **SQLite** | Lightweight relational database |
| **python-jose** | JWT token generation & validation |
| **passlib + bcrypt** | Secure password hashing |
| **ReportLab** | Dynamic PDF report generation |
| **Uvicorn** | ASGI server |

### AI / ML
| Technology | Purpose |
|---|---|
| **PyTorch** | Deep learning framework |
| **Hugging Face Transformers** | Wav2Vec2 pre-trained model |
| **Librosa** | Audio loading, preprocessing & feature extraction |
| **NumPy / SciPy** | Numerical computation |

### Frontend
| Technology | Purpose |
|---|---|
| **Vanilla JS** | Application logic & API communication |
| **CSS3** | Glassmorphism design, animations & responsive layout |
| **WaveSurfer.js** | Real-time audio waveform visualization |
| **Chart.js** | Emotion probability bar charts |
| **Font Awesome** | Icon library |
| **Google Fonts (Outfit)** | Typography |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (Frontend)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │ Recorder │  │Analytics │  │ History  │  │  Profile   │  │
│  │(WaveSurfer│  │(Chart.js)│  │  Table   │  │ Management │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬──────┘  │
│       │              │             │               │        │
│       └──────────────┴─────────────┴───────────────┘        │
│                          │ REST API (fetch)                  │
└──────────────────────────┼──────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────┐
│                    FastAPI Backend                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │ /api/auth│  │/api/audio│  │/api/     │  │ /api/admin │  │
│  │  signup  │  │  analyze │  │ wellness │  │   stats    │  │
│  │  login   │  │  history │  │  chat    │  │            │  │
│  │          │  │  report  │  │          │  │            │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬──────┘  │
│       │              │             │               │        │
│  ┌────┴──────────────┴─────────────┴───────────────┴──────┐ │
│  │              Core: JWT Auth + SQLAlchemy ORM            │ │
│  └────────────────────────┬────────────────────────────────┘ │
└───────────────────────────┼─────────────────────────────────┘
                            │
              ┌─────────────┼─────────────────┐
              │             │                 │
     ┌────────▼──────┐ ┌───▼──────┐  ┌───────▼───────┐
     │   SQLite DB   │ │ Wav2Vec2 │  │   ReportLab   │
     │ (Users,       │ │    +     │  │  (PDF Gen)    │
     │  AudioRecords)│ │ Bi-LSTM  │  │               │
     └───────────────┘ └──────────┘  └───────────────┘
```

### AI Model Pipeline

```
Audio File (.wav/.mp3/.m4a)
    │
    ▼
┌───────────────────────┐
│  Librosa Preprocessing│  ← Silence trim, amplitude normalization,
│  (16kHz resampling)   │    noise gate, z-score standardization
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│  Wav2Vec2 (facebook/  │  ← Pre-trained speech representation
│  wav2vec2-base-960h)  │    768-dim feature vectors
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│  Bi-LSTM (2 layers)   │  ← Temporal pattern learning
│  256 hidden × 2 dirs  │    512-dim pooled output
└───────────┬───────────┘
            │
      ┌─────┴─────┐
      ▼           ▼
┌──────────┐ ┌──────────┐
│ Emotion  │ │  Stress  │
│   Head   │ │   Head   │
│ (5-class)│ │ (0.0-1.0)│
└──────────┘ └──────────┘
  Happy        Continuous
  Sad          stress score
  Angry
  Fear
  Neutral
```

---

## 📁 Project Structure

```
emo_stress_project/
│
├── app/                          # Backend application
│   ├── main.py                   # FastAPI app entry point, routers & middleware
│   ├── api/                      # REST API endpoints
│   │   ├── auth.py               # POST /signup, /login (JWT auth)
│   │   ├── audio.py              # POST /analyze, GET /history, /report, DELETE /records
│   │   ├── wellness.py           # POST /chat (AI wellness consultant)
│   │   └── admin.py              # GET /stats (admin dashboard metrics)
│   ├── core/
│   │   └── auth.py               # JWT utilities, password hashing, token verification
│   ├── database/
│   │   ├── models.py             # SQLAlchemy models (User, AudioRecord)
│   │   └── session.py            # Database engine, session factory, init_db()
│   ├── ml/
│   │   └── model.py              # EmotionStressModel (Wav2Vec2 + Bi-LSTM) & Predictor
│   ├── templates/
│   │   └── index.html            # Single-page app template (Jinja2)
│   └── utils/
│       └── report_gen.py         # PDF wellness report generator (ReportLab)
│
├── static/                       # Frontend assets
│   ├── css/
│   │   ├── style.css             # Main glassmorphism dark-mode stylesheet
│   │   └── profile.css           # Profile/account management styles
│   ├── js/
│   │   └── main.js               # Core SPA logic: auth, recording, charts, chat
│   └── assets/                   # Static images and media
│
├── data/                         # Runtime data (gitignored)
│   ├── uploads/                  # Uploaded audio files (temporary)
│   └── reports/                  # Generated PDF reports
│
├── run.py                        # Application launcher (uvicorn)
├── requirements.txt              # Python dependencies
├── .gitignore                    # Ignored files (venv, models, db, IDE configs)
└── README.md                     # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.9+**
- **pip** (Python package manager)
- **Git**
- A modern web browser with microphone access

### 1. Clone the Repository

```bash
git clone https://github.com/sejalsahu01/emo_stress_project.git
cd emo_stress_project
```

### 2. Create a Virtual Environment

```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# macOS / Linux
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment (Optional)

Create a `.env` file in the project root for custom settings:

```env
SECRET_KEY=your-super-secret-key-here
GEMINI_API_KEY=your-google-gemini-api-key    # For AI consultant (if using Gemini)
```

### 5. Run the Application

```bash
python run.py
```

The server will start at **http://127.0.0.1:8000**

### 6. Open in Browser

Navigate to `http://127.0.0.1:8000` — you'll be greeted by the EchoCareAI landing page.

1. **Sign up** for a new account
2. **Log in** to access the dashboard
3. **Record** your voice using the microphone button
4. **Analyze** to get emotion + stress predictions
5. **Chat** with the AI Wellness Consultant for personalized advice
6. **Download** PDF reports from your analysis history

---

## 📡 API Reference

All endpoints are prefixed with `/api`. Authentication is via **Bearer JWT tokens** (obtained from `/api/auth/login`).

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/signup` | Register a new user | ❌ |
| `POST` | `/api/auth/login` | Login & receive JWT token | ❌ |

<details>
<summary><b>POST /api/auth/signup</b></summary>

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "message": "User created successfully",
  "username": "johndoe"
}
```
</details>

<details>
<summary><b>POST /api/auth/login</b></summary>

**Request Body:** `application/x-www-form-urlencoded`
- `username`: string
- `password`: string

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```
</details>

---

### Audio Analysis

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/audio/analyze` | Upload & analyze audio file | ✅ |
| `GET` | `/api/audio/history` | Get user's analysis history | ✅ |
| `GET` | `/api/audio/report/{id}` | Download PDF report | ✅ |
| `DELETE` | `/api/audio/records/{id}` | Delete an analysis record | ✅ |

<details>
<summary><b>POST /api/audio/analyze</b></summary>

**Request:** `multipart/form-data`
- `file`: Audio file (`.wav`, `.mp3`, `.m4a`)

**Response (200):**
```json
{
  "id": 1,
  "filename": "recording.wav",
  "timestamp": "2026-05-19T22:30:00",
  "emotion": "Happy",
  "confidence": 0.87,
  "stress_score": 0.23,
  "all_emotions": {
    "Happy": 0.87,
    "Sad": 0.03,
    "Angry": 0.02,
    "Fear": 0.01,
    "Neutral": 0.07
  }
}
```
</details>

---

### Wellness Consultant

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/wellness/chat` | Get AI wellness advice | ✅ |

<details>
<summary><b>POST /api/wellness/chat</b></summary>

**Request Body:**
```json
{
  "message": "I've been feeling stressed lately",
  "emotion": "Sad",
  "stress_score": 0.72
}
```

**Response (200):**
```json
{
  "response": "I sense some tension in your voice...",
  "suggestions": ["4-7-8 Breathing", "Muscle Relaxation", "Listen to Lo-fi"],
  "personalized": true,
  "avg_stress_history": 0.65
}
```
</details>

---

### Admin

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/admin/stats` | Platform usage statistics | ✅ |

---

## 🖼️ Screenshots

### Landing Page
> Premium glassmorphism landing page with feature highlights and animated hero section.

### Dashboard — Voice Recorder
> Real-time waveform visualization with recording controls (record, pause, stop, delete).

### Dashboard — Analytics
> Emotion probability chart, stress gauge, confidence metrics, and AI Wellness Consultant chat.

### Profile Management
> Account settings with personal information, security controls, and session management.

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Use meaningful commit messages
- Add docstrings to new functions
- Test API endpoints before submitting PRs

---

## 📝 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👩‍💻 Author

**Sejal Sahu** — [@sejalsahu01](https://github.com/sejalsahu01)

---

<div align="center">

*Built with ❤️ using FastAPI, PyTorch, and modern web technologies.*

**[⬆ Back to Top](#️-echocareai-pro)**

</div>
]]>

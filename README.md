# 🎙️ EchoCareAI PRO

AI-powered voice analysis platform to detect emotions and stress levels.

---

## 🚀 How It Works

1. **Record**: Speak into your microphone on the dashboard.
2. **Analyze**: The backend pre-processes the voice and predicts:
   - **Emotion**: Happy, Sad, Angry, Fear, Neutral (using Wav2Vec2 + Bi-LSTM)
   - **Stress Level**: Percentage score from 0% to 100%
3. **Get Advice**: Ask the AI Wellness Consultant for personalized suggestions.
4. **Download**: Get a PDF report of your analysis.

---

## 🛠️ Folder Structure

```text
emo_stress_project/
├── app/                  # Python Backend (FastAPI)
│   ├── api/              # API Routes (auth, audio, wellness, admin)
│   ├── core/             # JWT Authentication logic
│   ├── database/         # SQLite DB & models (users, audio_records)
│   ├── ml/               # AI Model (Wav2Vec2 + Bi-LSTM)
│   ├── templates/        # Frontend HTML (index.html)
│   └── utils/            # PDF Report generator
├── static/               # CSS & JavaScript
│   ├── css/              # Styling (style.css, profile.css)
│   └── js/               # Frontend logic (main.js)
├── run.py                # Run command
└── requirements.txt      # Dependencies
```

---

## 🏃 Run Locally

### 1. Setup Virtual Environment
```bash
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate
```

### 2. Install Packages
```bash
pip install -r requirements.txt
```

### 3. Start App
```bash
python run.py
```
Open **http://127.0.0.1:8000** in browser.

---

## 📡 API Endpoints

- **Auth**: `/api/auth/signup` & `/api/auth/login`
- **Audio**: `/api/audio/analyze` (upload), `/api/audio/history` (view), `/api/audio/report/{id}` (PDF download), `/api/audio/records/{id}` (delete)
- **Wellness**: `/api/wellness/chat` (AI consult)
- **Admin**: `/api/admin/stats`

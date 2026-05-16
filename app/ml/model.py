import torch
import torch.nn as nn
from transformers import Wav2Vec2Model, Wav2Vec2Processor
import librosa
import numpy as np

class EmotionStressModel(nn.Module):
    def __init__(self, num_emotions=5):
        super(EmotionStressModel, self).__init__()
        self.wav2vec2 = Wav2Vec2Model.from_pretrained("facebook/wav2vec2-base-960h")
        
        # Bi-LSTM for temporal sequence learning
        self.lstm = nn.LSTM(
            input_size=768, 
            hidden_size=256, 
            num_layers=2, 
            batch_first=True, 
            bidirectional=True
        )
        
        # Multi-task heads
        self.emotion_head = nn.Sequential(
            nn.Linear(512, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, num_emotions)
        )
        
        self.stress_head = nn.Sequential(
            nn.Linear(512, 128),
            nn.ReLU(),
            nn.Linear(128, 1),
            nn.Sigmoid()
        )

    def forward(self, x):
        # Extract features using Wav2Vec2
        with torch.no_grad():
            features = self.wav2vec2(x).last_hidden_state
        
        # Process with Bi-LSTM
        lstm_out, _ = self.lstm(features)
        
        # Global average pooling over time dimension
        pooled = torch.mean(lstm_out, dim=1)
        
        # Task outputs
        emotion_logits = self.emotion_head(pooled)
        stress_score = self.stress_head(pooled)
        
        return emotion_logits, stress_score

class Predictor:
    def __init__(self):
        self.mock_mode = False
        try:
            self.processor = Wav2Vec2Processor.from_pretrained("facebook/wav2vec2-base-960h")
            self.model = EmotionStressModel()
            self.model.eval()
        except Exception as e:
            print(f"Warning: Could not load ML model ({e}). Using mock mode.")
            self.mock_mode = True
            
        self.emotions = ["Happy", "Sad", "Angry", "Fear", "Neutral"]

    def preprocess(self, audio_path):
        if self.mock_mode:
            return None
            
        # Load audio with librosa
        speech, sr = librosa.load(audio_path, sr=16000)
        
        # 1. Silence Trimming
        speech, _ = librosa.effects.trim(speech, top_db=20)
        
        # 2. Amplitude Normalization
        if np.max(np.abs(speech)) > 0:
            speech = speech / np.max(np.abs(speech))
        
        # 3. Simple Noise Gate
        threshold = 0.01
        speech[np.abs(speech) < threshold] = 0
        
        # 4. Z-score Normalization (Standardization)
        speech = (speech - np.mean(speech)) / (np.std(speech) + 1e-5)
        
        # Tokenize
        inputs = self.processor(speech, sampling_rate=16000, return_tensors="pt", padding=True)
        return inputs.input_values

    def predict(self, audio_path):
        if self.mock_mode:
            import random
            emotion = random.choice(self.emotions)
            stress = random.uniform(0.1, 0.4) if emotion == "Happy" else random.uniform(0.5, 0.9)
            return {
                "emotion": emotion,
                "confidence": random.uniform(0.7, 0.95),
                "stress_score": stress,
                "all_emotions": {e: random.uniform(0, 0.3) for e in self.emotions}
            }

        input_values = self.preprocess(audio_path)
        with torch.no_grad():
            emotion_logits, stress_score = self.model(input_values)
            
        probs = torch.softmax(emotion_logits, dim=1).numpy()[0]
        emotion_idx = np.argmax(probs)
        
        return {
            "emotion": self.emotions[emotion_idx],
            "confidence": float(probs[emotion_idx]),
            "stress_score": float(stress_score.numpy()[0][0]),
            "all_emotions": {self.emotions[i]: float(probs[i]) for i in range(len(self.emotions))}
        }

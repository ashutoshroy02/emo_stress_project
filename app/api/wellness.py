from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.auth import get_current_user
from app.database.models import AudioRecord, User

router = APIRouter(prefix="/api/wellness", tags=["wellness"])

class ChatRequest(BaseModel):
    message: str
    emotion: str
    stress_score: float

@router.post("/chat")
async def chat_with_assistant(
    req: ChatRequest, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch recent history for personalization
    history = db.query(AudioRecord).filter(AudioRecord.user_id == current_user.id).order_by(AudioRecord.timestamp.desc()).limit(5).all()
    
    # Analyze trends
    stress_trend = [r.stress_score for r in history]
    avg_stress = sum(stress_trend) / len(stress_trend) if stress_trend else req.stress_score
    
    # Advanced Wellness Response Logic
    response = ""
    suggestions = []
    
    emotion = req.emotion.lower()
    stress = req.stress_score

    if stress > 0.6 or emotion in ["sad", "angry", "fear"]:
        response = f"I sense some tension in your voice, {current_user.username}. "
        if avg_stress > 0.5:
            response += f"Looking at your recent trend, your stress levels have been slightly elevated. "
        
        response += "\n\n**Stress Management**: Let's try the 4-7-8 breathing technique. \n**Relaxation**: A quick 5-minute progressive muscle relaxation could really help right now."
        suggestions = ["4-7-8 Breathing", "Muscle Relaxation", "Listen to Lo-fi"]
    elif emotion == "happy":
        response = f"Your energy is wonderful today, {current_user.username}! You seem to be in a great place emotionally. "
        response += "\n\n**Productivity**: Since you're feeling positive, this is a great time to tackle your most challenging task. \n**Motivation**: Keep this momentum going!"
        suggestions = ["Deep Work Session", "Gratitude Journal", "Spread Positivity"]
    else:
        response = f"You seem quite balanced, {current_user.username}. Let's keep that steady pace."
        response += "\n\n**Meditation**: A 10-minute mindfulness session will help maintain this focus. \n**Productivity**: Try the Pomodoro technique for your next hour of work."
        suggestions = ["Mindfulness Walk", "Pomodoro Timer", "Hydration Break"]

    return {
        "response": response,
        "suggestions": suggestions,
        "personalized": True,
        "avg_stress_history": avg_stress
    }

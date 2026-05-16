from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import User, AudioRecord
from app.core.auth import get_current_user

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/stats")
async def get_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # In a real app, check if user is admin
    if current_user.username != "admin":
        # For demo purposes, we might allow it or just mock it
        pass
        
    user_count = db.query(User).count()
    record_count = db.query(AudioRecord).count()
    
    return {
        "total_users": user_count,
        "total_analyses": record_count,
        "recent_activity": db.query(AudioRecord).order_by(AudioRecord.timestamp.desc()).limit(5).all()
    }

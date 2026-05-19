from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from app.api.audio import router as audio_router
from app.api.wellness import router as wellness_router
from app.api.auth import router as auth_router
from app.api.admin import router as admin_router
import os

from app.database.session import init_db

app = FastAPI(title="EchoCareAI AI", version="1.0.0")

# Initialize Database
@app.on_event("startup")
def startup_event():
    init_db()

# Include routers
app.include_router(audio_router)
app.include_router(wellness_router)
app.include_router(auth_router)
app.include_router(admin_router)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Templates setup
templates = Jinja2Templates(directory="app/templates")

@app.get("/")
async def root(request: Request):
    return templates.TemplateResponse(request=request, name="index.html")

@app.get("/health")
async def health():
    return {"status": "healthy", "model": "Wav2Vec2 + Bi-LSTM"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

import uvicorn
import os
import sys

def get_python_executable():
    venv_python = os.path.join(".venv", "Scripts", "python.exe") if os.name == "nt" else os.path.join(".venv", "bin", "python")
    if os.path.exists(venv_python):
        return venv_python
    return sys.executable

if __name__ == "__main__":
    print("Starting EchoCareAI AI Full-Stack Platform...")
    print("Backend: http://127.0.0.1:8000")
    
    # Run uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

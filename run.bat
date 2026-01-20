@echo off
echo ================================
echo Email-to-Candidate Automation
echo Starting Server
echo ================================
echo.

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Check if .env exists
if not exist .env (
    echo ERROR: .env file not found!
    echo Please run setup.bat first and configure your API keys
    pause
    exit /b 1
)

REM Check if credentials.json exists
if not exist credentials.json (
    echo WARNING: credentials.json not found!
    echo You need to download Gmail API credentials from Google Cloud Console
    echo The app may fail to start without it.
    echo.
    pause
)

echo Starting FastAPI backend on http://localhost:8000
echo.
echo API Documentation: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

@echo off
echo ================================
echo Email-to-Candidate Automation
echo Setup Script
echo ================================
echo.

REM Check Python installation
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.9+ from https://www.python.org/downloads/
    pause
    exit /b 1
)

echo [1/5] Creating virtual environment...
python -m venv venv
if %errorlevel% neq 0 (
    echo ERROR: Failed to create virtual environment
    pause
    exit /b 1
)

echo [2/5] Activating virtual environment...
call venv\Scripts\activate.bat

echo [3/5] Upgrading pip...
python -m pip install --upgrade pip

echo [4/5] Installing dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo [5/5] Creating configuration files...
if not exist .env (
    copy .env.example .env
    echo Created .env file - PLEASE EDIT IT WITH YOUR API KEYS
) else (
    echo .env file already exists
)

REM Create uploads directory
if not exist uploads\resumes (
    mkdir uploads\resumes
    echo Created uploads directory
)

echo.
echo ================================
echo Setup Complete!
echo ================================
echo.
echo NEXT STEPS:
echo 1. Edit .env file and add your GEMINI_API_KEY
echo 2. Download Gmail API credentials (credentials.json) from Google Cloud Console
echo 3. Place credentials.json in the project root
echo 4. Run: run.bat
echo.
pause

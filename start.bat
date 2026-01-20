@echo off
echo ================================
echo Starting Full Application
echo ================================
echo.

REM Start backend in new window
echo [1/2] Starting backend...
start "Backend API" cmd /k "cd /d c:\Lakshya\indeed-crm && call venv\Scripts\activate.bat && cd backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak >nul

REM Start frontend in new window
echo [2/2] Starting frontend...
start "Frontend Next.js" cmd /k "cd /d c:\Lakshya\indeed-crm\frontend-next && npm run dev"

echo.
echo ================================
echo Application Started!
echo ================================
echo.
echo Backend API: http://localhost:8000
echo Frontend UI: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul

#!/bin/bash

# AI-NIDS One-Click Startup Script
echo "=========================================================="
echo "🚀 Starting AI-NIDS: Backend & Frontend"
echo "=========================================================="

# Check virtual environment
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
    ./.venv/bin/python -m pip install -r requirements.txt
fi

# Kill any existing processes on ports 8000 and 5173
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

echo "Starting FastAPI Backend on http://127.0.0.1:8000..."
PYTHONPATH=. ./.venv/bin/python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!

echo "Waiting for Backend to initialize..."
sleep 2

echo "Starting Vite SOC Dashboard on http://127.0.0.1:5173..."
npm run dev --prefix frontend -- --host 127.0.0.1 --port 5173 &
FRONTEND_PID=$!

echo ""
echo "=========================================================="
echo "✅ AI-NIDS is Live!"
echo "   📊 SOC Dashboard:  http://127.0.0.1:5173"
echo "   ⚡ FastAPI Docs:   http://127.0.0.1:8000/docs"
echo "   📄 PDF Guide:      http://127.0.0.1:8000/report/pdf"
echo "=========================================================="
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM
wait

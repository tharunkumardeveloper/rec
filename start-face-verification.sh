#!/bin/bash

# TalentTrack Face Verification System Startup Script

echo "🚀 Starting TalentTrack Face Verification System..."
echo ""

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Install Python dependencies
echo "📦 Installing Python dependencies..."
cd server
pip install -r requirements.txt
cd ..

# Install Node dependencies
echo "📦 Installing Node.js dependencies..."
cd server
npm install
cd ..

# Start DeepFace service in background
echo "🔄 Starting DeepFace service on port 5000..."
cd server
python deepface_service.py &
DEEPFACE_PID=$!
cd ..

# Wait for DeepFace to start
sleep 5

# Start Node.js backend
echo "🔄 Starting Node.js backend on port 3001..."
cd server
node server.js &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo "🔄 Starting frontend..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ All services started!"
echo ""
echo "📡 Services running:"
echo "   - DeepFace API: http://localhost:5000"
echo "   - Backend API: http://localhost:3001"
echo "   - Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for user interrupt
trap "echo ''; echo '🛑 Stopping all services...'; kill $DEEPFACE_PID $BACKEND_PID $FRONTEND_PID; exit" INT

# Keep script running
wait

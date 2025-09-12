#!/bin/bash

# Quick start script for Avalanche Subnet development
echo "🏔️  Starting Avalanche Subnet Development Environment..."

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Start backend in background
echo "🚀 Starting backend server..."
cd "$DIR/backend"
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo "🌐 Starting frontend server..."
cd "$DIR/frontend" 
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Development environment started!"
echo "📊 Backend API: http://localhost:5000"
echo "🌐 Frontend App: http://localhost:3000"
echo "📖 API Docs: http://localhost:5000/api-docs"
echo ""
echo "Press Ctrl+C to stop all servers"

# Handle cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ All servers stopped"
    exit 0
}

trap cleanup INT TERM

# Wait for processes
wait
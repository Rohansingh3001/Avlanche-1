#!/bin/bash

# Avalanche Subnet Development Environment Setup for WSL
echo "🏔️  Setting up Avalanche Subnet Development Environment in WSL..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js and npm
echo "📦 Installing Node.js and npm..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install additional dependencies
echo "📦 Installing system dependencies..."
sudo apt install -y build-essential git curl wget sqlite3 python3 python3-pip

# Install Go (required for AvalancheGo)
echo "📦 Installing Go..."
wget https://go.dev/dl/go1.21.0.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.21.0.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
export PATH=$PATH:/usr/local/go/bin

# Install AvalancheGo
echo "🏔️  Installing AvalancheGo..."
cd ~
git clone https://github.com/ava-labs/avalanchego.git
cd avalanchego
./scripts/build.sh
echo 'export PATH=$PATH:~/avalanchego/build' >> ~/.bashrc

# Install Avalanche CLI
echo "🛠️  Installing Avalanche CLI..."
curl -sSfL https://raw.githubusercontent.com/ava-labs/avalanche-cli/main/scripts/install.sh | sh -s
echo 'export PATH=$PATH:~/bin' >> ~/.bashrc

# Navigate to project directory
echo "📂 Setting up project..."
cd /mnt/c/Users/ROHAN\ SINGH/Desktop/Avlanche

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

# Create startup script
echo "📝 Creating startup script..."
cat > ../start-dev.sh << 'EOF'
#!/bin/bash

# Start Avalanche Subnet Development Environment
echo "🏔️  Starting Avalanche Subnet Development Environment..."

# Start backend in background
echo "🚀 Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start frontend
echo "🌐 Starting frontend server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "✅ Development environment started!"
echo "📊 Backend: http://localhost:5000"
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user interrupt
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
EOF

chmod +x ../start-dev.sh

echo "✅ Setup complete!"
echo ""
echo "🎉 Your Avalanche Subnet development environment is ready!"
echo ""
echo "To start development:"
echo "1. cd /mnt/c/Users/ROHAN\ SINGH/Desktop/Avlanche"
echo "2. ./start-dev.sh"
echo ""
echo "Or manually:"
echo "1. Backend: cd backend && npm run dev"
echo "2. Frontend: cd frontend && npm run dev"
echo ""
echo "🌐 Frontend will be available at: http://localhost:3000"
echo "📊 Backend API will be available at: http://localhost:5000"
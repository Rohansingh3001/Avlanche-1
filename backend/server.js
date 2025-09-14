const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const fs = require('fs-extra');
require('dotenv').config();

// Import routes
const subnetRoutes = require('./routes/subnets');
const contractRoutes = require('./routes/contracts');
const assetRoutes = require('./routes/assets');
const monitoringRoutes = require('./routes/monitoring');
const faucetRoutes = require('./routes/faucet');
const balanceRoutes = require('./routes/balance');

// Import services
const MonitoringService = require('./services/monitoringService');
const DatabaseService = require('./services/databaseService');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize WebSocket server
const wss = new WebSocket.Server({ server });

// Middleware
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    }
}));

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        uptime: process.uptime()
    });
});

// API Routes
app.use('/api/subnets', subnetRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/faucet', faucetRoutes);
app.use('/api/balance', balanceRoutes);

// WebSocket connection handling
const clients = new Set();

wss.on('connection', (ws, req) => {
    console.log('🔌 New WebSocket connection established');
    clients.add(ws);
    
    // Send welcome message
    ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to Avalanche Subnet Monitoring',
        timestamp: new Date().toISOString()
    }));
    
    // Handle client messages
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleWebSocketMessage(ws, data);
        } catch (error) {
            console.error('❌ WebSocket message parsing error:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Invalid message format',
                timestamp: new Date().toISOString()
            }));
        }
    });
    
    // Handle client disconnect
    ws.on('close', () => {
        console.log('🔌 WebSocket connection closed');
        clients.delete(ws);
    });
    
    // Handle connection errors
    ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
        clients.delete(ws);
    });
});

function handleWebSocketMessage(ws, data) {
    switch (data.type) {
        case 'subscribe':
            // Subscribe to specific subnet updates
            ws.subnetId = data.subnetId;
            ws.send(JSON.stringify({
                type: 'subscribed',
                subnetId: data.subnetId,
                message: `Subscribed to subnet ${data.subnetId} updates`,
                timestamp: new Date().toISOString()
            }));
            break;
            
        case 'unsubscribe':
            // Unsubscribe from updates
            delete ws.subnetId;
            ws.send(JSON.stringify({
                type: 'unsubscribed',
                message: 'Unsubscribed from updates',
                timestamp: new Date().toISOString()
            }));
            break;
            
        case 'ping':
            // Heartbeat
            ws.send(JSON.stringify({
                type: 'pong',
                timestamp: new Date().toISOString()
            }));
            break;
            
        default:
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Unknown message type',
                timestamp: new Date().toISOString()
            }));
    }
}

// Broadcast function for sending updates to all connected clients
function broadcast(data, subnetId = null) {
    const message = JSON.stringify({
        ...data,
        timestamp: new Date().toISOString()
    });
    
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            // Send to all clients or only those subscribed to specific subnet
            if (!subnetId || client.subnetId === subnetId) {
                client.send(message);
            }
        }
    });
}

// Make broadcast function available globally
global.broadcast = broadcast;

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Server error:', err);
    
    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal server error',
            ...(isDevelopment && { stack: err.stack }),
            timestamp: new Date().toISOString()
        }
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: {
            message: 'Endpoint not found',
            path: req.originalUrl,
            timestamp: new Date().toISOString()
        }
    });
});

// Initialize services
async function initializeServices() {
    try {
        console.log('🔧 Initializing services...');
        
        // Initialize database
        await DatabaseService.initialize();
        console.log('✅ Database initialized');
        
        // Initialize monitoring service
        const monitoringService = new MonitoringService();
        await monitoringService.start();
        console.log('✅ Monitoring service started');
        
        // Ensure upload directories exist
        await fs.ensureDir(path.join(__dirname, 'uploads', 'contracts'));
        await fs.ensureDir(path.join(__dirname, 'uploads', 'genesis'));
        console.log('✅ Upload directories created');
        
    } catch (error) {
        console.error('❌ Service initialization failed:', error);
        throw error;
    }
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

// Start server
const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await initializeServices();
        
        server.listen(PORT, () => {
            console.log(`
🏔️  Avalanche Subnet Backend Server
🚀 Server running on port ${PORT}
🌐 Environment: ${process.env.NODE_ENV || 'development'}
📊 WebSocket server enabled
🔗 API Base URL: http://localhost:${PORT}/api
🔍 Health Check: http://localhost:${PORT}/health
            `);
            
            // Broadcast server start event
            setTimeout(() => {
                broadcast({
                    type: 'server_status',
                    status: 'online',
                    message: 'Backend server is online and ready'
                });
            }, 1000);
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

if (require.main === module) {
    startServer();
}

module.exports = { app, server, broadcast };

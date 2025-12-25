const express = require('express');
const router = express.Router();

// Mock monitoring data
const generateMockMetrics = () => ({
    cpu: Math.floor(Math.random() * 30) + 60, // 60-90%
    memory: Math.floor(Math.random() * 40) + 50, // 50-90%
    network: Math.floor(Math.random() * 20) + 80, // 80-100%
    storage: Math.floor(Math.random() * 50) + 40, // 40-90%
    latency: Math.floor(Math.random() * 50) + 10, // 10-60ms
    blockHeight: Math.floor(Math.random() * 1000) + 100000,
    peerCount: Math.floor(Math.random() * 20) + 10,
    timestamp: new Date().toISOString()
});

// GET /api/monitoring/health - Get system health
router.get('/health', (req, res) => {
    try {
        const metrics = generateMockMetrics();
        const overall = Math.floor((metrics.cpu + metrics.memory + metrics.network + metrics.storage) / 4);
        
        res.json({
            success: true,
            data: {
                overall,
                status: overall >= 80 ? 'healthy' : overall >= 60 ? 'warning' : 'critical',
                metrics,
                alerts: overall < 80 ? [{
                    id: 'performance-warning',
                    severity: overall < 60 ? 'critical' : 'warning',
                    message: `System performance is ${overall < 60 ? 'critical' : 'degraded'}`,
                    timestamp: new Date().toISOString()
                }] : []
            }
        });
    } catch (error) {
        console.error('Error fetching health metrics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch health metrics'
        });
    }
});

// GET /api/monitoring/metrics - Get detailed metrics
router.get('/metrics', (req, res) => {
    try {
        const { subnet_id, timeRange = '1h' } = req.query;
        
        // Generate time series data
        const dataPoints = timeRange === '1d' ? 24 : timeRange === '1h' ? 60 : 12;
        const metrics = [];
        
        for (let i = 0; i < dataPoints; i++) {
            const timestamp = new Date(Date.now() - (dataPoints - i) * (timeRange === '1d' ? 3600000 : 60000));
            metrics.push({
                ...generateMockMetrics(),
                timestamp: timestamp.toISOString()
            });
        }
        
        res.json({
            success: true,
            data: {
                timeRange,
                dataPoints: metrics.length,
                metrics,
                subnet_id: subnet_id || 'all'
            }
        });
    } catch (error) {
        console.error('Error fetching metrics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch metrics'
        });
    }
});

// GET /api/monitoring/alerts - Get active alerts
router.get('/alerts', (req, res) => {
    try {
        const mockAlerts = [
            {
                id: '1',
                severity: 'warning',
                message: 'High memory usage on subnet DeFi-Chain',
                subnet_id: '1',
                timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
                resolved: false
            },
            {
                id: '2',
                severity: 'info',
                message: 'New validator joined subnet Gaming-Net',
                subnet_id: '2',
                timestamp: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
                resolved: true
            }
        ];
        
        const { severity, resolved } = req.query;
        let filteredAlerts = mockAlerts;
        
        if (severity) {
            filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity);
        }
        
        if (resolved !== undefined) {
            filteredAlerts = filteredAlerts.filter(alert => alert.resolved === (resolved === 'true'));
        }
        
        res.json({
            success: true,
            data: filteredAlerts,
            total: filteredAlerts.length
        });
    } catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch alerts'
        });
    }
});

// GET /api/monitoring/stats - Get system statistics
router.get('/stats', (req, res) => {
    try {
        const stats = {
            uptime: Math.floor(Math.random() * 30) + 90, // 90-120 days
            totalSubnets: 3,
            activeSubnets: 2,
            totalContracts: 15,
            deployedContracts: 12,
            totalAssets: 8,
            totalValidators: 25,
            activeValidators: 23,
            totalTransactions: Math.floor(Math.random() * 10000) + 50000,
            averageBlockTime: 2.1,
            networkHashrate: '1.2 TH/s',
            lastUpdated: new Date().toISOString()
        };
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch stats'
        });
    }
});

module.exports = router;

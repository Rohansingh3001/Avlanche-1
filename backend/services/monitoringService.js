const { ethers } = require('ethers');
const cron = require('node-cron');
const SubnetService = require('./subnetService');
const DatabaseService = require('./databaseService');

class MonitoringService {
    constructor() {
        this.monitoringInterval = null;
        this.metrics = new Map();
        this.healthChecks = new Map();
        this.isRunning = false;
    }

    /**
     * Start the monitoring service
     */
    async start() {
        if (this.isRunning) {
            console.log('⚠️ Monitoring service is already running');
            return;
        }

        try {
            console.log('📊 Starting monitoring service...');

            // Start periodic health checks every 30 seconds
            this.monitoringInterval = setInterval(async () => {
                await this.performHealthChecks();
            }, 30000);

            // Schedule detailed metrics collection every 5 minutes
            cron.schedule('*/5 * * * *', async () => {
                await this.collectMetrics();
            });

            // Schedule cleanup of old metrics every hour
            cron.schedule('0 * * * *', async () => {
                await this.cleanupOldMetrics();
            });

            this.isRunning = true;
            console.log('✅ Monitoring service started successfully');

            // Perform initial health checks
            await this.performHealthChecks();

        } catch (error) {
            console.error('❌ Failed to start monitoring service:', error);
            throw error;
        }
    }

    /**
     * Stop the monitoring service
     */
    stop() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        this.isRunning = false;
        console.log('🛑 Monitoring service stopped');
    }

    /**
     * Get subnet health status
     */
    async getSubnetStatus(subnetId) {
        try {
            const subnet = await SubnetService.getSubnetById(subnetId);
            if (!subnet) {
                throw new Error('Subnet not found');
            }

            const status = {
                subnetId,
                name: subnet.name,
                status: subnet.status,
                lastChecked: new Date().toISOString(),
                isHealthy: false,
                metrics: {
                    blockHeight: 0,
                    gasPrice: '0',
                    peerCount: 0,
                    validatorCount: 0,
                    averageBlockTime: 0,
                    transactionCount: 0
                },
                errors: []
            };

            // Perform live health check if subnet is deployed
            if (subnet.status === 'active' && subnet.deployment?.result?.rpcUrl) {
                try {
                    const healthData = await this.checkSubnetHealth(subnet);
                    status.isHealthy = healthData.isHealthy;
                    status.metrics = { ...status.metrics, ...healthData.metrics };
                    status.errors = healthData.errors;
                } catch (error) {
                    status.errors.push(`Health check failed: ${error.message}`);
                }
            }

            // Get cached metrics from database
            const cachedMetrics = await this.getCachedMetrics(subnetId);
            if (cachedMetrics.length > 0) {
                const latest = cachedMetrics[0];
                status.metrics = { ...status.metrics, ...JSON.parse(latest.metrics) };
            }

            return status;

        } catch (error) {
            console.error('❌ Error getting subnet status:', error);
            throw error;
        }
    }

    /**
     * Get subnet metrics with time-based filtering
     */
    async getSubnetMetrics(subnetId, timeframe = '24h') {
        try {
            const timeframes = {
                '1h': 1,
                '24h': 24,
                '7d': 24 * 7,
                '30d': 24 * 30
            };

            const hoursBack = timeframes[timeframe] || 24;
            const cutoffTime = new Date(Date.now() - (hoursBack * 60 * 60 * 1000)).toISOString();

            const metrics = await DatabaseService.query(`
                SELECT * FROM subnet_metrics 
                WHERE subnet_id = ? AND created_at >= ?
                ORDER BY created_at DESC
            `, [subnetId, cutoffTime]);

            // Process metrics for charts
            const processedMetrics = this.processMetricsForCharts(metrics);

            return {
                timeframe,
                dataPoints: metrics.length,
                latest: metrics[0] ? JSON.parse(metrics[0].metrics) : null,
                historical: processedMetrics,
                summary: this.generateMetricsSummary(metrics)
            };

        } catch (error) {
            console.error('❌ Error getting subnet metrics:', error);
            throw error;
        }
    }

    /**
     * Perform health checks on all active subnets
     */
    async performHealthChecks() {
        try {
            const activeSubnets = await SubnetService.getSubnets({ status: 'active' });

            for (const subnet of activeSubnets) {
                try {
                    await this.checkAndUpdateSubnetHealth(subnet);
                } catch (error) {
                    console.error(`❌ Health check failed for subnet ${subnet.name}:`, error);
                }
            }

        } catch (error) {
            console.error('❌ Error performing health checks:', error);
        }
    }

    /**
     * Check individual subnet health
     */
    async checkSubnetHealth(subnet) {
        const provider = await SubnetService.getProvider(subnet.id);
        const healthData = {
            isHealthy: false,
            metrics: {},
            errors: []
        };

        try {
            // Check basic connectivity
            const network = await provider.getNetwork();
            healthData.metrics.chainId = network.chainId.toString();

            // Get latest block
            const blockNumber = await provider.getBlockNumber();
            healthData.metrics.blockHeight = blockNumber;

            // Get latest block details
            const block = await provider.getBlock(blockNumber);
            if (block) {
                healthData.metrics.lastBlockTime = new Date(block.timestamp * 1000).toISOString();
                healthData.metrics.gasUsed = block.gasUsed.toString();
                healthData.metrics.gasLimit = block.gasLimit.toString();
                healthData.metrics.transactionCount = block.transactions.length;
            }

            // Calculate average block time (last 10 blocks)
            const avgBlockTime = await this.calculateAverageBlockTime(provider, blockNumber);
            healthData.metrics.averageBlockTime = avgBlockTime;

            // Get gas price
            const gasPrice = await provider.getFeeData();
            healthData.metrics.gasPrice = gasPrice.gasPrice?.toString() || '0';

            // Get network peer count (if available)
            try {
                const peerCount = await provider.send('net_peerCount', []);
                healthData.metrics.peerCount = parseInt(peerCount, 16);
            } catch (error) {
                healthData.metrics.peerCount = 0;
            }

            healthData.isHealthy = true;

        } catch (error) {
            healthData.errors.push(error.message);
            console.error(`❌ Health check error for ${subnet.name}:`, error);
        }

        return healthData;
    }

    /**
     * Check and update subnet health in database
     */
    async checkAndUpdateSubnetHealth(subnet) {
        try {
            const healthData = await this.checkSubnetHealth(subnet);
            
            // Update subnet status if unhealthy
            if (!healthData.isHealthy && subnet.status === 'active') {
                await SubnetService.updateSubnetStatus(subnet.id, 'unhealthy');
            } else if (healthData.isHealthy && subnet.status === 'unhealthy') {
                await SubnetService.updateSubnetStatus(subnet.id, 'active');
            }

            // Store health check result
            await DatabaseService.query(`
                INSERT INTO health_checks (subnet_id, is_healthy, metrics, errors, created_at)
                VALUES (?, ?, ?, ?, ?)
            `, [
                subnet.id,
                healthData.isHealthy ? 1 : 0,
                JSON.stringify(healthData.metrics),
                JSON.stringify(healthData.errors),
                new Date().toISOString()
            ]);

            // Broadcast health update
            global.broadcast({
                type: 'subnet_health_update',
                subnetId: subnet.id,
                data: {
                    isHealthy: healthData.isHealthy,
                    metrics: healthData.metrics,
                    errors: healthData.errors
                }
            }, subnet.id);

        } catch (error) {
            console.error(`❌ Error updating health for subnet ${subnet.name}:`, error);
        }
    }

    /**
     * Collect detailed metrics for all subnets
     */
    async collectMetrics() {
        try {
            console.log('📈 Collecting detailed metrics...');
            const activeSubnets = await SubnetService.getSubnets({ status: 'active' });

            for (const subnet of activeSubnets) {
                try {
                    await this.collectSubnetMetrics(subnet);
                } catch (error) {
                    console.error(`❌ Metrics collection failed for subnet ${subnet.name}:`, error);
                }
            }

        } catch (error) {
            console.error('❌ Error collecting metrics:', error);
        }
    }

    /**
     * Collect metrics for specific subnet
     */
    async collectSubnetMetrics(subnet) {
        try {
            const provider = await SubnetService.getProvider(subnet.id);
            const blockNumber = await provider.getBlockNumber();
            
            // Get multiple blocks for trend analysis
            const blocks = await Promise.all([
                provider.getBlock(blockNumber),
                provider.getBlock(blockNumber - 1),
                provider.getBlock(blockNumber - 10),
                provider.getBlock(blockNumber - 100)
            ].filter(async (promise, index) => {
                try {
                    await promise;
                    return true;
                } catch {
                    return false;
                }
            }));

            const metrics = {
                timestamp: new Date().toISOString(),
                blockHeight: blockNumber,
                blockTime: blocks[0] ? new Date(blocks[0].timestamp * 1000).toISOString() : null,
                gasUsed: blocks[0]?.gasUsed.toString() || '0',
                gasLimit: blocks[0]?.gasLimit.toString() || '0',
                transactionCount: blocks[0]?.transactions.length || 0,
                averageBlockTime: await this.calculateAverageBlockTime(provider, blockNumber),
                networkHashRate: await this.estimateHashRate(blocks),
                activeValidators: await this.getValidatorCount(subnet.id),
                tokenSupply: await this.getTokenSupply(provider),
                networkUtilization: this.calculateNetworkUtilization(blocks[0])
            };

            // Store metrics in database
            await DatabaseService.query(`
                INSERT INTO subnet_metrics (subnet_id, metrics, created_at)
                VALUES (?, ?, ?)
            `, [
                subnet.id,
                JSON.stringify(metrics),
                new Date().toISOString()
            ]);

            console.log(`📊 Metrics collected for subnet ${subnet.name}`);

        } catch (error) {
            console.error(`❌ Error collecting metrics for subnet ${subnet.name}:`, error);
        }
    }

    /**
     * Calculate average block time
     */
    async calculateAverageBlockTime(provider, currentBlock, sampleSize = 10) {
        try {
            if (currentBlock < sampleSize) {
                return 0;
            }

            const [latestBlock, olderBlock] = await Promise.all([
                provider.getBlock(currentBlock),
                provider.getBlock(currentBlock - sampleSize)
            ]);

            if (!latestBlock || !olderBlock) {
                return 0;
            }

            const timeDiff = latestBlock.timestamp - olderBlock.timestamp;
            return Math.round(timeDiff / sampleSize);

        } catch (error) {
            return 0;
        }
    }

    /**
     * Estimate network hash rate
     */
    async estimateHashRate(blocks) {
        // This is a simplified estimation for SubnetEVM
        // In a real implementation, this would depend on the consensus mechanism
        if (blocks.length < 2) return 0;
        
        try {
            const timeDiff = blocks[0].timestamp - blocks[1].timestamp;
            return timeDiff > 0 ? Math.round(1 / timeDiff * 1000) : 0;
        } catch {
            return 0;
        }
    }

    /**
     * Get validator count
     */
    async getValidatorCount(subnetId) {
        try {
            const [result] = await DatabaseService.query(
                'SELECT COUNT(*) as count FROM validators WHERE subnet_id = ?',
                [subnetId]
            );
            return result?.count || 0;
        } catch {
            return 0;
        }
    }

    /**
     * Get token supply
     */
    async getTokenSupply(provider) {
        try {
            // For native token, we would need specific contract calls
            // This is a placeholder implementation
            return '0';
        } catch {
            return '0';
        }
    }

    /**
     * Calculate network utilization
     */
    calculateNetworkUtilization(block) {
        if (!block || !block.gasUsed || !block.gasLimit) {
            return 0;
        }
        
        const gasUsed = parseFloat(block.gasUsed.toString());
        const gasLimit = parseFloat(block.gasLimit.toString());
        
        return Math.round((gasUsed / gasLimit) * 100);
    }

    /**
     * Get cached metrics from database
     */
    async getCachedMetrics(subnetId, limit = 1) {
        return await DatabaseService.query(`
            SELECT * FROM subnet_metrics 
            WHERE subnet_id = ? 
            ORDER BY created_at DESC 
            LIMIT ?
        `, [subnetId, limit]);
    }

    /**
     * Process metrics for chart visualization
     */
    processMetricsForCharts(metrics) {
        const chartData = {
            blockHeight: [],
            transactionCount: [],
            gasUsage: [],
            blockTime: [],
            networkUtilization: []
        };

        metrics.reverse().forEach(metric => {
            const data = JSON.parse(metric.metrics);
            const timestamp = new Date(metric.created_at).getTime();

            chartData.blockHeight.push({ x: timestamp, y: data.blockHeight || 0 });
            chartData.transactionCount.push({ x: timestamp, y: data.transactionCount || 0 });
            chartData.gasUsage.push({ x: timestamp, y: parseInt(data.gasUsed || '0') });
            chartData.blockTime.push({ x: timestamp, y: data.averageBlockTime || 0 });
            chartData.networkUtilization.push({ x: timestamp, y: data.networkUtilization || 0 });
        });

        return chartData;
    }

    /**
     * Generate metrics summary
     */
    generateMetricsSummary(metrics) {
        if (metrics.length === 0) {
            return {
                averageBlockTime: 0,
                totalTransactions: 0,
                averageGasUsage: 0,
                uptimePercentage: 0
            };
        }

        const data = metrics.map(m => JSON.parse(m.metrics));
        
        return {
            averageBlockTime: data.reduce((sum, d) => sum + (d.averageBlockTime || 0), 0) / data.length,
            totalTransactions: data.reduce((sum, d) => sum + (d.transactionCount || 0), 0),
            averageGasUsage: data.reduce((sum, d) => sum + parseInt(d.gasUsed || '0'), 0) / data.length,
            uptimePercentage: 100 // Simplified - would need more sophisticated calculation
        };
    }

    /**
     * Clean up old metrics
     */
    async cleanupOldMetrics() {
        try {
            const cutoffDate = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)).toISOString();
            
            await DatabaseService.query(
                'DELETE FROM subnet_metrics WHERE created_at < ?',
                [cutoffDate]
            );

            await DatabaseService.query(
                'DELETE FROM health_checks WHERE created_at < ?',
                [cutoffDate]
            );

            console.log('🧹 Old metrics cleaned up');
        } catch (error) {
            console.error('❌ Error cleaning up old metrics:', error);
        }
    }
}

module.exports = MonitoringService;

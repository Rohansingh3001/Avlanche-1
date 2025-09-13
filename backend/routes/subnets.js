const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const SubnetService = require('../services/subnetService');
const MonitoringService = require('../services/monitoringService');

const router = express.Router();

// Validation middleware
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: {
                message: 'Validation failed',
                details: errors.array(),
                timestamp: new Date().toISOString()
            }
        });
    }
    next();
};

/**
 * GET /api/subnets
 * List all subnets
 */
router.get('/', 
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'inactive', 'deploying', 'error']),
    validateRequest,
    async (req, res) => {
        try {
            const { page = 1, limit = 10, status } = req.query;
            const subnets = await SubnetService.getSubnets({
                page: parseInt(page),
                limit: parseInt(limit),
                status
            });
            
            res.json({
                data: subnets,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: subnets.length
                },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Error fetching subnets:', error);
            res.status(500).json({
                error: {
                    message: 'Failed to fetch subnets',
                    details: error.message,
                    timestamp: new Date().toISOString()
                }
            });
        }
    }
);

/**
 * GET /api/subnets/:id
 * Get specific subnet details
 */
router.get('/:id',
    param('id').notEmpty().withMessage('Subnet ID is required'),
    validateRequest,
    async (req, res) => {
        try {
            const subnet = await SubnetService.getSubnetById(req.params.id);
            
            if (!subnet) {
                return res.status(404).json({
                    error: {
                        message: 'Subnet not found',
                        subnetId: req.params.id,
                        timestamp: new Date().toISOString()
                    }
                });
            }
            
            res.json({
                data: subnet,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Error fetching subnet:', error);
            res.status(500).json({
                error: {
                    message: 'Failed to fetch subnet',
                    details: error.message,
                    timestamp: new Date().toISOString()
                }
            });
        }
    }
);

/**
 * POST /api/subnets
 * Create a new subnet
 */
router.post('/',
    body('name').trim().isLength({ min: 3, max: 50 }).withMessage('Name must be 3-50 characters'),
    body('description').optional().trim().isLength({ max: 500 }),
    body('chainId').isInt({ min: 1 }).withMessage('Chain ID must be a positive integer'),
    body('vmType').isIn(['SubnetEVM', 'SpacesVM', 'Custom']).withMessage('Invalid VM type'),
    body('networkId').optional().isInt({ min: 1 }),
    body('validators.minValidators').optional().isInt({ min: 1 }),
    body('validators.maxValidators').optional().isInt({ min: 1 }),
    body('validators.minStake').optional().isFloat({ min: 1 }),
    validateRequest,
    async (req, res) => {
        try {
            const subnetData = {
                name: req.body.name,
                description: req.body.description,
                chainId: req.body.chainId,
                vmType: req.body.vmType,
                networkId: req.body.networkId || 1337,
                validators: req.body.validators || {},
                token: req.body.token || {},
                deployment: req.body.deployment || { target: 'local' },
                status: 'creating'
            };
            
            const subnet = await SubnetService.createSubnet(subnetData);
            
            // Broadcast subnet creation event
            global.broadcast({
                type: 'subnet_created',
                data: subnet,
                message: `Subnet ${subnet.name} created successfully`
            });
            
            res.status(201).json({
                data: subnet,
                message: 'Subnet created successfully',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Error creating subnet:', error);
            res.status(500).json({
                error: {
                    message: 'Failed to create subnet',
                    details: error.message,
                    timestamp: new Date().toISOString()
                }
            });
        }
    }
);

/**
 * POST /api/subnets/:id/deploy
 * Deploy a subnet
 */
router.post('/:id/deploy',
    param('id').notEmpty().withMessage('Subnet ID is required'),
    body('target').isIn(['local', 'fuji', 'mainnet']).withMessage('Invalid deployment target'),
    body('autoStart').optional().isBoolean(),
    validateRequest,
    async (req, res) => {
        try {
            const { target, autoStart = true } = req.body;
            const subnetId = req.params.id;
            
            // Update subnet status to deploying
            await SubnetService.updateSubnetStatus(subnetId, 'deploying');
            
            // Broadcast deployment start
            global.broadcast({
                type: 'subnet_deployment_started',
                subnetId,
                target,
                message: `Deployment to ${target} started`
            }, subnetId);
            
            // Start deployment in background
            SubnetService.deploySubnet(subnetId, target, autoStart)
                .then(result => {
                    global.broadcast({
                        type: 'subnet_deployment_completed',
                        subnetId,
                        data: result,
                        message: `Subnet deployed successfully to ${target}`
                    }, subnetId);
                })
                .catch(error => {
                    console.error('❌ Deployment failed:', error);
                    SubnetService.updateSubnetStatus(subnetId, 'error');
                    global.broadcast({
                        type: 'subnet_deployment_failed',
                        subnetId,
                        error: error.message,
                        message: 'Deployment failed'
                    }, subnetId);
                });
            
            res.json({
                message: 'Deployment started',
                subnetId,
                target,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Error starting deployment:', error);
            res.status(500).json({
                error: {
                    message: 'Failed to start deployment',
                    details: error.message,
                    timestamp: new Date().toISOString()
                }
            });
        }
    }
);

/**
 * GET /api/subnets/:id/status
 * Get subnet health status
 */
router.get('/:id/status',
    param('id').notEmpty().withMessage('Subnet ID is required'),
    validateRequest,
    async (req, res) => {
        try {
            const status = await MonitoringService.getSubnetStatus(req.params.id);
            
            res.json({
                data: status,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Error fetching subnet status:', error);
            res.status(500).json({
                error: {
                    message: 'Failed to fetch subnet status',
                    details: error.message,
                    timestamp: new Date().toISOString()
                }
            });
        }
    }
);

/**
 * GET /api/subnets/:id/metrics
 * Get subnet metrics and analytics
 */
router.get('/:id/metrics',
    param('id').notEmpty().withMessage('Subnet ID is required'),
    query('timeframe').optional().isIn(['1h', '24h', '7d', '30d']),
    validateRequest,
    async (req, res) => {
        try {
            const { timeframe = '24h' } = req.query;
            const metrics = await MonitoringService.getSubnetMetrics(req.params.id, timeframe);
            
            res.json({
                data: metrics,
                timeframe,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Error fetching subnet metrics:', error);
            res.status(500).json({
                error: {
                    message: 'Failed to fetch subnet metrics',
                    details: error.message,
                    timestamp: new Date().toISOString()
                }
            });
        }
    }
);

/**
 * PUT /api/subnets/:id
 * Update subnet configuration
 */
router.put('/:id',
    param('id').notEmpty().withMessage('Subnet ID is required'),
    body('name').optional().trim().isLength({ min: 3, max: 50 }),
    body('description').optional().trim().isLength({ max: 500 }),
    body('blockTime').optional().isFloat({ min: 0.5, max: 10 }),
    body('gasLimit').optional().isInt({ min: 1000000, max: 100000000 }),
    body('tokenName').optional().trim().isLength({ min: 1, max: 50 }),
    body('tokenSymbol').optional().trim().isLength({ min: 1, max: 10 }),
    body('validators').optional().isInt({ min: 1, max: 100 }),
    validateRequest,
    async (req, res) => {
        try {
            const updates = {};
            if (req.body.name) updates.name = req.body.name;
            if (req.body.description) updates.description = req.body.description;
            if (req.body.blockTime) updates.block_time = req.body.blockTime;
            if (req.body.gasLimit) updates.gas_limit = req.body.gasLimit;
            if (req.body.tokenName) updates.token_name = req.body.tokenName;
            if (req.body.tokenSymbol) updates.token_symbol = req.body.tokenSymbol;
            if (req.body.validators) updates.min_validators = req.body.validators;
            
            const subnet = await SubnetService.updateSubnet(req.params.id, updates);
            
            // Broadcast subnet update
            global.broadcast({
                type: 'subnet_updated',
                data: subnet,
                message: `Subnet ${subnet.name} updated`
            });
            
            res.json({
                data: subnet,
                message: 'Subnet updated successfully',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Error updating subnet:', error);
            res.status(500).json({
                error: {
                    message: 'Failed to update subnet',
                    details: error.message,
                    timestamp: new Date().toISOString()
                }
            });
        }
    }
);

/**
 * DELETE /api/subnets/:id
 * Delete a subnet
 */
router.delete('/:id',
    param('id').notEmpty().withMessage('Subnet ID is required'),
    validateRequest,
    async (req, res) => {
        try {
            await SubnetService.deleteSubnet(req.params.id);
            
            // Broadcast subnet deletion
            global.broadcast({
                type: 'subnet_deleted',
                subnetId: req.params.id,
                message: 'Subnet deleted successfully'
            });
            
            res.json({
                message: 'Subnet deleted successfully',
                subnetId: req.params.id,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Error deleting subnet:', error);
            res.status(500).json({
                error: {
                    message: 'Failed to delete subnet',
                    details: error.message,
                    timestamp: new Date().toISOString()
                }
            });
        }
    }
);

/**
 * POST /api/subnets/:id/validators
 * Add validator to subnet
 */
router.post('/:id/validators',
    param('id').notEmpty().withMessage('Subnet ID is required'),
    body('nodeId').notEmpty().withMessage('Node ID is required'),
    body('weight').optional().isInt({ min: 1 }),
    body('start').optional().isISO8601(),
    body('end').optional().isISO8601(),
    validateRequest,
    async (req, res) => {
        try {
            const validator = await SubnetService.addValidator(req.params.id, req.body);
            
            res.json({
                data: validator,
                message: 'Validator added successfully',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Error adding validator:', error);
            res.status(500).json({
                error: {
                    message: 'Failed to add validator',
                    details: error.message,
                    timestamp: new Date().toISOString()
                }
            });
        }
    }
);

module.exports = router;

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const solc = require('solc');
const { body, param, validationResult } = require('express-validator');
const ContractService = require('../services/contractService');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads/contracts');
        fs.ensureDir(uploadPath).then(() => {
            cb(null, uploadPath);
        }).catch(cb);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        cb(null, `${timestamp}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/plain' || path.extname(file.originalname) === '.sol') {
            cb(null, true);
        } else {
            cb(new Error('Only Solidity (.sol) files are allowed'));
        }
    }
});

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
 * GET /api/contracts
 * List all contracts
 */
router.get('/', async (req, res) => {
    try {
        const { subnetId, status } = req.query;
        const contracts = await ContractService.getContracts({ subnetId, status });
        
        res.json({
            data: contracts,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error fetching contracts:', error);
        res.status(500).json({
            error: {
                message: 'Failed to fetch contracts',
                details: error.message,
                timestamp: new Date().toISOString()
            }
        });
    }
});

/**
 * GET /api/contracts/:id
 * Get specific contract details
 */
router.get('/:id',
    param('id').notEmpty().withMessage('Contract ID is required'),
    validateRequest,
    async (req, res) => {
        try {
            const contract = await ContractService.getContractById(req.params.id);
            
            if (!contract) {
                return res.status(404).json({
                    error: {
                        message: 'Contract not found',
                        contractId: req.params.id,
                        timestamp: new Date().toISOString()
                    }
                });
            }
            
            res.json({
                data: contract,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Error fetching contract:', error);
            res.status(500).json({
                error: {
                    message: 'Failed to fetch contract',
                    details: error.message,
                    timestamp: new Date().toISOString()
                }
            });
        }
    }
);

/**
 * POST /api/contracts/upload
 * Upload contract source code
 */
router.post('/upload',
    upload.single('contract'),
    body('subnetId').notEmpty().withMessage('Subnet ID is required'),
    body('name').optional().trim().isLength({ min: 1, max: 100 }),
    validateRequest,
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    error: {
                        message: 'No contract file uploaded',
                        timestamp: new Date().toISOString()
                    }
                });
            }

            const sourceCode = await fs.readFile(req.file.path, 'utf8');
            const contractName = req.body.name || path.basename(req.file.originalname, '.sol');

            const contract = await ContractService.uploadContract({
                subnetId: req.body.subnetId,
                name: contractName,
                sourceCode,
                fileName: req.file.originalname,
                filePath: req.file.path
            });

            res.status(201).json({
                data: contract,
                message: 'Contract uploaded successfully',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Error uploading contract:', error);
            res.status(500).json({
                error: {
                    message: 'Failed to upload contract',
                    details: error.message,
                    timestamp: new Date().toISOString()
                }
            });
        }
    }
);

/**
 * POST /api/contracts/compile
 * Compile contract source code
 */
router.post('/compile',
    body('sourceCode').notEmpty().withMessage('Source code is required'),
    body('contractName').optional().trim().isLength({ min: 1, max: 100 }),
    body('compilerVersion').optional().matches(/^0\.\d+\.\d+$/).withMessage('Invalid compiler version'),
    validateRequest,
    async (req, res) => {
        try {
            const { sourceCode, contractName, compilerVersion = '0.8.21' } = req.body;
            
            const compilationResult = await ContractService.compileContract(
                sourceCode,
                contractName,
                compilerVersion
            );

            res.json({
                data: compilationResult,
                message: 'Contract compiled successfully',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Error compiling contract:', error);
            res.status(500).json({
                error: {
                    message: 'Failed to compile contract',
                    details: error.message,
                    timestamp: new Date().toISOString()
                }
            });
        }
    }
);

/**
 * POST /api/contracts/deploy
 * Deploy compiled contract
 */
router.post('/deploy',
    body('contractId').notEmpty().withMessage('Contract ID is required'),
    body('constructorArgs').optional().isArray(),
    body('gasLimit').optional().isInt({ min: 21000 }),
    body('gasPrice').optional().isNumeric(),
    validateRequest,
    async (req, res) => {
        try {
            const { contractId, constructorArgs = [], gasLimit, gasPrice } = req.body;
            
            const deploymentResult = await ContractService.deployContract(
                contractId,
                constructorArgs,
                { gasLimit, gasPrice }
            );

            // Broadcast deployment event
            global.broadcast({
                type: 'contract_deployed',
                data: deploymentResult,
                message: `Contract deployed successfully`
            });

            res.json({
                data: deploymentResult,
                message: 'Contract deployed successfully',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Error deploying contract:', error);
            res.status(500).json({
                error: {
                    message: 'Failed to deploy contract',
                    details: error.message,
                    timestamp: new Date().toISOString()
                }
            });
        }
    }
);

/**
 * POST /api/contracts/:id/interact
 * Interact with deployed contract
 */
router.post('/:id/interact',
    param('id').notEmpty().withMessage('Contract ID is required'),
    body('method').notEmpty().withMessage('Method name is required'),
    body('args').optional().isArray(),
    body('value').optional().isNumeric(),
    validateRequest,
    async (req, res) => {
        try {
            const { method, args = [], value = 0 } = req.body;
            
            const result = await ContractService.interactWithContract(
                req.params.id,
                method,
                args,
                value
            );

            res.json({
                data: result,
                message: 'Contract interaction successful',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Error interacting with contract:', error);
            res.status(500).json({
                error: {
                    message: 'Failed to interact with contract',
                    details: error.message,
                    timestamp: new Date().toISOString()
                }
            });
        }
    }
);

/**
 * GET /api/contracts/:id/abi
 * Get contract ABI
 */
router.get('/:id/abi',
    param('id').notEmpty().withMessage('Contract ID is required'),
    validateRequest,
    async (req, res) => {
        try {
            const abi = await ContractService.getContractABI(req.params.id);
            
            res.json({
                data: abi,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Error fetching contract ABI:', error);
            res.status(500).json({
                error: {
                    message: 'Failed to fetch contract ABI',
                    details: error.message,
                    timestamp: new Date().toISOString()
                }
            });
        }
    }
);

/**
 * GET /api/contracts/:id/events
 * Get contract events
 */
router.get('/:id/events',
    param('id').notEmpty().withMessage('Contract ID is required'),
    validateRequest,
    async (req, res) => {
        try {
            const { fromBlock = 'earliest', toBlock = 'latest' } = req.query;
            
            const events = await ContractService.getContractEvents(
                req.params.id,
                fromBlock,
                toBlock
            );
            
            res.json({
                data: events,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Error fetching contract events:', error);
            res.status(500).json({
                error: {
                    message: 'Failed to fetch contract events',
                    details: error.message,
                    timestamp: new Date().toISOString()
                }
            });
        }
    }
);

/**
 * DELETE /api/contracts/:id
 * Delete contract
 */
router.delete('/:id',
    param('id').notEmpty().withMessage('Contract ID is required'),
    validateRequest,
    async (req, res) => {
        try {
            await ContractService.deleteContract(req.params.id);
            
            res.json({
                message: 'Contract deleted successfully',
                contractId: req.params.id,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Error deleting contract:', error);
            res.status(500).json({
                error: {
                    message: 'Failed to delete contract',
                    details: error.message,
                    timestamp: new Date().toISOString()
                }
            });
        }
    }
);

/**
 * GET /api/contracts/templates
 * Get contract templates
 */
router.get('/templates', async (req, res) => {
    try {
        const templates = await ContractService.getContractTemplates();
        
        res.json({
            data: templates,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error fetching contract templates:', error);
        res.status(500).json({
            error: {
                message: 'Failed to fetch contract templates',
                details: error.message,
                timestamp: new Date().toISOString()
            }
        });
    }
});

module.exports = router;

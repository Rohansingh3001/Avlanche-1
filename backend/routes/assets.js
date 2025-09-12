const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Mock asset data storage
let assets = [
    {
        id: '1',
        name: 'Avalanche Token',
        symbol: 'AVAX',
        type: 'token',
        address: '0x1234567890123456789012345678901234567890',
        subnet_id: '1',
        totalSupply: 1000000,
        decimals: 18,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];

// GET /api/assets - Get all assets
router.get('/', (req, res) => {
    try {
        const { subnet_id, type } = req.query;
        let filteredAssets = assets;
        
        if (subnet_id) {
            filteredAssets = filteredAssets.filter(asset => asset.subnet_id === subnet_id);
        }
        
        if (type) {
            filteredAssets = filteredAssets.filter(asset => asset.type === type);
        }
        
        res.json({
            success: true,
            data: filteredAssets,
            total: filteredAssets.length
        });
    } catch (error) {
        console.error('Error fetching assets:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch assets'
        });
    }
});

// GET /api/assets/:id - Get specific asset
router.get('/:id', (req, res) => {
    try {
        const asset = assets.find(a => a.id === req.params.id);
        
        if (!asset) {
            return res.status(404).json({
                success: false,
                error: 'Asset not found'
            });
        }
        
        res.json({
            success: true,
            data: asset
        });
    } catch (error) {
        console.error('Error fetching asset:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch asset'
        });
    }
});

// POST /api/assets - Create new asset
router.post('/', [
    body('name').notEmpty().withMessage('Asset name is required'),
    body('symbol').notEmpty().withMessage('Asset symbol is required'),
    body('type').isIn(['token', 'nft']).withMessage('Asset type must be token or nft'),
    body('subnet_id').notEmpty().withMessage('Subnet ID is required')
], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        const { name, symbol, type, subnet_id, totalSupply, decimals } = req.body;
        
        const newAsset = {
            id: (assets.length + 1).toString(),
            name,
            symbol,
            type,
            address: `0x${Math.random().toString(16).substr(2, 40)}`,
            subnet_id,
            totalSupply: totalSupply || 0,
            decimals: decimals || 18,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        assets.push(newAsset);
        
        res.status(201).json({
            success: true,
            data: newAsset,
            message: 'Asset created successfully'
        });
    } catch (error) {
        console.error('Error creating asset:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create asset'
        });
    }
});

// PUT /api/assets/:id - Update asset
router.put('/:id', [
    body('name').optional().notEmpty().withMessage('Asset name cannot be empty'),
    body('symbol').optional().notEmpty().withMessage('Asset symbol cannot be empty')
], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        const assetIndex = assets.findIndex(a => a.id === req.params.id);
        
        if (assetIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Asset not found'
            });
        }
        
        assets[assetIndex] = {
            ...assets[assetIndex],
            ...req.body,
            updated_at: new Date().toISOString()
        };
        
        res.json({
            success: true,
            data: assets[assetIndex],
            message: 'Asset updated successfully'
        });
    } catch (error) {
        console.error('Error updating asset:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update asset'
        });
    }
});

// DELETE /api/assets/:id - Delete asset
router.delete('/:id', (req, res) => {
    try {
        const assetIndex = assets.findIndex(a => a.id === req.params.id);
        
        if (assetIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Asset not found'
            });
        }
        
        const deletedAsset = assets.splice(assetIndex, 1)[0];
        
        res.json({
            success: true,
            data: deletedAsset,
            message: 'Asset deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting asset:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete asset'
        });
    }
});

module.exports = router;

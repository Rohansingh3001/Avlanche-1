const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize database connection
const dbPath = path.join(__dirname, '../data/avalanche-subnets.db');
const db = new sqlite3.Database(dbPath);

// Initialize faucet table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS faucet_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      address TEXT NOT NULL,
      token_symbol TEXT NOT NULL,
      amount TEXT NOT NULL,
      tx_hash TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      network TEXT DEFAULT 'fuji'
    )
  `);
});

// Available tokens configuration
const AVAILABLE_TOKENS = {
  'AVAX': {
    symbol: 'AVAX',
    name: 'Avalanche',
    amount: '10',
    network: 'fuji',
    isNative: true,
  },
  'USDC': {
    symbol: 'USDC',
    name: 'USD Coin',
    amount: '1000',
    network: 'fuji',
    address: '0x5425890298aed601595a70AB815c96711a31Bc65',
    isNative: false,
  },
  'WAVAX': {
    symbol: 'WAVAX',
    name: 'Wrapped AVAX',
    amount: '5',
    network: 'fuji',
    address: '0x1D308089a2D1Ced3f1Ce36B1FcaF815b07217be3',
    isNative: false,
  },
  'TEST': {
    symbol: 'TEST',
    name: 'Test Token',
    amount: '10000',
    network: 'local',
    address: '0x0000000000000000000000000000000000000000',
    isNative: false,
  },
};

// Cooldown period (24 hours in milliseconds)
const COOLDOWN_PERIOD = 24 * 60 * 60 * 1000;

// Get available tokens
router.get('/tokens', (req, res) => {
  try {
    const tokens = Object.values(AVAILABLE_TOKENS);
    res.json({
      success: true,
      data: tokens,
    });
  } catch (error) {
    console.error('Error fetching faucet tokens:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available tokens',
      error: error.message,
    });
  }
});

// Check if address can request tokens
router.get('/check-eligibility/:address/:token', (req, res) => {
  const { address, token } = req.params;
  
  if (!address || !token || !AVAILABLE_TOKENS[token.toUpperCase()]) {
    return res.status(400).json({
      success: false,
      message: 'Invalid address or token symbol',
    });
  }

  const query = `
    SELECT created_at 
    FROM faucet_requests 
    WHERE address = ? AND token_symbol = ? AND status = 'completed'
    ORDER BY created_at DESC 
    LIMIT 1
  `;

  db.get(query, [address.toLowerCase(), token.toUpperCase()], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        success: false,
        message: 'Database error',
        error: err.message,
      });
    }

    let eligible = true;
    let remainingTime = 0;

    if (row) {
      const lastRequest = new Date(row.created_at).getTime();
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequest;

      if (timeSinceLastRequest < COOLDOWN_PERIOD) {
        eligible = false;
        remainingTime = COOLDOWN_PERIOD - timeSinceLastRequest;
      }
    }

    res.json({
      success: true,
      data: {
        eligible,
        remainingTime,
        remainingHours: Math.ceil(remainingTime / (60 * 60 * 1000)),
        lastRequest: row ? row.created_at : null,
      },
    });
  });
});

// Request tokens from faucet
router.post('/request', (req, res) => {
  const { address, tokenSymbol } = req.body;

  if (!address || !tokenSymbol) {
    return res.status(400).json({
      success: false,
      message: 'Address and token symbol are required',
    });
  }

  const token = AVAILABLE_TOKENS[tokenSymbol.toUpperCase()];
  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Invalid token symbol',
    });
  }

  // Check eligibility first
  const checkQuery = `
    SELECT created_at 
    FROM faucet_requests 
    WHERE address = ? AND token_symbol = ? AND status = 'completed'
    ORDER BY created_at DESC 
    LIMIT 1
  `;

  db.get(checkQuery, [address.toLowerCase(), tokenSymbol.toUpperCase()], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        success: false,
        message: 'Database error',
        error: err.message,
      });
    }

    // Check cooldown
    if (row) {
      const lastRequest = new Date(row.created_at).getTime();
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequest;

      if (timeSinceLastRequest < COOLDOWN_PERIOD) {
        const remainingHours = Math.ceil((COOLDOWN_PERIOD - timeSinceLastRequest) / (60 * 60 * 1000));
        return res.status(429).json({
          success: false,
          message: `Please wait ${remainingHours} hours before requesting ${tokenSymbol} again`,
          remainingTime: COOLDOWN_PERIOD - timeSinceLastRequest,
        });
      }
    }

    // Create faucet request
    const insertQuery = `
      INSERT INTO faucet_requests (address, token_symbol, amount, network, status)
      VALUES (?, ?, ?, ?, 'pending')
    `;

    db.run(
      insertQuery,
      [address.toLowerCase(), tokenSymbol.toUpperCase(), token.amount, token.network],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({
            success: false,
            message: 'Failed to create faucet request',
            error: err.message,
          });
        }

        const requestId = this.lastID;

        // Simulate token distribution (in a real implementation, this would interact with blockchain)
        setTimeout(() => {
          processFaucetRequest(requestId, address, token);
        }, 2000);

        res.json({
          success: true,
          message: `Faucet request created for ${token.amount} ${token.symbol}`,
          data: {
            requestId,
            address,
            token: token.symbol,
            amount: token.amount,
            network: token.network,
            status: 'pending',
          },
        });
      }
    );
  });
});

// Process faucet request (simulate blockchain interaction)
function processFaucetRequest(requestId, address, token) {
  // Simulate processing time
  setTimeout(() => {
    // Generate mock transaction hash
    const txHash = '0x' + Math.random().toString(16).substr(2, 64);
    
    // Update request status
    const updateQuery = `
      UPDATE faucet_requests 
      SET status = 'completed', tx_hash = ?, completed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    db.run(updateQuery, [txHash, requestId], (err) => {
      if (err) {
        console.error('Error updating faucet request:', err);
        
        // Mark as failed
        db.run(
          'UPDATE faucet_requests SET status = \'failed\' WHERE id = ?',
          [requestId],
          (updateErr) => {
            if (updateErr) {
              console.error('Error marking request as failed:', updateErr);
            }
          }
        );
        return;
      }

      console.log(`Faucet request ${requestId} completed successfully`);
      console.log(`Sent ${token.amount} ${token.symbol} to ${address}`);
      console.log(`Transaction hash: ${txHash}`);
    });
  }, Math.random() * 3000 + 1000); // Random delay between 1-4 seconds
}

// Get faucet history for an address
router.get('/history/:address', (req, res) => {
  const { address } = req.params;
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;

  if (!address) {
    return res.status(400).json({
      success: false,
      message: 'Address is required',
    });
  }

  const query = `
    SELECT id, address, token_symbol, amount, tx_hash, status, created_at, completed_at, network
    FROM faucet_requests 
    WHERE address = ? 
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?
  `;

  db.all(query, [address.toLowerCase(), limit, offset], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        success: false,
        message: 'Database error',
        error: err.message,
      });
    }

    res.json({
      success: true,
      data: rows || [],
      pagination: {
        limit,
        offset,
        total: rows ? rows.length : 0,
      },
    });
  });
});

// Get recent faucet activity (public)
router.get('/recent', (req, res) => {
  const limit = parseInt(req.query.limit) || 20;

  const query = `
    SELECT 
      SUBSTR(address, 1, 6) || '...' || SUBSTR(address, -4) as masked_address,
      token_symbol, 
      amount, 
      status, 
      created_at,
      network
    FROM faucet_requests 
    WHERE status = 'completed'
    ORDER BY created_at DESC 
    LIMIT ?
  `;

  db.all(query, [limit], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        success: false,
        message: 'Database error',
        error: err.message,
      });
    }

    res.json({
      success: true,
      data: rows || [],
    });
  });
});

// Get faucet statistics
router.get('/stats', (req, res) => {
  const queries = {
    totalRequests: 'SELECT COUNT(*) as count FROM faucet_requests',
    completedRequests: 'SELECT COUNT(*) as count FROM faucet_requests WHERE status = "completed"',
    pendingRequests: 'SELECT COUNT(*) as count FROM faucet_requests WHERE status = "pending"',
    failedRequests: 'SELECT COUNT(*) as count FROM faucet_requests WHERE status = "failed"',
    tokenDistribution: `
      SELECT token_symbol, COUNT(*) as requests, SUM(CAST(amount AS REAL)) as total_distributed
      FROM faucet_requests 
      WHERE status = 'completed'
      GROUP BY token_symbol
    `,
  };

  const stats = {};
  let completedQueries = 0;
  const totalQueries = Object.keys(queries).length;

  Object.entries(queries).forEach(([key, query]) => {
    if (key === 'tokenDistribution') {
      db.all(query, [], (err, rows) => {
        if (err) {
          console.error(`Error executing ${key} query:`, err);
          stats[key] = [];
        } else {
          stats[key] = rows || [];
        }
        completedQueries++;
        if (completedQueries === totalQueries) {
          res.json({ success: true, data: stats });
        }
      });
    } else {
      db.get(query, [], (err, row) => {
        if (err) {
          console.error(`Error executing ${key} query:`, err);
          stats[key] = 0;
        } else {
          stats[key] = row?.count || 0;
        }
        completedQueries++;
        if (completedQueries === totalQueries) {
          res.json({ success: true, data: stats });
        }
      });
    }
  });
});

module.exports = router;
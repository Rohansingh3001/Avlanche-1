const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs-extra');

class DatabaseService {
    constructor() {
        this.db = null;
        this.dbPath = path.join(process.cwd(), 'data', 'avalanche-subnets.db');
    }

    /**
     * Initialize the database and create tables
     */
    async initialize() {
        try {
            // Ensure data directory exists
            await fs.ensureDir(path.dirname(this.dbPath));

            // Initialize SQLite database
            this.db = new sqlite3.Database(this.dbPath);

            // Enable foreign keys
            await this.run('PRAGMA foreign_keys = ON');

            // Create tables
            await this.createTables();

            console.log('✅ Database initialized successfully');
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            throw error;
        }
    }

    /**
     * Create database tables
     */
    async createTables() {
        // Subnets table
        await this.run(`
            CREATE TABLE IF NOT EXISTS subnets (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                description TEXT,
                chain_id INTEGER NOT NULL UNIQUE,
                vm_type TEXT NOT NULL,
                network_id INTEGER NOT NULL,
                config TEXT,
                deployment TEXT,
                status TEXT DEFAULT 'created',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        `);

        // Validators table
        await this.run(`
            CREATE TABLE IF NOT EXISTS validators (
                id TEXT PRIMARY KEY,
                subnet_id TEXT NOT NULL,
                node_id TEXT NOT NULL,
                weight INTEGER DEFAULT 1,
                start_time TEXT,
                end_time TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (subnet_id) REFERENCES subnets (id) ON DELETE CASCADE
            )
        `);

        // Contracts table
        await this.run(`
            CREATE TABLE IF NOT EXISTS contracts (
                id TEXT PRIMARY KEY,
                subnet_id TEXT NOT NULL,
                name TEXT NOT NULL,
                address TEXT,
                abi TEXT,
                bytecode TEXT,
                source_code TEXT,
                compiler_version TEXT,
                deployment_tx TEXT,
                status TEXT DEFAULT 'pending',
                created_at TEXT NOT NULL,
                deployed_at TEXT,
                FOREIGN KEY (subnet_id) REFERENCES subnets (id) ON DELETE CASCADE
            )
        `);

        // Assets table
        await this.run(`
            CREATE TABLE IF NOT EXISTS assets (
                id TEXT PRIMARY KEY,
                subnet_id TEXT NOT NULL,
                contract_id TEXT,
                name TEXT NOT NULL,
                symbol TEXT NOT NULL,
                decimals INTEGER DEFAULT 18,
                total_supply TEXT DEFAULT '0',
                asset_type TEXT DEFAULT 'ERC20',
                created_at TEXT NOT NULL,
                FOREIGN KEY (subnet_id) REFERENCES subnets (id) ON DELETE CASCADE,
                FOREIGN KEY (contract_id) REFERENCES contracts (id) ON DELETE SET NULL
            )
        `);

        // Subnet metrics table
        await this.run(`
            CREATE TABLE IF NOT EXISTS subnet_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                subnet_id TEXT NOT NULL,
                metrics TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (subnet_id) REFERENCES subnets (id) ON DELETE CASCADE
            )
        `);

        // Health checks table
        await this.run(`
            CREATE TABLE IF NOT EXISTS health_checks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                subnet_id TEXT NOT NULL,
                is_healthy BOOLEAN NOT NULL,
                metrics TEXT,
                errors TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (subnet_id) REFERENCES subnets (id) ON DELETE CASCADE
            )
        `);

        // Transactions table
        await this.run(`
            CREATE TABLE IF NOT EXISTS transactions (
                id TEXT PRIMARY KEY,
                subnet_id TEXT NOT NULL,
                hash TEXT NOT NULL,
                from_address TEXT,
                to_address TEXT,
                value TEXT DEFAULT '0',
                gas_used TEXT,
                gas_price TEXT,
                block_number INTEGER,
                block_hash TEXT,
                transaction_index INTEGER,
                status TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (subnet_id) REFERENCES subnets (id) ON DELETE CASCADE
            )
        `);

        // Create indexes for better performance
        await this.run('CREATE INDEX IF NOT EXISTS idx_subnets_status ON subnets (status)');
        await this.run('CREATE INDEX IF NOT EXISTS idx_subnets_chain_id ON subnets (chain_id)');
        await this.run('CREATE INDEX IF NOT EXISTS idx_validators_subnet_id ON validators (subnet_id)');
        await this.run('CREATE INDEX IF NOT EXISTS idx_contracts_subnet_id ON contracts (subnet_id)');
        await this.run('CREATE INDEX IF NOT EXISTS idx_assets_subnet_id ON assets (subnet_id)');
        await this.run('CREATE INDEX IF NOT EXISTS idx_metrics_subnet_id ON subnet_metrics (subnet_id)');
        await this.run('CREATE INDEX IF NOT EXISTS idx_metrics_created_at ON subnet_metrics (created_at)');
        await this.run('CREATE INDEX IF NOT EXISTS idx_health_checks_subnet_id ON health_checks (subnet_id)');
        await this.run('CREATE INDEX IF NOT EXISTS idx_transactions_subnet_id ON transactions (subnet_id)');
        await this.run('CREATE INDEX IF NOT EXISTS idx_transactions_hash ON transactions (hash)');

        console.log('✅ Database tables created successfully');
    }

    /**
     * Execute a SQL query that doesn't return rows
     */
    async run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(error) {
                if (error) {
                    console.error('❌ Database run error:', error);
                    reject(error);
                } else {
                    resolve({ lastID: this.lastID, changes: this.changes });
                }
            });
        });
    }

    /**
     * Execute a SQL query that returns rows
     */
    async query(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (error, rows) => {
                if (error) {
                    console.error('❌ Database query error:', error);
                    reject(error);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * Execute a SQL query that returns a single row
     */
    async get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (error, row) => {
                if (error) {
                    console.error('❌ Database get error:', error);
                    reject(error);
                } else {
                    resolve(row);
                }
            });
        });
    }

    /**
     * Begin a database transaction
     */
    async beginTransaction() {
        await this.run('BEGIN TRANSACTION');
    }

    /**
     * Commit a database transaction
     */
    async commitTransaction() {
        await this.run('COMMIT');
    }

    /**
     * Rollback a database transaction
     */
    async rollbackTransaction() {
        await this.run('ROLLBACK');
    }

    /**
     * Execute multiple queries in a transaction
     */
    async transaction(queries) {
        try {
            await this.beginTransaction();
            
            const results = [];
            for (const { sql, params } of queries) {
                const result = await this.run(sql, params);
                results.push(result);
            }
            
            await this.commitTransaction();
            return results;
        } catch (error) {
            await this.rollbackTransaction();
            throw error;
        }
    }

    /**
     * Get database statistics
     */
    async getStats() {
        try {
            const [
                subnetCount,
                validatorCount,
                contractCount,
                assetCount,
                metricsCount,
                healthCheckCount
            ] = await Promise.all([
                this.get('SELECT COUNT(*) as count FROM subnets'),
                this.get('SELECT COUNT(*) as count FROM validators'),
                this.get('SELECT COUNT(*) as count FROM contracts'),
                this.get('SELECT COUNT(*) as count FROM assets'),
                this.get('SELECT COUNT(*) as count FROM subnet_metrics'),
                this.get('SELECT COUNT(*) as count FROM health_checks')
            ]);

            return {
                subnets: subnetCount.count,
                validators: validatorCount.count,
                contracts: contractCount.count,
                assets: assetCount.count,
                metrics: metricsCount.count,
                healthChecks: healthCheckCount.count,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('❌ Error getting database stats:', error);
            throw error;
        }
    }

    /**
     * Backup database
     */
    async backup(backupPath) {
        try {
            await fs.copy(this.dbPath, backupPath);
            console.log(`✅ Database backed up to: ${backupPath}`);
        } catch (error) {
            console.error('❌ Database backup failed:', error);
            throw error;
        }
    }

    /**
     * Restore database from backup
     */
    async restore(backupPath) {
        try {
            if (this.db) {
                this.db.close();
            }
            
            await fs.copy(backupPath, this.dbPath);
            await this.initialize();
            
            console.log(`✅ Database restored from: ${backupPath}`);
        } catch (error) {
            console.error('❌ Database restore failed:', error);
            throw error;
        }
    }

    /**
     * Close database connection
     */
    async close() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                resolve();
                return;
            }

            this.db.close((error) => {
                if (error) {
                    console.error('❌ Error closing database:', error);
                    reject(error);
                } else {
                    console.log('✅ Database connection closed');
                    this.db = null;
                    resolve();
                }
            });
        });
    }

    /**
     * Vacuum database to optimize storage
     */
    async vacuum() {
        try {
            await this.run('VACUUM');
            console.log('✅ Database vacuumed successfully');
        } catch (error) {
            console.error('❌ Database vacuum failed:', error);
            throw error;
        }
    }

    /**
     * Check database integrity
     */
    async checkIntegrity() {
        try {
            const result = await this.get('PRAGMA integrity_check');
            return result.integrity_check === 'ok';
        } catch (error) {
            console.error('❌ Database integrity check failed:', error);
            return false;
        }
    }
}

// Create singleton instance
const databaseService = new DatabaseService();

module.exports = databaseService;

const mysql = require('mysql2');
const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Allow selecting env file via ENV_FILE or ENV_PROFILE
const ENV_PROFILE = process.env.ENV_PROFILE; // 'index' | 'non-index'
const EXPLICIT_ENV = process.env.ENV_FILE;   // absolute or relative path

let envPath;
if (EXPLICIT_ENV && EXPLICIT_ENV.length > 0) {
    envPath = path.isAbsolute(EXPLICIT_ENV)
        ? EXPLICIT_ENV
        : path.join(__dirname, '..', EXPLICIT_ENV);
} else if (ENV_PROFILE === 'index') {
    // Use connect/index.env when profiling indexed DB
    envPath = path.join(__dirname, '..', 'connect', 'index.env');
} else if (ENV_PROFILE === 'non-index') {
    // Use connect/non-index.env when profiling non-indexed DB
    envPath = path.join(__dirname, '..', 'connect', 'non-index.env');
} else {
    // Default: backend/.env
    envPath = path.join(__dirname, '..', '.env');
}

dotenv.config({ path: envPath });

// ========== QUERY PROFILER CONFIG ==========
const ENABLE_QUERY_PROFILER = true;  // Bật/tắt profiler
const SLOW_QUERY_THRESHOLD = 100;    // Cảnh báo query > 100ms
const LOG_COLORS = {
    reset: '\x1b[0m',
    cyan: '\x1b[36m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    dim: '\x1b[2m',
    bright: '\x1b[1m'
};

// Tạo connection pool để quản lý kết nối hiệu quả
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Tạo promise wrapper để sử dụng async/await
const promisePool = pool.promise();

// ========== QUERY PROFILER WRAPPER ==========
/**
 * Wrapper để đo thời gian thực thi query và log ra terminal
 * @param {string} sql - Câu lệnh SQL
 * @param {Array} params - Tham số cho prepared statement
 * @returns {Promise} - Kết quả query
 */
const profiledQuery = async (sql, params = []) => {
    if (!ENABLE_QUERY_PROFILER) {
        return promisePool.query(sql, params);
    }

    const queryId = Math.random().toString(36).substring(7);
    const startTime = performance.now();
    const timestamp = new Date().toLocaleTimeString('vi-VN');

    // Format SQL để hiển thị đẹp hơn
    const formattedSQL = sql.replace(/\s+/g, ' ').trim().substring(0, 200);
    const queryType = sql.trim().split(' ')[0].toUpperCase();

    console.log(`${LOG_COLORS.dim}─────────────────────────────────────────────────────${LOG_COLORS.reset}`);
    console.log(`${LOG_COLORS.cyan}🔍 [${timestamp}] Query #${queryId}${LOG_COLORS.reset}`);
    console.log(`${LOG_COLORS.bright}   ${queryType}${LOG_COLORS.reset} ${LOG_COLORS.dim}${formattedSQL}${formattedSQL.length >= 200 ? '...' : ''}${LOG_COLORS.reset}`);

    if (params && params.length > 0) {
        console.log(`${LOG_COLORS.dim}   Params: [${params.join(', ')}]${LOG_COLORS.reset}`);
    }

    try {
        const result = await promisePool.query(sql, params);
        const endTime = performance.now();
        const duration = (endTime - startTime).toFixed(2);

        const rowCount = Array.isArray(result[0]) ? result[0].length : 0;
        console.log(`${LOG_COLORS.green}   ⏱️ ${duration}ms | ${rowCount} rows${LOG_COLORS.reset}`);

        return result;

    } catch (error) {
        const endTime = performance.now();
        const duration = (endTime - startTime).toFixed(2);

        console.log(`${LOG_COLORS.red}   ❌ ERROR after ${duration}ms: ${error.message}${LOG_COLORS.reset}`);
        throw error;
    }
};

/**
 * Database wrapper với profiler tích hợp
 */
const db = {
    // Query với profiler
    query: profiledQuery,

    // Execute (alias của query)
    execute: profiledQuery,

    /**
     * Helper function executeQuery - Gọi query với profiler tự động
     * Đây là hàm chính để tất cả controllers sử dụng (DRY principle)
     * @param {string} sql - Câu lệnh SQL
     * @param {Array} params - Tham số cho prepared statement
     * @param {string} label - Nhãn để identify query (optional)
     * @returns {Promise} - Kết quả query
     */
    executeQuery: async (sql, params = [], label = '') => {
        if (label && ENABLE_QUERY_PROFILER) {
            console.log(`${LOG_COLORS.cyan}📌 [${label}]${LOG_COLORS.reset}`);
        }
        return profiledQuery(sql, params);
    },

    // Truy cập pool gốc nếu cần
    pool: promisePool,

    // Lấy connection từ pool (cho transactions)
    getConnection: () => promisePool.getConnection(),

    // Helper: Bắt đầu transaction với profiler
    async transaction(callback) {
        const connection = await promisePool.getConnection();
        const startTime = performance.now();
        console.log(`${LOG_COLORS.cyan}🔄 [Transaction] Started${LOG_COLORS.reset}`);

        try {
            await connection.beginTransaction();
            const result = await callback(connection);
            await connection.commit();

            const duration = (performance.now() - startTime).toFixed(2);
            console.log(`${LOG_COLORS.green}✅ [Transaction] Committed (${duration}ms)${LOG_COLORS.reset}`);

            return result;
        } catch (error) {
            await connection.rollback();
            const duration = (performance.now() - startTime).toFixed(2);
            console.log(`${LOG_COLORS.red}❌ [Transaction] Rolled back (${duration}ms): ${error.message}${LOG_COLORS.reset}`);
            throw error;
        } finally {
            connection.release();
        }
    }
};

// Test kết nối
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Lỗi kết nối database:', err.message);
        return;
    }
    console.log('✅ Kết nối database thành công!');
    console.log(`📊 Query Profiler: ${ENABLE_QUERY_PROFILER ? 'ENABLED' : 'DISABLED'}`);
    connection.release();
});

module.exports = db;
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

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

// Test kết nối
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Lỗi kết nối database:', err.message);
        return;
    }
    console.log('✅ Kết nối database thành công!');
    connection.release();
});

module.exports = promisePool;

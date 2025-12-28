const express = require('express');
const cors = require('cors');
const path = require('path');

// Chọn file env dựa trên ENV_PROFILE: index → connect/index.env, non-index → connect/non-index.env
const ENV_PROFILE = process.env.ENV_PROFILE || 'non-index';
const envFile = ENV_PROFILE === 'index' 
    ? path.join(__dirname, '..', 'connect', 'index.env')
    : path.join(__dirname, '..', 'connect', 'non-index.env');
require('dotenv').config({ path: envFile });

const app = express();

// Chọn PORT dựa trên ENV_PROFILE: index → 5001, non-index → 5000
const DEFAULT_PORT = ENV_PROFILE === 'index' ? 5001 : 5000;
const PORT = process.env.PORT || DEFAULT_PORT;

console.log(`📌 ENV_PROFILE: ${ENV_PROFILE} | Sử dụng: ${path.basename(envFile)}`);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const chiNhanhRoutes = require('./routes/chinhanh.routes');
const thuCungRoutes = require('./routes/thucung.routes');
const khachHangRoutes = require('./routes/khachhang.routes');
const hoaDonRoutes = require('./routes/hoadon.routes');
const dichVuRoutes = require('./routes/dichvu.routes');
const staffRoutes = require('./routes/staff.routes');
const managerRoutes = require('./routes/manager.routes');
const doctorRoutes = require('./routes/doctor.routes');
const customerRoutes = require('./routes/customer.routes');

// Routes
app.use('/api/chinhanh', chiNhanhRoutes);
app.use('/api/thucung', thuCungRoutes);
app.use('/api/khachhang', khachHangRoutes);
app.use('/api/hoadon', hoaDonRoutes);
app.use('/api/dichvu', dichVuRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/customer', customerRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'PetCareX API Server',
        version: '1.0.0',
        endpoints: {
            chiNhanh: '/api/chinhanh',
            thuCung: '/api/thucung',
            khachHang: '/api/khachhang',
            hoaDon: '/api/hoadon',
            dichVu: '/api/dichvu'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Có lỗi xảy ra!',
        error: err.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   🐾 PetCareX API Server Running 🐾   ║
╠════════════════════════════════════════╣
║   Port: ${PORT}                          ║
║   Environment: ${process.env.NODE_ENV || 'development'}              ║
║   URL: http://localhost:${PORT}           ║
╚════════════════════════════════════════╝
    `);
});

module.exports = app;

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

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
const productsRoutes = require('./routes/products.routes');
const appointmentsRoutes = require('./routes/appointments.routes');
const statsRoutes = require('./routes/stats.routes');
const giongRoutes = require('./routes/giong.routes');

// Routes
app.use('/api/chinhanh', chiNhanhRoutes);
app.use('/api/thucung', thuCungRoutes);
app.use('/api/khachhang', khachHangRoutes);
app.use('/api/hoadon', hoaDonRoutes);
app.use('/api/dichvu', dichVuRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/giong', giongRoutes);

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
            dichVu: '/api/dichvu',
            products: '/api/products',
            appointments: '/api/appointments',
            stats: '/api/stats',
            giong: '/api/giong'
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

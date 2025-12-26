const db = require('../config/database');

// Lấy danh sách chi nhánh (có phân trang)
exports.getAllChiNhanh = async (req, res) => {
    try {
        // Lấy tham số phân trang từ query string
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        
        // Query đếm tổng số - Profiler tự động log
        const countQuery = `SELECT COUNT(*) as total FROM ChiNhanh`;
        const [[{ total }]] = await db.executeQuery(countQuery, [], 'ChiNhanh.count');
        
        // Query lấy dữ liệu với phân trang
        const [rows] = await db.executeQuery('SELECT * FROM ChiNhanh LIMIT ? OFFSET ?', [limit, offset], 'ChiNhanh.list');
        
        res.json({
            success: true,
            data: rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('❌ [ChiNhanh] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách chi nhánh',
            error: error.message
        });
    }
};

// Lấy chi nhánh theo ID
exports.getChiNhanhById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM ChiNhanh WHERE ID_ChiNhanh = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy chi nhánh'
            });
        }
        
        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin chi nhánh',
            error: error.message
        });
    }
};

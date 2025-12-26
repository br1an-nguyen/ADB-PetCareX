const db = require('../config/database');

// Lấy danh sách chi nhánh
exports.getAllChiNhanh = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM ChiNhanh');
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error:', error);
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

const db = require('../config/database');

// Lấy danh sách giống
exports.getAllGiong = async (req, res) => {
    try {
        const query = `
            SELECT G.*, L.TenLoai
            FROM Giong G
            LEFT JOIN Loai L ON G.ID_Loai = L.ID_Loai
            ORDER BY L.TenLoai, G.TenGiong
        `;
        const [rows] = await db.query(query);
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách giống',
            error: error.message
        });
    }
};

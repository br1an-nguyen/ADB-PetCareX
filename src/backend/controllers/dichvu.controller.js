const db = require('../config/database');

// Lấy danh sách dịch vụ
exports.getAllDichVu = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM DichVu');
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách dịch vụ',
            error: error.message
        });
    }
};

// Lấy dịch vụ theo chi nhánh
exports.getDichVuByChiNhanh = async (req, res) => {
    try {
        const { chinanhId } = req.params;
        const query = `
            SELECT 
                DV.*,
                CNDV.DonGia as GiaTaiChiNhanh
            FROM ChiNhanh_DichVu CNDV
            JOIN DichVu DV ON CNDV.ID_DichVu = DV.ID_DichVu
            WHERE CNDV.ID_ChiNhanh = ?
        `;
        const [rows] = await db.query(query, [chinanhId]);
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách dịch vụ',
            error: error.message
        });
    }
};

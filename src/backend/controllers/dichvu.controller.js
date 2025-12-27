const db = require('../config/database');

// Lấy danh sách dịch vụ
exports.getAllDichVu = async (req, res) => {
    try {
        const [rows] = await db.executeQuery(
            'SELECT ID_DichVu, Ten_DichVu, Loai_DichVu, MoTa FROM DichVu ORDER BY ID_DichVu',
            [],
            'DichVu.list'
        );
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
                DV.ID_DichVu,
                DV.Ten_DichVu,
                DV.Loai_DichVu,
                DV.MoTa,
                CNDV.Gia_DichVu as GiaTaiChiNhanh
            FROM ChiNhanh_DichVu CNDV
            INNER JOIN DichVu DV ON CNDV.ID_DichVu = DV.ID_DichVu
            WHERE CNDV.ID_ChiNhanh = ?
            ORDER BY DV.ID_DichVu
        `;
        const [rows] = await db.executeQuery(query, [chinanhId], 'DichVu.byBranch');
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

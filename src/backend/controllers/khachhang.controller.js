const db = require('../config/database');

// Lấy danh sách khách hàng
exports.getAllKhachHang = async (req, res) => {
    try {
        const query = `
            SELECT 
                TKTN.ID_TaiKhoan,
                TKTN.HoTen,
                TKTN.Phone,
                TKTN.Email,
                CDT.TenCapDo,
                COUNT(TC.ID_ThuCung) as SoLuongThuCung
            FROM TaiKhoanThanhVien TKTN
            LEFT JOIN CapDoThanhVien CDT ON TKTN.ID_CapDo = CDT.ID_CapDo
            LEFT JOIN ThuCung TC ON TKTN.ID_TaiKhoan = TC.ID_TaiKhoan
            GROUP BY TKTN.ID_TaiKhoan, TKTN.HoTen, TKTN.Phone, TKTN.Email, CDT.TenCapDo
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
            message: 'Lỗi khi lấy danh sách khách hàng',
            error: error.message
        });
    }
};

// Lấy thông tin khách hàng theo ID
exports.getKhachHangById = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT 
                TKTN.*,
                CDT.TenCapDo,
                CDT.MucChietKhau
            FROM TaiKhoanThanhVien TKTN
            LEFT JOIN CapDoThanhVien CDT ON TKTN.ID_CapDo = CDT.ID_CapDo
            WHERE TKTN.ID_TaiKhoan = ?
        `;
        const [rows] = await db.query(query, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy khách hàng'
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
            message: 'Lỗi khi lấy thông tin khách hàng',
            error: error.message
        });
    }
};

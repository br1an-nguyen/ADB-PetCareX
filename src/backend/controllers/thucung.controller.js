const db = require('../config/database');

// Lấy danh sách thú cưng
exports.getAllThuCung = async (req, res) => {
    try {
        const query = `
            SELECT 
                TC.*, 
                G.TenGiong, 
                L.TenLoai,
                TKTN.HoTen as TenChuSoHuu,
                TKTN.Phone as SDTChuSoHuu
            FROM ThuCung TC
            LEFT JOIN Giong G ON TC.ID_Giong = G.ID_Giong
            LEFT JOIN Loai L ON G.ID_Loai = L.ID_Loai
            LEFT JOIN TaiKhoanThanhVien TKTN ON TC.ID_TaiKhoan = TKTN.ID_TaiKhoan
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
            message: 'Lỗi khi lấy danh sách thú cưng',
            error: error.message
        });
    }
};

// Lấy thú cưng theo chủ sở hữu
exports.getThuCungByOwner = async (req, res) => {
    try {
        const { ownerId } = req.params;
        const query = `
            SELECT 
                TC.*, 
                G.TenGiong, 
                L.TenLoai
            FROM ThuCung TC
            LEFT JOIN Giong G ON TC.ID_Giong = G.ID_Giong
            LEFT JOIN Loai L ON G.ID_Loai = L.ID_Loai
            WHERE TC.ID_TaiKhoan = ?
        `;
        const [rows] = await db.query(query, [ownerId]);
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách thú cưng',
            error: error.message
        });
    }
};

// Lấy thông tin chi tiết thú cưng
exports.getThuCungById = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT 
                TC.*, 
                G.TenGiong, 
                L.TenLoai,
                TKTN.HoTen as TenChuSoHuu,
                TKTN.Phone as SDTChuSoHuu,
                TKTN.DiaChi as DiaChiChuSoHuu
            FROM ThuCung TC
            LEFT JOIN Giong G ON TC.ID_Giong = G.ID_Giong
            LEFT JOIN Loai L ON G.ID_Loai = L.ID_Loai
            LEFT JOIN TaiKhoanThanhVien TKTN ON TC.ID_TaiKhoan = TKTN.ID_TaiKhoan
            WHERE TC.ID_ThuCung = ?
        `;
        const [rows] = await db.query(query, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thú cưng'
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
            message: 'Lỗi khi lấy thông tin thú cưng',
            error: error.message
        });
    }
};

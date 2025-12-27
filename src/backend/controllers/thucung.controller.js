const db = require('../config/database');

// Lấy danh sách thú cưng (có phân trang)
exports.getAllThuCung = async (req, res) => {
    try {
        // Lấy tham số phân trang từ query string
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        // Query đếm tổng số - Profiler tự động log
        const countQuery = `SELECT COUNT(*) as total FROM ThuCung`;
        const [[{ total }]] = await db.executeQuery(countQuery, [], 'ThuCung.count');

        // Query lấy dữ liệu với phân trang
        const query = `
            SELECT 
                TC.*, 
                G.TenGiong, 
                L.TenLoai,
                TKTN.HoTen as TenChuSoHuu,
                TKTN.Phone as SDTChuSoHuu
            FROM (
                SELECT ID_ThuCung 
                FROM ThuCung 
                ORDER BY ID_ThuCung 
                LIMIT ? OFFSET ?
            ) as PageTC
            JOIN ThuCung TC ON PageTC.ID_ThuCung = TC.ID_ThuCung
            LEFT JOIN Giong G ON TC.ID_Giong = G.ID_Giong
            LEFT JOIN Loai L ON G.ID_Loai = L.ID_Loai
            LEFT JOIN TaiKhoanThanhVien TKTN ON TC.ID_TaiKhoan = TKTN.ID_TaiKhoan
            ORDER BY TC.ID_ThuCung
        `;
        const [rows] = await db.executeQuery(query, [limit, offset], 'ThuCung.list');

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
        console.error('❌ [ThuCung] Error:', error);
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
                TC.ID_ThuCung, TC.TenThuCung, TC.NgaySinh, TC.GioiTinh, TC.TinhTrangSucKhoe,
                G.TenGiong, 
                L.TenLoai
            FROM ThuCung TC
            LEFT JOIN Giong G ON TC.ID_Giong = G.ID_Giong
            LEFT JOIN Loai L ON G.ID_Loai = L.ID_Loai
            WHERE TC.ID_TaiKhoan = ?
            ORDER BY TC.ID_ThuCung
        `;
        const [rows] = await db.executeQuery(query, [ownerId], 'ThuCung.byOwner');
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
        const [rows] = await db.executeQuery(query, [id], 'ThuCung.detail');

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

// Tạo thú cưng mới (sử dụng sp_ThemThuCung)
exports.createThuCung = async (req, res) => {
    try {
        const { TenThuCung, ID_TaiKhoan, TenLoai, TenGiong, NgaySinh, GioiTinh, TinhTrangSucKhoe } = req.body;

        if (!TenThuCung || !ID_TaiKhoan || !TenLoai || !TenGiong) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bắt buộc: TenThuCung, ID_TaiKhoan, TenLoai, TenGiong'
            });
        }

        // Call stored procedure sp_ThemThuCung
        await db.executeQuery(
            'CALL sp_ThemThuCung(?, ?, ?, ?, ?, ?, ?)',
            [TenThuCung, ID_TaiKhoan, TenLoai, TenGiong, NgaySinh || null, GioiTinh || null, TinhTrangSucKhoe || 'Bình thường'],
            'ThuCung.create'
        );

        res.json({
            success: true,
            message: 'Tạo thú cưng thành công'
        });
    } catch (error) {
        console.error('❌ [ThuCung.create] Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi khi tạo thú cưng',
            error: error.message
        });
    }
};

// Lấy danh sách giống (theo loài)
exports.getAllGiong = async (req, res) => {
    try {
        const { loai } = req.query;

        let query = `
            SELECT 
                G.ID_Giong,
                G.TenGiong,
                L.ID_Loai,
                L.TenLoai
            FROM Giong G
            JOIN Loai L ON G.ID_Loai = L.ID_Loai
        `;

        const params = [];
        if (loai) {
            query += ' WHERE L.TenLoai = ?';
            params.push(loai);
        }

        query += ' ORDER BY L.TenLoai, G.TenGiong';

        const [rows] = await db.executeQuery(query, params, 'Giong.list');

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

// Lấy danh sách loài
exports.getAllLoai = async (req, res) => {
    try {
        const query = 'SELECT ID_Loai, TenLoai FROM Loai ORDER BY TenLoai';
        const [rows] = await db.executeQuery(query, [], 'Loai.list');

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách loài',
            error: error.message
        });
    }
};

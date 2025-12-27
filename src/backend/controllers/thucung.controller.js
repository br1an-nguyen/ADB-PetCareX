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
            FROM ThuCung TC
            LEFT JOIN Giong G ON TC.ID_Giong = G.ID_Giong
            LEFT JOIN Loai L ON G.ID_Loai = L.ID_Loai
            LEFT JOIN TaiKhoanThanhVien TKTN ON TC.ID_TaiKhoan = TKTN.ID_TaiKhoan
            LIMIT ? OFFSET ?
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

// Tạo thú cưng mới
// Sử dụng SP: sp_ThemThuCung
exports.createThuCung = async (req, res) => {
    try {
        const { idTaiKhoan, tenLoai, tenGiong, tenThuCung, ngaySinh, gioiTinh, tinhTrangSucKhoe } = req.body;

        // Validate required fields
        if (!idTaiKhoan || !tenThuCung) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp ID chủ sở hữu và Tên thú cưng'
            });
        }

        if (!tenLoai || !tenGiong) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp Tên loài và Tên giống'
            });
        }

        // Gọi Stored Procedure sp_ThemThuCung
        // SP sẽ tự động:
        // - Validate tài khoản tồn tại
        // - Validate ngày sinh hợp lệ
        // - Tìm ID_Giong từ TenLoai + TenGiong
        // - Tạo ID_ThuCung tự động bằng dbo.TaoIDThuCung()
        await db.query(
            `EXEC sp_ThemThuCung 
                @TenThuCung = ?, 
                @ID_TaiKhoan = ?, 
                @TenLoai = ?, 
                @TenGiong = ?, 
                @NgaySinh = ?, 
                @GioiTinh = ?, 
                @TinhTrangSucKhoe = ?`,
            [
                tenThuCung,
                idTaiKhoan,
                tenLoai,
                tenGiong,
                ngaySinh || null,
                gioiTinh || 'Đực',
                tinhTrangSucKhoe || 'Bình thường'
            ]
        );

        // Fetch the newly created pet (get the latest one for this owner)
        const [rows] = await db.query(
            `SELECT TOP 1 TC.*, G.TenGiong, L.TenLoai 
             FROM ThuCung TC
             LEFT JOIN Giong G ON TC.ID_Giong = G.ID_Giong
             LEFT JOIN Loai L ON G.ID_Loai = L.ID_Loai
             WHERE TC.ID_TaiKhoan = ? AND TC.TenThuCung = ?
             ORDER BY TC.ID_ThuCung DESC`,
            [idTaiKhoan, tenThuCung]
        );

        res.json({
            success: true,
            message: 'Tạo thú cưng thành công',
            data: rows[0] || null
        });

    } catch (error) {
        console.error('Error creating pet:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo thú cưng',
            error: error.message
        });
    }
};

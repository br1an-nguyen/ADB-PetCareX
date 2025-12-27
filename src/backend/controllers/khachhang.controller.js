const db = require('../config/database');

// Lấy danh sách khách hàng (có phân trang)
exports.getAllKhachHang = async (req, res) => {
    try {
        // Lấy tham số phân trang từ query string
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        // Query đếm tổng số - Profiler tự động log
        const countQuery = `SELECT COUNT(*) as total FROM TaiKhoanThanhVien`;
        const [[{ total }]] = await db.executeQuery(countQuery, [], 'KhachHang.count');

        // Query lấy dữ liệu với phân trang
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
            LIMIT ? OFFSET ?
        `;
        const [rows] = await db.executeQuery(query, [limit, offset], 'KhachHang.list');

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
        console.error('❌ [KhachHang] Error:', error);
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
// Tìm khách hàng theo SĐT
// Tìm khách hàng theo SĐT (Prefix Search)
exports.findKhachHangByPhone = async (req, res) => {
    try {
        const { phone } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        // 1. Count total matches
        const countQuery = `SELECT COUNT(*) as total FROM TaiKhoanThanhVien WHERE Phone LIKE ?`;
        const [[{ total }]] = await db.query(countQuery, [`${phone}%`]);

        // 2. Get paginated data
        const query = `
                SELECT 
                    TK.*, 
                    CDT.TenCapDo 
                FROM TaiKhoanThanhVien TK
                LEFT JOIN CapDoThanhVien CDT ON TK.ID_CapDo = CDT.ID_CapDo
                WHERE TK.Phone LIKE ?
                LIMIT ? OFFSET ?
            `;
        const [rows] = await db.query(query, [`${phone}%`, limit, offset]);

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
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tìm khách hàng',
            error: error.message
        });
    }
};

// Tạo khách hàng mới (Đăng ký hội viên)
exports.createKhachHang = async (req, res) => {
    try {
        const { hoTen, phone, email, cccd, gioiTinh, ngaySinh } = req.body;

        // Validate required fields
        if (!hoTen || !phone || !ngaySinh) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp Họ tên, SĐT và Ngày sinh'
            });
        }

        // Call Stored Procedure (MySQL syntax: CALL procedure_name(?, ?, ...))
        await db.query(
            `CALL sp_DangKiHoiVien(?, ?, ?, ?, ?, ?)`,
            [hoTen, phone, email || '', cccd || '', gioiTinh || 'Nam', ngaySinh]
        );

        // Fetch the newly created user to return full details
        const [rows] = await db.query(`SELECT * FROM TaiKhoanThanhVien WHERE Phone = ? LIMIT 1`, [phone]);

        if (rows.length > 0) {
            res.json({
                success: true,
                message: 'Đăng ký hội viên thành công',
                data: rows[0]
            });
        } else {
            // Fallback if select fails immediately (should rarely happen)
            res.json({
                success: true,
                message: 'Đăng ký hội viên thành công (Vui lòng tra cứu lại)'
            });
        }

    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo khách hàng',
            error: error.message
        });
    }
};

// Tra cứu khách hàng và thú cưng (Nhân viên dùng khi tiếp khách)
// Sử dụng SP: sp_NhanVien_TraCuuKhachHang
exports.searchKhachHang = async (req, res) => {
    try {
        const { keyword } = req.params;

        if (!keyword) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập từ khóa tìm kiếm (SĐT hoặc Tên)'
            });
        }

        // Gọi Stored Procedure sp_NhanVien_TraCuuKhachHang
        // SP này trả về thông tin khách hàng kèm danh sách thú cưng
        const [rows] = await db.query(
            `EXEC sp_NhanVien_TraCuuKhachHang @ThongTinTraCuu = ?`,
            [keyword]
        );

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error searching customer:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tra cứu khách hàng',
            error: error.message
        });
    }
};

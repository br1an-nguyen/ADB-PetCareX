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
                -- Subquery chỉ chạy cho những dòng được hiển thị (Correlated Subquery)
                -- Khi chưa có Index: Vẫn chậm nhưng đỡ hơn GROUP BY toàn bảng.
                -- Khi có Index: Cực nhanh vì nó chỉ lookup vài lần.
                (SELECT COUNT(*) FROM ThuCung TC WHERE TC.ID_TaiKhoan = TKTN.ID_TaiKhoan) as SoLuongThuCung
            FROM (
                -- Lọc danh sách ID trước
                SELECT ID_TaiKhoan 
                FROM TaiKhoanThanhVien 
                ORDER BY ID_TaiKhoan 
                LIMIT ? OFFSET ?
            ) as PageUser
            JOIN TaiKhoanThanhVien TKTN ON PageUser.ID_TaiKhoan = TKTN.ID_TaiKhoan
            LEFT JOIN CapDoThanhVien CDT ON TKTN.ID_CapDo = CDT.ID_CapDo
            ORDER BY TKTN.ID_TaiKhoan
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
                TKTN.ID_TaiKhoan,
                TKTN.HoTen,
                TKTN.Phone,
                TKTN.Email,
                TKTN.DiaChi,
                TKTN.NgaySinh,
                TKTN.DiemTichLuy, -- Quan trọng để tính toán logic
                TKTN.NgayDangKy,
                CDT.TenCapDo,
                CDT.MucChietKhau
            FROM TaiKhoanThanhVien TKTN
            LEFT JOIN CapDoThanhVien CDT ON TKTN.ID_CapDo = CDT.ID_CapDo
            WHERE TKTN.ID_TaiKhoan = ?
        `;
        const [rows] = await db.executeQuery(query, [id], 'KhachHang.detail');

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

const db = require('../config/database');

// Lấy danh sách hóa đơn (có phân trang)
exports.getAllHoaDon = async (req, res) => {
    try {
        // Lấy tham số phân trang từ query string
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        
        // Query đếm tổng số - Profiler tự động log
        const countQuery = `SELECT COUNT(*) as total FROM HoaDon`;
        const [[{ total }]] = await db.executeQuery(countQuery, [], 'HoaDon.count');
        
        // Query lấy dữ liệu với phân trang
        const query = `
            SELECT 
                HD.*,
                TKTN.HoTen as TenKhachHang,
                NV.HoTen as TenNhanVien,
                CN.Ten_ChiNhanh,
                HT.TenHinhThuc as HinhThucThanhToan
            FROM (
                -- BƯỚC 1: LỌC SỚM
                -- Chỉ lấy ID của các dòng cần thiết. 
                -- Khi chưa có Index: DB vẫn phải scan bảng HoaDon nhưng không tốn RAM để JOIN các bảng kia.
                -- Khi có Index: DB chỉ cần lướt nhẹ trên Index là lấy được ngay.
                SELECT ID_HoaDon 
                FROM HoaDon 
                ORDER BY NgayLap DESC 
                LIMIT ? OFFSET ?
            ) as PageHD
            JOIN HoaDon HD ON PageHD.ID_HoaDon = HD.ID_HoaDon -- Join lại chính nó để lấy full cột
            -- BƯỚC 2: JOIN CÁC BẢNG KHÁC (Chỉ join đúng số lượng dòng của limit, ví dụ 10 dòng)
            LEFT JOIN TaiKhoanThanhVien TKTN ON HD.ID_TaiKhoan = TKTN.ID_TaiKhoan
            LEFT JOIN NhanVien NV ON HD.ID_NhanVien = NV.ID_NhanVien
            LEFT JOIN ChiNhanh CN ON NV.ID_ChiNhanh = CN.ID_ChiNhanh
            LEFT JOIN HinhThucThanhToan HT ON HD.ID_HinhThucTT = HT.ID_HinhThuc
            ORDER BY HD.NgayLap DESC
        `;
        const [rows] = await db.executeQuery(query, [limit, offset], 'HoaDon.list');
        
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
        console.error('❌ [HoaDon] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách hóa đơn',
            error: error.message
        });
    }
};

// Lấy chi tiết hóa đơn

exports.getHoaDonById = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT 
                HD.ID_HoaDon,
                HD.NgayLap,
                HD.TongTien,
                HD.GhiChu,
                HD.TrangThai,
                -- Thông tin khách hàng (Snapshot tại thời điểm query)
                TKTN.HoTen as TenKhachHang,
                TKTN.Phone as SDTKhachHang,
                -- Thông tin nhân viên & Chi nhánh
                NV.HoTen as TenNhanVien,
                CN.Ten_ChiNhanh,
                CN.DiaChi_ChiNhanh,
                -- Hình thức thanh toán
                HT.TenHinhThuc as HinhThucThanhToan
            FROM HoaDon HD
            LEFT JOIN TaiKhoanThanhVien TKTN ON HD.ID_TaiKhoan = TKTN.ID_TaiKhoan
            LEFT JOIN NhanVien NV ON HD.ID_NhanVien = NV.ID_NhanVien
            LEFT JOIN ChiNhanh CN ON NV.ID_ChiNhanh = CN.ID_ChiNhanh
            LEFT JOIN HinhThucThanhToan HT ON HD.ID_HinhThucTT = HT.ID_HinhThuc
            WHERE HD.ID_HoaDon = ?
        `;
        const [rows] = await db.executeQuery(query, [id], 'HoaDon.detail');
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy hóa đơn'
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
            message: 'Lỗi khi lấy thông tin hóa đơn',
            error: error.message
        });
    }
};

// Lấy hóa đơn theo khách hàng

//-- Index này giúp tìm nhanh hóa đơn của user A và đã sắp xếp sẵn theo ngày giảm dần
//CREATE INDEX IDX_HoaDon_User_Date ON HoaDon(ID_TaiKhoan, NgayLap DESC);

exports.getHoaDonByCustomer = async (req, res) => {
    try {
        const { customerId } = req.params;
        const query = `
            SELECT 
                HD.ID_HoaDon,
                HD.NgayLap,
                HD.TongTien,
                HD.TrangThai,
                NV.HoTen as TenNhanVien,
                CN.Ten_ChiNhanh
            FROM HoaDon HD
            -- Chỉ join những bảng thực sự cần thiết cho "Danh sách lịch sử"
            LEFT JOIN NhanVien NV ON HD.ID_NhanVien = NV.ID_NhanVien
            LEFT JOIN ChiNhanh CN ON NV.ID_ChiNhanh = CN.ID_ChiNhanh
            WHERE HD.ID_TaiKhoan = ?
            ORDER BY HD.NgayLap DESC
        `;
        const [rows] = await db.executeQuery(query, [customerId], 'HoaDon.byCustomer');
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách hóa đơn',
            error: error.message
        });
    }
};

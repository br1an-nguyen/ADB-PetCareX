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
            FROM HoaDon HD
            LEFT JOIN TaiKhoanThanhVien TKTN ON HD.ID_TaiKhoan = TKTN.ID_TaiKhoan
            LEFT JOIN NhanVien NV ON HD.ID_NhanVien = NV.ID_NhanVien
            LEFT JOIN ChiNhanh CN ON NV.ID_ChiNhanh = CN.ID_ChiNhanh
            LEFT JOIN HinhThucThanhToan HT ON HD.ID_HinhThucTT = HT.ID_HinhThuc
            ORDER BY HD.NgayLap DESC
            LIMIT ? OFFSET ?
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
                HD.*,
                TKTN.HoTen as TenKhachHang,
                TKTN.Phone as SDTKhachHang,
                NV.HoTen as TenNhanVien,
                CN.Ten_ChiNhanh,
                CN.DiaChi_ChiNhanh,
                HT.TenHinhThuc as HinhThucThanhToan
            FROM HoaDon HD
            LEFT JOIN TaiKhoanThanhVien TKTN ON HD.ID_TaiKhoan = TKTN.ID_TaiKhoan
            LEFT JOIN NhanVien NV ON HD.ID_NhanVien = NV.ID_NhanVien
            LEFT JOIN ChiNhanh CN ON NV.ID_ChiNhanh = CN.ID_ChiNhanh
            LEFT JOIN HinhThucThanhToan HT ON HD.ID_HinhThucTT = HT.ID_HinhThuc
            WHERE HD.ID_HoaDon = ?
        `;
        const [rows] = await db.query(query, [id]);
        
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
exports.getHoaDonByCustomer = async (req, res) => {
    try {
        const { customerId } = req.params;
        const query = `
            SELECT 
                HD.*,
                NV.HoTen as TenNhanVien,
                CN.Ten_ChiNhanh
            FROM HoaDon HD
            LEFT JOIN NhanVien NV ON HD.ID_NhanVien = NV.ID_NhanVien
            LEFT JOIN ChiNhanh CN ON NV.ID_ChiNhanh = CN.ID_ChiNhanh
            WHERE HD.ID_TaiKhoan = ?
            ORDER BY HD.NgayLap DESC
        `;
        const [rows] = await db.query(query, [customerId]);
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

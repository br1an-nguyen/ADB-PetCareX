const db = require('../config/database');

// Lấy danh sách hóa đơn
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

        // Query 1: Thông tin cơ bản của hóa đơn
        const invoiceQuery = `
            SELECT 
                HD.ID_HoaDon,
                HD.NgayLap,
                HD.TongTien,
                HD.KhuyenMai,
                TKTN.HoTen as TenKhachHang,
                TKTN.Phone as SDTKhachHang,
                NV.HoTen as TenNhanVien,
                CN.Ten_ChiNhanh,
                HT.TenHinhThuc as HinhThucThanhToan
            FROM HoaDon HD
            LEFT JOIN TaiKhoanThanhVien TKTN ON HD.ID_TaiKhoan = TKTN.ID_TaiKhoan
            LEFT JOIN NhanVien NV ON HD.ID_NhanVien = NV.ID_NhanVien
            LEFT JOIN ChiNhanh CN ON NV.ID_ChiNhanh = CN.ID_ChiNhanh
            LEFT JOIN HinhThucThanhToan HT ON HD.ID_HinhThucTT = HT.ID_HinhThuc
            WHERE HD.ID_HoaDon = ?
        `;
        const [invoiceRows] = await db.executeQuery(invoiceQuery, [id], 'HoaDon.detail');

        if (invoiceRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy hóa đơn'
            });
        }

        // Query 2: Chi tiết sản phẩm đã mua
        const productsQuery = `
            SELECT 
                SP.TenSanPham,
                MH.SoLuong,
                SP.GiaBan as DonGia,
                (MH.SoLuong * SP.GiaBan) as ThanhTien,
                LSP.TenLoaiSP as LoaiSanPham
            FROM DichVu_MuaHang MH
            JOIN SanPham SP ON MH.ID_SanPham = SP.ID_SanPham
            LEFT JOIN Loai_SanPham LSP ON SP.ID_LoaiSP = LSP.ID_LoaiSP
            WHERE MH.ID_HoaDon = ?
        `;
        const [productRows] = await db.executeQuery(productsQuery, [id], 'HoaDon.products');

        // Query 3: Chi tiết dịch vụ khám
        const servicesQuery = `
            SELECT 
                DV.Ten_DichVu as TenDichVu,
                DV.Loai_DichVu as LoaiDichVu,
                CNDV.Gia_DichVu as DonGia,
                TC.TenThuCung,
                PK.TrangThai,
                PK.NgayDangKy
            FROM PhieuKham PK
            JOIN ChiNhanh_DichVu CNDV ON PK.ID_DichVu = CNDV.ID_DichVuDuocDung
            JOIN DichVu DV ON CNDV.ID_DichVu = DV.ID_DichVu
            LEFT JOIN ThuCung TC ON PK.ID_ThuCung = TC.ID_ThuCung
            WHERE PK.ID_HoaDon = ?
        `;
        const [serviceRows] = await db.executeQuery(servicesQuery, [id], 'HoaDon.services');

        // Kết hợp kết quả
        const invoice = invoiceRows[0];
        invoice.sanPham = productRows;
        invoice.dichVu = serviceRows;

        res.json({
            success: true,
            data: invoice
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

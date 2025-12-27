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

        // 1. Get Main Invoice Info
        const queryHost = `
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
<<<<<<< HEAD
        const [rows] = await db.executeQuery(query, [id], 'HoaDon.detail');
        
=======
        const [rows] = await db.query(queryHost, [id]);

>>>>>>> feat/config-ui
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy hóa đơn'
            });
        }

        const invoice = rows[0];

        // 2. Query Details from 3 Sub-tables
        // A. PhieuKham (Services)
        const queryPK = `
            SELECT 
                DV.Ten_DichVu as TenHangMuc, 
                CD.Gia_DichVu as DonGia, 
                1 as SoLuong, 
                CD.Gia_DichVu as ThanhTien,
                'Phí Khám' as Loai
            FROM PhieuKham PK
            JOIN ChiNhanh_DichVu CD ON PK.ID_DichVu = CD.ID_DichVuDuocDung
            JOIN DichVu DV ON CD.ID_DichVu = DV.ID_DichVu
            WHERE PK.ID_HoaDon = ?
        `;

        // B. Mua Hang (Products)
        const queryMH = `
            SELECT 
                SP.TenSanPham as TenHangMuc, 
                SP.GiaBan as DonGia, 
                MH.SoLuong, 
                (SP.GiaBan * MH.SoLuong) as ThanhTien,
                'Mua Hàng' as Loai
            FROM DichVu_MuaHang MH
            JOIN SanPham SP ON MH.ID_SanPham = SP.ID_SanPham
            WHERE MH.ID_HoaDon = ?
        `;

        // C. Tiem Phong (Vaccines)
        const queryTP = `
            SELECT 
                DV.Ten_DichVu as TenHangMuc, 
                CD.Gia_DichVu as DonGia, 
                1 as SoLuong, 
                CD.Gia_DichVu as ThanhTien,
                'Tiêm Phòng' as Loai
            FROM DichVu_TiemPhong TP
            JOIN ChiNhanh_DichVu CD ON TP.ID_DichVu = CD.ID_DichVuDuocDung
            JOIN DichVu DV ON CD.ID_DichVu = DV.ID_DichVu
            WHERE TP.ID_HoaDon = ?
        `;

        const [detailsPK, detailsMH, detailsTP] = await Promise.all([
            db.query(queryPK, [id]),
            db.query(queryMH, [id]),
            db.query(queryTP, [id])
        ]);

        // Combine all details (each db.query returns [rows, fields], we want rows)
        const allDetails = [
            ...detailsPK[0],
            ...detailsMH[0],
            ...detailsTP[0]
        ];

        res.json({
            success: true,
            data: {
                ...invoice,
                details: allDetails
            }
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

// Tra cứu hóa đơn theo bộ lọc (Hỗ trợ params của SP + Pagination)
exports.searchHoaDon = async (req, res) => {
    try {
        let {
            page = 1,
            limit = 10,
            loai_baocao, // NGAY, THANG, QUY, NAM, KHOANG_THOI_GIAN
            ngay_input,
            thang,
            nam,
            quy,
            tu_ngay,
            den_ngay,
            id_chinhanh,
            min_price,
            max_price
        } = req.query;

        limit = parseInt(limit);
        page = parseInt(page);
        const offset = (page - 1) * limit;

        // Base Query Condition
        let whereClause = ` WHERE 1=1 `;
        const params = [];

        // Filter by Time Period (Logic matches SQL SP params)
        if (loai_baocao === 'NGAY' && ngay_input) {
            whereClause += ` AND CAST(HD.NgayLap AS DATE) = ?`;
            params.push(ngay_input);
        } else if (loai_baocao === 'THANG' && thang && nam) {
            whereClause += ` AND MONTH(HD.NgayLap) = ? AND YEAR(HD.NgayLap) = ?`;
            params.push(thang, nam);
        } else if (loai_baocao === 'QUY' && quy && nam) {
            whereClause += ` AND CEILING(MONTH(HD.NgayLap)/3.0) = ? AND YEAR(HD.NgayLap) = ?`;
            params.push(quy, nam);
        } else if (loai_baocao === 'NAM' && nam) {
            whereClause += ` AND YEAR(HD.NgayLap) = ?`;
            params.push(nam);
        } else if (loai_baocao === 'KHOANG_THOI_GIAN' && tu_ngay && den_ngay) {
            whereClause += ` AND HD.NgayLap BETWEEN ? AND ?`;
            params.push(tu_ngay, den_ngay);
        }

        // Filter by Branch
        if (id_chinhanh) {
            whereClause += ` AND NV.ID_ChiNhanh = ?`;
            params.push(id_chinhanh);
        }

        // Filter by Price range
        if (min_price) {
            whereClause += ` AND HD.TongTien >= ?`;
            params.push(min_price);
        }
        if (max_price) {
            whereClause += ` AND HD.TongTien <= ?`;
            params.push(max_price);
        }

        // 1. Count Total Records
        const countQuery = `
            SELECT COUNT(*) as total
            FROM HoaDon HD
            LEFT JOIN NhanVien NV ON HD.ID_NhanVien = NV.ID_NhanVien
            ${whereClause}
        `;
        const [[{ total }]] = await db.query(countQuery, params);

        // 2. Fetch Data with Pagination
        let dataQuery = `
            SELECT 
                HD.*,
                TKTN.HoTen as TenKhachHang,
                NV.HoTen as TenNhanVien,
                CN.Ten_ChiNhanh
            FROM HoaDon HD
            LEFT JOIN NhanVien NV ON HD.ID_NhanVien = NV.ID_NhanVien
            LEFT JOIN ChiNhanh CN ON NV.ID_ChiNhanh = CN.ID_ChiNhanh
            LEFT JOIN TaiKhoanThanhVien TKTN ON HD.ID_TaiKhoan = TKTN.ID_TaiKhoan
            ${whereClause}
            ORDER BY HD.NgayLap DESC
        `;

        const dataParams = [...params];

        // Apply Pagination only if limit is NOT -1
        if (parseInt(limit) !== -1) {
            dataQuery += ` LIMIT ? OFFSET ?`;
            dataParams.push(parseInt(limit), parseInt(offset));
        }

        const [rows] = await db.query(dataQuery, dataParams);

        res.json({
            success: true,
            data: rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: parseInt(limit) === -1 ? 1 : Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tra cứu hóa đơn',
            error: error.message
        });
    }
};

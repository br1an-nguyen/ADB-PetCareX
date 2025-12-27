const db = require('../config/database');

// 1. Tìm kiếm sản phẩm (sp_KhachHang_TimKiemSanPham)
exports.searchProducts = async (req, res) => {
    try {
        const { keyword, categoryId, minPrice, maxPrice } = req.query;

        const [rows] = await db.executeQuery(
            'CALL sp_KhachHang_TimKiemSanPham(?, ?, ?, ?)',
            [
                keyword || null,
                categoryId || null,
                parseFloat(minPrice) || 0,
                parseFloat(maxPrice) || 10000000
            ],
            'Customer.searchProducts'
        );

        res.json({
            success: true,
            data: rows[0] || rows
        });
    } catch (error) {
        console.error('❌ [Customer.searchProducts] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tìm kiếm sản phẩm',
            error: error.message
        });
    }
};

// 2. Xem lịch sử khám (sp_KhachHang_XemLichSuKham)
exports.getExamHistory = async (req, res) => {
    try {
        const { petId } = req.params;

        if (!petId) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu petId'
            });
        }

        const [rows] = await db.executeQuery(
            'CALL sp_KhachHang_XemLichSuKham(?)',
            [petId],
            'Customer.examHistory'
        );

        res.json({
            success: true,
            data: rows[0] || rows
        });
    } catch (error) {
        console.error('❌ [Customer.examHistory] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy lịch sử khám',
            error: error.message
        });
    }
};

// 3. Đặt lịch online (sp_KhachHang_DatLichOnline)
exports.bookOnline = async (req, res) => {
    try {
        const { customerId, petId, branchId, serviceId, appointmentDate } = req.body;

        if (!customerId || !petId || !branchId || !serviceId || !appointmentDate) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin: customerId, petId, branchId, serviceId, appointmentDate'
            });
        }

        await db.executeQuery(
            'CALL sp_KhachHang_DatLichOnline(?, ?, ?, ?, ?)',
            [customerId, petId, branchId, serviceId, appointmentDate],
            'Customer.bookOnline'
        );

        res.json({
            success: true,
            message: 'Đặt lịch thành công'
        });
    } catch (error) {
        console.error('❌ [Customer.bookOnline] Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi khi đặt lịch',
            error: error.message
        });
    }
};

// 4. Lấy danh sách khách hàng (để demo chọn tài khoản)
exports.getCustomerList = async (req, res) => {
    try {
        const [rows] = await db.executeQuery(
            `SELECT 
                TK.ID_TaiKhoan, TK.HoTen, TK.Phone, TK.Email,
                COUNT(TC.ID_ThuCung) as SoThuCung
             FROM TaiKhoanThanhVien TK
             LEFT JOIN ThuCung TC ON TK.ID_TaiKhoan = TC.ID_TaiKhoan
             GROUP BY TK.ID_TaiKhoan, TK.HoTen, TK.Phone, TK.Email
             ORDER BY TK.HoTen
             LIMIT 20`,
            [],
            'Customer.list'
        );

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('❌ [Customer.list] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách khách hàng',
            error: error.message
        });
    }
};

// 5. Lấy thú cưng của khách hàng (reuse từ thucung controller)
exports.getCustomerPets = async (req, res) => {
    try {
        const { customerId } = req.params;

        const [rows] = await db.executeQuery(
            `SELECT 
                TC.ID_ThuCung, TC.TenThuCung, TC.NgaySinh, TC.GioiTinh, TC.TinhTrangSucKhoe,
                G.TenGiong, L.TenLoai
             FROM ThuCung TC
             LEFT JOIN Giong G ON TC.ID_Giong = G.ID_Giong
             LEFT JOIN Loai L ON G.ID_Loai = L.ID_Loai
             WHERE TC.ID_TaiKhoan = ?
             ORDER BY TC.TenThuCung`,
            [customerId],
            'Customer.pets'
        );

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('❌ [Customer.pets] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách thú cưng',
            error: error.message
        });
    }
};

// 6. Lấy danh sách loại sản phẩm (cho filter)
exports.getProductCategories = async (req, res) => {
    try {
        const [rows] = await db.executeQuery(
            'SELECT ID_LoaiSP, TenLoaiSP FROM Loai_SanPham ORDER BY TenLoaiSP',
            [],
            'Customer.productCategories'
        );

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('❌ [Customer.productCategories] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách loại sản phẩm',
            error: error.message
        });
    }
};

// 7. Lấy danh sách dịch vụ (cho đặt lịch)
exports.getServices = async (req, res) => {
    try {
        const [rows] = await db.executeQuery(
            `SELECT 
                DV.ID_DichVu, DV.Ten_DichVu, DV.MoTa
             FROM DichVu DV
             ORDER BY DV.Ten_DichVu`,
            [],
            'Customer.services'
        );

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('❌ [Customer.services] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách dịch vụ',
            error: error.message
        });
    }
};

// 8. Tra cứu lịch khám bác sĩ (theo chi nhánh)
exports.getDoctorSchedules = async (req, res) => {
    try {
        const { branchId } = req.query;

        // Lấy danh sách bác sĩ và chi nhánh hiện tại họ đang trực
        const [rows] = await db.executeQuery(
            `SELECT 
                NV.ID_NhanVien,
                NV.HoTen,
                CV.TenChucVu,
                CN.ID_ChiNhanh,
                CN.Ten_ChiNhanh,
                LSDD.NgayBatDau
             FROM NhanVien NV
             JOIN ChucVu CV ON NV.ID_ChucVu = CV.ID_ChucVu
             JOIN LichSuDieuDong LSDD ON NV.ID_NhanVien = LSDD.ID_NhanVien
             JOIN ChiNhanh CN ON LSDD.ID_ChiNhanh = CN.ID_ChiNhanh
             WHERE CV.TenChucVu = 'Bác sĩ thú y'
               AND LSDD.NgayBatDau <= CURDATE()
               AND (LSDD.NgayKetThuc IS NULL OR LSDD.NgayKetThuc >= CURDATE())
               ${branchId ? 'AND CN.ID_ChiNhanh = ?' : ''}
             ORDER BY CN.Ten_ChiNhanh, NV.HoTen`,
            branchId ? [branchId] : [],
            'Customer.doctorSchedules'
        );

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('❌ [Customer.doctorSchedules] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy lịch bác sĩ',
            error: error.message
        });
    }
};


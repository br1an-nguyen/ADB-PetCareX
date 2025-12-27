const db = require('../config/database');

// Tra cứu khách hàng (sử dụng sp_NhanVien_TraCuuKhachHang)
exports.lookupCustomer = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query || query.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập thông tin tìm kiếm'
            });
        }

        // Call stored procedure
        const [rows] = await db.executeQuery(
            'CALL sp_NhanVien_TraCuuKhachHang(?)',
            [query],
            'Staff.lookupCustomer'
        );

        // MySQL returns results in first element of array for CALL
        const results = Array.isArray(rows[0]) ? rows[0] : rows;

        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('❌ [Staff.lookupCustomer] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tra cứu khách hàng',
            error: error.message
        });
    }
};

// Tạo phiếu khám trực tiếp (sử dụng sp_NhanVien_TaoPhieuKhamTrucTiep)
exports.createWalkinBooking = async (req, res) => {
    try {
        const { ID_NhanVien, ID_ThuCung, ID_DichVuGoc } = req.body;

        if (!ID_NhanVien || !ID_ThuCung || !ID_DichVuGoc) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bắt buộc: ID_NhanVien, ID_ThuCung, ID_DichVuGoc'
            });
        }

        // Call stored procedure
        await db.executeQuery(
            'CALL sp_NhanVien_TaoPhieuKhamTrucTiep(?, ?, ?)',
            [ID_NhanVien, ID_ThuCung, ID_DichVuGoc],
            'Staff.createWalkinBooking'
        );

        res.json({
            success: true,
            message: 'Tạo phiếu khám thành công'
        });
    } catch (error) {
        console.error('❌ [Staff.createWalkinBooking] Error:', error);

        // Check for MySQL error message from SIGNAL
        let userMessage = 'Lỗi khi tạo phiếu khám';
        if (error.message) {
            userMessage = error.message;
        }

        res.status(500).json({
            success: false,
            message: userMessage,
            error: error.message
        });
    }
};

// Đăng ký khách hàng mới (sử dụng sp_DangKiHoiVien)
exports.registerCustomer = async (req, res) => {
    try {
        const { HoTen, Phone, Email, CCCD, GioiTinh, NgaySinh } = req.body;

        if (!HoTen || !Phone) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bắt buộc: HoTen, Phone'
            });
        }

        // Call stored procedure
        await db.executeQuery(
            'CALL sp_DangKiHoiVien(?, ?, ?, ?, ?, ?)',
            [HoTen, Phone, Email || null, CCCD || null, GioiTinh || null, NgaySinh || null],
            'Staff.registerCustomer'
        );

        res.json({
            success: true,
            message: 'Đăng ký khách hàng thành công'
        });
    } catch (error) {
        console.error('❌ [Staff.registerCustomer] Error:', error);

        let userMessage = 'Lỗi khi đăng ký khách hàng';
        if (error.message && error.message.includes('đã đăng ký')) {
            userMessage = 'Số điện thoại này đã được đăng ký';
        }

        res.status(500).json({
            success: false,
            message: userMessage,
            error: error.message
        });
    }
};

// Lấy danh sách nhân viên theo chi nhánh (để chọn nhân viên làm việc)
exports.getStaffByBranch = async (req, res) => {
    try {
        const { branchId } = req.params;

        const query = `
            SELECT 
                NV.ID_NhanVien,
                NV.HoTen,
                CV.TenChucVu
            FROM NhanVien NV
            JOIN ChucVu CV ON NV.ID_ChucVu = CV.ID_ChucVu
            WHERE NV.ID_ChiNhanh = ?
            ORDER BY NV.HoTen
        `;

        const [rows] = await db.executeQuery(query, [branchId], 'Staff.getByBranch');

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('❌ [Staff.getByBranch] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách nhân viên',
            error: error.message
        });
    }
};

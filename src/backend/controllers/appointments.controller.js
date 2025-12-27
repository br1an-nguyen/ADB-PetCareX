const db = require('../config/database');

// Tạo lịch khám mới (Customer/Staff)
// Tạo lịch khám mới (Customer/Staff)
// Tạo lịch khám mới (Customer/Staff)
exports.createAppointment = async (req, res) => {
    // Đối với online booking, ta dùng logic cũ (tự insert).
    // Đối với Walk-in, ta dùng function mới.
    // Tạm thời giữ nguyên function cũ cho Customer Booking

    try {
        const { id_taikhoan, id_dichvu, id_thucung, id_chinhanh, ngay_kham } = req.body;

        if (!id_taikhoan || !id_dichvu || !id_thucung || !id_chinhanh || !ngay_kham) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin đặt lịch' });
        }

        // Gọi Stored Procedure sp_KhachHang_DatLichOnline (MySQL syntax)
        await db.query(
            `CALL sp_KhachHang_DatLichOnline(?, ?, ?, ?, ?)`,
            [id_taikhoan, id_thucung, id_chinhanh, id_dichvu, ngay_kham]
        );

        res.json({ success: true, message: 'Đặt lịch thành công' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Tạo phiếu khám trực tiếp (Walk-in for Staff)
// Sử dụng SP: sp_NhanVien_TaoPhieuKhamTrucTiep
exports.createWalkInAppointment = async (req, res) => {
    try {
        const { id_nhanvien, id_thucung, id_dichvu } = req.body;

        // Use default staff if not provided (for demo)
        const staffId = id_nhanvien || 'NV00000001';

        // Validate required fields
        if (!id_thucung || !id_dichvu) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin thú cưng hoặc dịch vụ'
            });
        }

        // Gọi Stored Procedure sp_NhanVien_TaoPhieuKhamTrucTiep (MySQL syntax)
        await db.query(
            `CALL sp_NhanVien_TaoPhieuKhamTrucTiep(?, ?, ?)`,
            [staffId, id_thucung, id_dichvu]
        );

        res.json({
            success: true,
            message: 'Tạo phiếu khám thành công'
        });
    } catch (error) {
        console.error('WalkIn Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo phiếu khám',
            error: error.message
        });
    }
};

// Lấy danh sách chờ khám (Doctor)
exports.getPendingAppointments = async (req, res) => {
    try {
        const query = `
            SELECT PK.*, TC.TenThuCung, KH.HoTen as TenChu, DV.Ten_DichVu 
            FROM PhieuKham PK
            JOIN ThuCung TC ON PK.ID_ThuCung = TC.ID_ThuCung
            JOIN TaiKhoanThanhVien KH ON TC.ID_TaiKhoan = KH.ID_TaiKhoan
            JOIN ChiNhanh_DichVu CNDV ON PK.ID_DichVu = CNDV.ID_DichVuDuocDung
            JOIN DichVu DV ON CNDV.ID_DichVu = DV.ID_DichVu
            WHERE PK.TrangThai = N'Chờ khám'
        `;
        const [rows] = await db.query(query);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Bác sĩ ghi kết quả (Doctor)
exports.updateMedicalResult = async (req, res) => {
    try {
        const { id_phieukham, id_bacsi, trieuchung, chuandoan, toathuoc, ngay_taikham } = req.body;

        // Validations...

        // Call SP sp_BacSiGhiKetQua (MySQL syntax)
        await db.query(
            `CALL sp_BacSiGhiKetQua(?, ?, ?, ?, ?, ?)`,
            [id_phieukham, id_bacsi, trieuchung, chuandoan, toathuoc, ngay_taikham]
        );

        res.json({ success: true, message: 'Lưu kết quả thành công' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Lấy lịch sử khám của thú cưng (Customer/Doctor)
// Sử dụng SP: sp_KhachHang_XemLichSuKham
exports.getPetHistory = async (req, res) => {
    try {
        const { id_thucung } = req.params;

        // Gọi Stored Procedure sp_KhachHang_XemLichSuKham
        const [rows] = await db.query(
            `EXEC sp_KhachHang_XemLichSuKham @ID_ThuCung = ?`,
            [id_thucung]
        );

        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const db = require('../config/database');

// 1. Xem lịch trực và lịch tái khám (sp_BacSi_XemLichTrinh)
exports.getSchedule = async (req, res) => {
    try {
        const { doctorId, date } = req.query;

        if (!doctorId) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu doctorId'
            });
        }

        const viewDate = date || new Date().toISOString().split('T')[0];

        // sp_BacSi_XemLichTrinh returns 2 result sets
        const [results] = await db.executeQuery(
            'CALL sp_BacSi_XemLichTrinh(?, ?)',
            [doctorId, viewDate],
            'Doctor.schedule'
        );

        res.json({
            success: true,
            data: {
                branchInfo: results[0] || [],
                followUps: results[1] || []
            },
            date: viewDate
        });
    } catch (error) {
        console.error('❌ [Doctor.schedule] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy lịch trực',
            error: error.message
        });
    }
};

// 2. Tra cứu hồ sơ bệnh án (sp_BacSi_TraCuuHoSoBenhAn)
exports.getMedicalRecords = async (req, res) => {
    try {
        const { petId } = req.params;

        if (!petId) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu petId'
            });
        }

        const [rows] = await db.executeQuery(
            'CALL sp_BacSi_TraCuuHoSoBenhAn(?)',
            [petId],
            'Doctor.medicalRecords'
        );

        res.json({
            success: true,
            data: rows[0] || rows
        });
    } catch (error) {
        console.error('❌ [Doctor.medicalRecords] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tra cứu bệnh án',
            error: error.message
        });
    }
};

// 3. Tra cứu thuốc (sp_BacSi_TraCuuThuoc)
exports.searchMedicine = async (req, res) => {
    try {
        const { keyword } = req.query;

        const [rows] = await db.executeQuery(
            'CALL sp_BacSi_TraCuuThuoc(?)',
            [keyword || ''],
            'Doctor.searchMedicine'
        );

        res.json({
            success: true,
            data: rows[0] || rows
        });
    } catch (error) {
        console.error('❌ [Doctor.searchMedicine] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tra cứu thuốc',
            error: error.message
        });
    }
};

// 4. Ghi kết quả khám (sp_BacSiGhiKetQua)
exports.saveExamResult = async (req, res) => {
    try {
        const { phieuKhamId, doctorId, symptoms, diagnosis, prescription, followUpDate } = req.body;

        if (!phieuKhamId || !doctorId) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin: phieuKhamId và doctorId là bắt buộc'
            });
        }

        await db.executeQuery(
            'CALL sp_BacSiGhiKetQua(?, ?, ?, ?, ?, ?)',
            [phieuKhamId, doctorId, symptoms || '', diagnosis || '', prescription || '', followUpDate || null],
            'Doctor.saveExamResult'
        );

        // Cập nhật trạng thái phiếu khám
        await db.executeQuery(
            "UPDATE PhieuKham SET TrangThai = 'Đã khám' WHERE ID_PhieuKham = ?",
            [phieuKhamId],
            'Doctor.updateExamStatus'
        );

        res.json({
            success: true,
            message: 'Đã lưu kết quả khám thành công'
        });
    } catch (error) {
        console.error('❌ [Doctor.saveExamResult] Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi khi lưu kết quả khám',
            error: error.message
        });
    }
};

// 5. Lấy danh sách phiếu khám đang chờ
exports.getPendingExams = async (req, res) => {
    try {
        const { branchId } = req.query;

        let query = `
            SELECT 
                PK.ID_PhieuKham,
                PK.NgayDangKy,
                PK.TrangThai,
                TC.ID_ThuCung,
                TC.TenThuCung,
                G.TenGiong,
                L.TenLoai,
                TC.TinhTrangSucKhoe,
                KH.ID_TaiKhoan,
                KH.HoTen AS TenChu,
                KH.Phone,
                DV.Ten_DichVu
            FROM PhieuKham PK
            JOIN ThuCung TC ON PK.ID_ThuCung = TC.ID_ThuCung
            JOIN Giong G ON TC.ID_Giong = G.ID_Giong
            JOIN Loai L ON G.ID_Loai = L.ID_Loai
            JOIN TaiKhoanThanhVien KH ON TC.ID_TaiKhoan = KH.ID_TaiKhoan
            JOIN ChiNhanh_DichVu CNDV ON PK.ID_DichVu = CNDV.ID_DichVuDuocDung
            JOIN DichVu DV ON CNDV.ID_DichVu = DV.ID_DichVu
            WHERE PK.TrangThai IN ('Chờ khám', 'Đã đặt lịch')
        `;

        const params = [];
        if (branchId) {
            query += ' AND CNDV.ID_ChiNhanh = ?';
            params.push(branchId);
        }

        query += ' ORDER BY PK.NgayDangKy ASC';

        const [rows] = await db.executeQuery(query, params, 'Doctor.pendingExams');

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('❌ [Doctor.pendingExams] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách phiếu khám',
            error: error.message
        });
    }
};

// 6. Lấy danh sách bác sĩ (để chọn ID mẫu)
exports.getDoctorList = async (req, res) => {
    try {
        const [rows] = await db.executeQuery(
            `SELECT NV.ID_NhanVien, NV.HoTen, CN.Ten_ChiNhanh
             FROM NhanVien NV
             JOIN ChucVu CV ON NV.ID_ChucVu = CV.ID_ChucVu
             JOIN ChiNhanh CN ON NV.ID_ChiNhanh = CN.ID_ChiNhanh
             WHERE CV.TenChucVu = 'Bác sĩ thú y'
             ORDER BY CN.Ten_ChiNhanh, NV.HoTen`,
            [],
            'Doctor.list'
        );

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('❌ [Doctor.list] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách bác sĩ',
            error: error.message
        });
    }
};

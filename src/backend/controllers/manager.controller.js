const db = require('../config/database');

// 1. Thống kê tổng hợp (sp_QuanLy_ThongKeTongHop)
exports.getThongKeTongHop = async (req, res) => {
    try {
        const { startDate, endDate, branchId } = req.query;

        // Default: tháng hiện tại
        const start = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        const end = endDate || new Date().toISOString().split('T')[0];

        const [rows] = await db.executeQuery(
            'CALL sp_QuanLy_ThongKeTongHop(?, ?, ?)',
            [start, end, branchId || null],
            'Manager.thongKeTongHop'
        );

        res.json({
            success: true,
            data: rows[0] || rows,
            period: { startDate: start, endDate: end }
        });
    } catch (error) {
        console.error('❌ [Manager.thongKeTongHop] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê tổng hợp',
            error: error.message
        });
    }
};

// 2. Doanh thu chi nhánh (sp_BaoCaoDoanhThu)
exports.getDoanhThuChiNhanh = async (req, res) => {
    try {
        const { reportType, date, month, quarter, year, branchId } = req.query;

        // Default: báo cáo theo tháng hiện tại
        const type = reportType || 'THANG';
        const m = month || new Date().getMonth() + 1;
        const y = year || new Date().getFullYear();

        const [rows] = await db.executeQuery(
            'CALL sp_BaoCaoDoanhThu(?, ?, ?, ?, ?, ?)',
            [type, date || null, m, quarter || null, y, branchId || null],
            'Manager.doanhThuChiNhanh'
        );

        res.json({
            success: true,
            data: rows[0] || rows
        });
    } catch (error) {
        console.error('❌ [Manager.doanhThuChiNhanh] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy doanh thu chi nhánh',
            error: error.message
        });
    }
};

// 3. Doanh thu sản phẩm (sp_QuanLy_DoanhThuSanPham)
exports.getDoanhThuSanPham = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Default: 30 ngày gần nhất
        const end = endDate || new Date().toISOString().split('T')[0];
        const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const [rows] = await db.executeQuery(
            'CALL sp_QuanLy_DoanhThuSanPham(?, ?)',
            [start, end],
            'Manager.doanhThuSanPham'
        );

        res.json({
            success: true,
            data: rows[0] || rows,
            period: { startDate: start, endDate: end }
        });
    } catch (error) {
        console.error('❌ [Manager.doanhThuSanPham] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy doanh thu sản phẩm',
            error: error.message
        });
    }
};

// 4. Hiệu suất bác sĩ (sp_QuanLy_HieuSuatBacSi)
exports.getHieuSuatBacSi = async (req, res) => {
    try {
        const { month, year } = req.query;

        const m = parseInt(month) || new Date().getMonth() + 1;
        const y = parseInt(year) || new Date().getFullYear();

        const [rows] = await db.executeQuery(
            'CALL sp_QuanLy_HieuSuatBacSi(?, ?)',
            [m, y],
            'Manager.hieuSuatBacSi'
        );

        res.json({
            success: true,
            data: rows[0] || rows,
            period: { month: m, year: y }
        });
    } catch (error) {
        console.error('❌ [Manager.hieuSuatBacSi] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy hiệu suất bác sĩ',
            error: error.message
        });
    }
};

// 5. Điều chỉnh lương (sp_DieuChinhLuongTheoPhanTram)
exports.adjustSalary = async (req, res) => {
    try {
        const { employeeId, percentage } = req.body;

        if (!employeeId || percentage === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin: employeeId và percentage là bắt buộc'
            });
        }

        await db.executeQuery(
            'CALL sp_DieuChinhLuongTheoPhanTram(?, ?)',
            [employeeId, percentage],
            'Manager.adjustSalary'
        );

        res.json({
            success: true,
            message: `Đã điều chỉnh lương ${percentage > 0 ? '+' : ''}${percentage}% cho nhân viên ${employeeId}`
        });
    } catch (error) {
        console.error('❌ [Manager.adjustSalary] Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi khi điều chỉnh lương',
            error: error.message
        });
    }
};

// 6. Top dịch vụ (sp_ThongKeDichVuTop)
exports.getTopDichVu = async (req, res) => {
    try {
        const [rows] = await db.executeQuery(
            'CALL sp_ThongKeDichVuTop()',
            [],
            'Manager.topDichVu'
        );

        res.json({
            success: true,
            data: rows[0] || rows
        });
    } catch (error) {
        console.error('❌ [Manager.topDichVu] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy top dịch vụ',
            error: error.message
        });
    }
};

// 7. Thống kê hội viên (sp_ThongKeHoiVien)
exports.getThongKeHoiVien = async (req, res) => {
    try {
        const [rows] = await db.executeQuery(
            'CALL sp_ThongKeHoiVien()',
            [],
            'Manager.thongKeHoiVien'
        );

        res.json({
            success: true,
            data: rows[0] || rows
        });
    } catch (error) {
        console.error('❌ [Manager.thongKeHoiVien] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê hội viên',
            error: error.message
        });
    }
};

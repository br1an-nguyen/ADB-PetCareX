const db = require('../config/database');

// Helper to get Month/Year params or default to current
const getParams = (req) => {
    const today = new Date();
    const month = req.query.month || (today.getMonth() + 1);
    const year = req.query.year || today.getFullYear();
    return { month, year };
};

// KPI 1 & 2 & 7: General Stats (Revenue, Visits, Ticket Size, Mix)
exports.getGeneralStats = async (req, res) => {
    const { month, year } = getParams(req);
    try {
        // Total Revenue & Visits
        const [overview] = await db.execute(`
            SELECT 
                SUM(TongTien) as totalRevenue, 
                COUNT(ID_HoaDon) as totalInvoices 
            FROM HoaDon 
            WHERE MONTH(NgayLap) = ? AND YEAR(NgayLap) = ?
        `, [month, year]);

        // Visit Count
        const [visits] = await db.execute(`
            SELECT COUNT(ID_PhieuKham) as totalVisits 
            FROM PhieuKham 
            WHERE MONTH(NgayDangKy) = ? AND YEAR(NgayDangKy) = ?
        `, [month, year]);

        // Revenue Mix (Service vs Product)
        // 2. Revenue Mix (Structure) - Modified to use Gross Revenue to avoid negative values
        const [mix] = await db.execute(`
                SELECT 
                    'SanPham' as type, 
                    IFNULL(SUM(d.SoLuong * s.GiaBan), 0) as revenue
                FROM DichVu_MuaHang d
                JOIN SanPham s ON d.ID_SanPham = s.ID_SanPham
                JOIN HoaDon h ON d.ID_HoaDon = h.ID_HoaDon
                WHERE MONTH(h.NgayLap) = ? AND YEAR(h.NgayLap) = ?
                
                UNION ALL
                
                SELECT 
                    'DichVu' as type,
                    (
                        (SELECT IFNULL(SUM(cdv.Gia_DichVu), 0)
                         FROM PhieuKham pk
                         JOIN ChiNhanh_DichVu cdv ON pk.ID_DichVu = cdv.ID_DichVuDuocDung
                         JOIN HoaDon h ON pk.ID_HoaDon = h.ID_HoaDon
                         WHERE MONTH(h.NgayLap) = ? AND YEAR(h.NgayLap) = ?)
                        +
                        (SELECT IFNULL(SUM(cdv.Gia_DichVu), 0)
                         FROM DichVu_TiemPhong tp
                         JOIN ChiNhanh_DichVu cdv ON tp.ID_DichVu = cdv.ID_DichVuDuocDung
                         JOIN HoaDon h ON tp.ID_HoaDon = h.ID_HoaDon
                         WHERE MONTH(h.NgayLap) = ? AND YEAR(h.NgayLap) = ?)
                    ) as revenue
            `, [month, year, month, year, month, year]);

        // Rolling 12 Months Revenue Trend
        const [trend] = await db.execute(`
           SELECT 
                DATE_FORMAT(NgayLap, '%Y-%m') as month,
                SUM(TongTien) as revenue
            FROM HoaDon
            WHERE NgayLap >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(NgayLap, '%Y-%m')
            ORDER BY month ASC
        `);

        res.json({
            success: true,
            data: {
                revenue: overview[0]?.totalRevenue || 0,
                invoices: overview[0]?.totalInvoices || 0,
                visits: visits[0]?.totalVisits || 0,
                avgTicket: overview[0]?.totalInvoices ? Math.round(overview[0].totalRevenue / overview[0].totalInvoices) : 0,
                revenueMix: mix,
                revenueTrend: trend
            }
        });
    } catch (error) {
        console.error("Stats Error:", error);
        res.status(500).json({ success: false, message: "Error fetching general stats" });
    }
};

// KPI 3: Branch Performance
exports.getBranchStats = async (req, res) => {
    const { month, year } = getParams(req);
    try {
        const [stats] = await db.execute(`
            SELECT 
                cn.Ten_ChiNhanh,
                SUM(hd.TongTien) as revenue,
                COUNT(hd.ID_HoaDon) as invoiceCount
            FROM HoaDon hd
            JOIN NhanVien nv ON hd.ID_NhanVien = nv.ID_NhanVien
            JOIN ChiNhanh cn ON nv.ID_ChiNhanh = cn.ID_ChiNhanh
            WHERE MONTH(hd.NgayLap) = ? AND YEAR(hd.NgayLap) = ?
            GROUP BY cn.Ten_ChiNhanh
            ORDER BY revenue DESC
        `, [month, year]);

        res.json({ success: true, data: stats });
    } catch (error) {
        console.error("Branch Stats Error:", error);
        res.status(500).json({ success: false, message: "Error fetching branch stats" });
    }
};

// KPI 5 & 6: Doctor Performance
exports.getDoctorStats = async (req, res) => {
    const { month, year } = getParams(req);
    try {
        const [stats] = await db.execute(`
            SELECT 
                nv.HoTen,
                COUNT(pk.ID_PhieuKham) as visitCount
            FROM PhieuKham pk
            JOIN KetQuaKham kq ON pk.ID_PhieuKham = kq.ID_PhieuKham
            JOIN NhanVien nv ON kq.ID_BacSi = nv.ID_NhanVien
            WHERE MONTH(pk.NgayDangKy) = ? AND YEAR(pk.NgayDangKy) = ?
            GROUP BY nv.HoTen
            ORDER BY visitCount DESC
            LIMIT 10
        `, [month, year]);

        res.json({ success: true, data: stats });
    } catch (error) {
        console.error("Doctor Stats Error:", error);
        res.status(500).json({ success: false, message: "Error fetching doctor stats" });
    }
};

// KPI 4: Product Stats
exports.getProductStats = async (req, res) => {
    const { month, year } = getParams(req);
    try {
        // Top Selling
        const [topSelling] = await db.execute(`
            SELECT 
                sp.TenSanPham,
                SUM(mh.SoLuong) as quantity,
                SUM(mh.SoLuong * sp.GiaBan) as revenue
            FROM DichVu_MuaHang mh
            JOIN SanPham sp ON mh.ID_SanPham = sp.ID_SanPham
            JOIN HoaDon hd ON mh.ID_HoaDon = hd.ID_HoaDon
            WHERE MONTH(hd.NgayLap) = ? AND YEAR(hd.NgayLap) = ?
            GROUP BY sp.TenSanPham
            ORDER BY revenue DESC
            LIMIT 10
        `, [month, year]);

        // Low Stock (Inventory)
        const [lowStock] = await db.execute(`
            SELECT TenSanPham, SoLuongTonKho as SoLuongTon, GiaBan as DonGia
            FROM SanPham
            WHERE SoLuongTonKho < 10
            ORDER BY SoLuongTonKho ASC
            LIMIT 10
        `);

        res.json({ success: true, data: { topSelling, lowStock } });
    } catch (error) {
        console.error("Product Stats Error:", error);
        res.status(500).json({ success: false, message: "Error fetching product stats" });
    }
};

// KPI: Revenue per Month (Legacy Support for RevenueStats.jsx)
exports.getRevenueStats = async (req, res) => {
    const { year } = getParams(req);
    try {
        const [stats] = await db.execute(`
            SELECT 
                MONTH(NgayLap) as Thang, 
                COUNT(ID_HoaDon) as SoDonHang, 
                SUM(TongTien) as DoanhThu 
            FROM HoaDon 
            WHERE YEAR(NgayLap) = ? 
            GROUP BY MONTH(NgayLap)
            ORDER BY Thang
        `, [year]);

        res.json({ success: true, data: stats });
    } catch (error) {
        console.error("Revenue Stats Error:", error);
        res.status(500).json({ success: false, message: "Error fetching revenue stats" });
    }
};

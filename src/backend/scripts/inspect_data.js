const db = require('../config/database');

const fs = require('fs');

async function inspectData() {
    try {
        let output = '--- INSPECTION REPORT ---\n';

        // 1. Count HoaDon
        const [[{ count: hoaDonCount }]] = await db.query('SELECT COUNT(*) as count FROM HoaDon');
        output += `HoaDon Count: ${hoaDonCount}\n`;

        // 2. Count PhieuKham
        const [[{ count: phieuKhamCount }]] = await db.query('SELECT COUNT(*) as count FROM PhieuKham');
        output += `PhieuKham Count: ${phieuKhamCount}\n`;

        // 3. Count DichVu_MuaHang
        const [[{ count: muaHangCount }]] = await db.query('SELECT COUNT(*) as count FROM DichVu_MuaHang');
        output += `DichVu_MuaHang Count: ${muaHangCount}\n`;

        // 4. Count DichVu_TiemPhong
        const [[{ count: tiemPhongCount }]] = await db.query('SELECT COUNT(*) as count FROM DichVu_TiemPhong');
        output += `DichVu_TiemPhong Count: ${tiemPhongCount}\n`;

        // 5. Check Sample
        if (hoaDonCount > 0) {
            const [sample] = await db.query(`
                SELECT HD.ID_HoaDon, HD.TongTien 
                FROM HoaDon HD
                LIMIT 1
            `);
            output += `Sample HoaDon: ${JSON.stringify(sample[0])}\n`;
        }
        const [rows] = await db.execute(`
            SELECT 
                (SELECT IFNULL(SUM(d.SoLuong * s.GiaBan), 0) 
                 FROM DichVu_MuaHang d 
                 JOIN SanPham s ON d.ID_SanPham = s.ID_SanPham
                 JOIN HoaDon h ON d.ID_HoaDon = h.ID_HoaDon) as ProductRevenue,
                 
                (SELECT IFNULL(SUM(cdv.Gia_DichVu), 0)
                 FROM PhieuKham pk
                 JOIN ChiNhanh_DichVu cdv ON pk.ID_DichVu = cdv.ID_DichVuDuocDung
                 JOIN HoaDon h ON pk.ID_HoaDon = h.ID_HoaDon) as MedicalRevenue,

                (SELECT IFNULL(SUM(cdv.Gia_DichVu), 0)
                 FROM DichVu_TiemPhong tp
                 JOIN ChiNhanh_DichVu cdv ON tp.ID_DichVu = cdv.ID_DichVuDuocDung
                 JOIN HoaDon h ON tp.ID_HoaDon = h.ID_HoaDon) as VaccineRevenue,

                (SELECT SUM(TongTien) FROM HoaDon) as TotalInvoiceRevenue
        `);

        output += `\nRevenue Verification:\n`;
        output += JSON.stringify(rows[0], null, 2);

        // Check for invoices where Product Cost > Invoice Total using LIST prices
        const [badInvoices] = await db.execute(`
            SELECT h.ID_HoaDon, h.TongTien, SUM(d.SoLuong * s.GiaBan) as ProductListPrice
            FROM HoaDon h
            JOIN DichVu_MuaHang d ON h.ID_HoaDon = d.ID_HoaDon
            JOIN SanPham s ON d.ID_SanPham = s.ID_SanPham
            GROUP BY h.ID_HoaDon, h.TongTien
            HAVING SUM(d.SoLuong * s.GiaBan) > h.TongTien
            LIMIT 5
        `);
        output += `\n\nPotential Bad Invoices (ListPrice > TongTien):\n`;
        output += JSON.stringify(badInvoices, null, 2);

        fs.writeFileSync('inspection_result.txt', output);
        console.log('Inspection written to inspection_result.txt');
        process.exit(0);
    } catch (error) {
        console.error("Error verifying revenue:", error);
        process.exit(1);
    }
}

inspectData();

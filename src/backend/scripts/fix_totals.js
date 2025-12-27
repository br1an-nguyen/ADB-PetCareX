const db = require('../config/database');

async function fixTotals() {
    try {
        console.log('--- STARTING TOTAL RECALCULATION ---');
        console.log('This may take a moment...');

        // Query to update details based on PhieuKham, MuaHang, and TiemPhong
        // Note: Using a streamlined logic compatible with the schema

        const updateQuery = `
            UPDATE HoaDon HD
            LEFT JOIN (
                SELECT ID_HoaDon, SUM(Total) as GrandTotal
                FROM (
                    -- 1. PhieuKham: Price from ChiNhanh_DichVu
                    SELECT PK.ID_HoaDon, SUM(CD.Gia_DichVu) as Total
                    FROM PhieuKham PK
                    JOIN ChiNhanh_DichVu CD ON PK.ID_DichVu = CD.ID_DichVuDuocDung
                    GROUP BY PK.ID_HoaDon

                    UNION ALL

                    -- 2. DichVu_MuaHang: Price from SanPham * Quantity
                    SELECT MH.ID_HoaDon, SUM(SP.GiaBan * MH.SoLuong) as Total
                    FROM DichVu_MuaHang MH
                    JOIN SanPham SP ON MH.ID_SanPham = SP.ID_SanPham
                    GROUP BY MH.ID_HoaDon

                    UNION ALL

                    -- 3. DichVu_TiemPhong: Price from ChiNhanh_DichVu
                    SELECT TP.ID_HoaDon, SUM(CD.Gia_DichVu) as Total
                    FROM DichVu_TiemPhong TP
                    JOIN ChiNhanh_DichVu CD ON TP.ID_DichVu = CD.ID_DichVuDuocDung
                    GROUP BY TP.ID_HoaDon
                ) Combined
                GROUP BY ID_HoaDon
            ) Calc ON HD.ID_HoaDon = Calc.ID_HoaDon
            SET HD.TongTien = COALESCE(Calc.GrandTotal, 0);
        `;

        const [result] = await db.query(updateQuery);

        console.log(`✅ UPDATE COMPLETED.`);
        console.log(`Changed Rows: ${result.changedRows}`);
        console.log(`Affected Rows: ${result.affectedRows}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ FIX TOTALS ERROR:', error);
        process.exit(1);
    }
}

fixTotals();

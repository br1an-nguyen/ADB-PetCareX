const mysql = require('mysql2');
require('dotenv').config();

// 1. CẤU HÌNH KẾT NỐI (Từ .env)
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
});

const sqlCommands = [
    // =============================================
    // TẠO INDEXES ĐỂ TỐI ƯU HIỆU SUẤT TRẢ CỨU
    // =============================================

    // 1. Index cho bảng TaiKhoanThanhVien (Tìm kiếm theo SĐT)
    "CREATE INDEX IX_TaiKhoan_Phone ON TaiKhoanThanhVien(Phone)",

    // 2. Index cho bảng HoaDon (Tìm theo nhân viên và ngày lập)
    "CREATE INDEX IX_HoaDon_ID_NhanVien ON HoaDon(ID_NhanVien)",
    "CREATE INDEX IX_HoaDon_NgayLap ON HoaDon(NgayLap)",

    // 3. Index cho bảng DichVu_TiemPhong (Tìm theo thú cưng và ngày tiêm)
    "CREATE INDEX IX_DichVu_TiemPhong_ID_ThuCung ON DichVu_TiemPhong(ID_ThuCung)",
    "CREATE INDEX IX_DichVu_TiemPhong_NgayTiem ON DichVu_TiemPhong(NgayTiem)",

    // 4. Index cho bảng DichVu_MuaHang (Tìm theo sản phẩm)
    "CREATE INDEX IX_DichVu_MuaHang_SanPham ON DichVu_MuaHang(ID_SanPham)",

    // 5. Index cho bảng ThuCung (Tìm theo tài khoản chủ)
    "CREATE INDEX IX_ThuCung_ID_TaiKhoan ON ThuCung(ID_TaiKhoan)",

    // 6. Index cho bảng PhieuKham (Tìm theo thú cưng và ngày đăng ký)
    "CREATE INDEX IX_PhieuKham_ID_ThuCung ON PhieuKham(ID_ThuCung)",
    "CREATE INDEX IX_PhieuKham_NgayDangKy ON PhieuKham(NgayDangKy)",

    // 7. Index cho bảng KetQuaKham (Tìm theo bác sĩ)
    "CREATE INDEX IX_KetQuaKham_ID_BacSi ON KetQuaKham(ID_BacSi)"
];

async function runCommands() {
    console.log("⏳ Đang tạo các INDEX để tối ưu hiệu suất...");
    const promiseDb = db.promise();

    for (const [index, cmd] of sqlCommands.entries()) {
        try {
            await promiseDb.query(cmd);
            console.log(`✅ [${index + 1}/${sqlCommands.length}] Thành công.`);
        } catch (err) {
            // Bỏ qua lỗi nếu index đã tồn tại
            if (err.code === 'ER_DUP_KEYNAME') {
                console.log(`⚠️ [${index + 1}/${sqlCommands.length}] Index đã tồn tại, bỏ qua.`);
            } else {
                console.error(`❌ Lỗi tại lệnh số ${index + 1}:`, err.message);
            }
        }
    }
    console.log("🎉 Hoàn tất tạo Indexes!");
    db.end();
}

runCommands();

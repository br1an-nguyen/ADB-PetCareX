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
    // ==========================================================
    // 1. Trigger Khuyến Mãi (Dùng BEFORE để sửa dữ liệu trước khi lưu)
    // ==========================================================
    "DROP TRIGGER IF EXISTS trg_CapNhanKhuyenMai_GoiTiem",
    `CREATE TRIGGER trg_CapNhanKhuyenMai_GoiTiem
     BEFORE UPDATE ON DichVu_TiemPhong
     FOR EACH ROW
     BEGIN
        IF NEW.GoiTiem <> OLD.GoiTiem OR (OLD.GoiTiem IS NULL AND NEW.GoiTiem IS NOT NULL) THEN
            IF NEW.GoiTiem >= 12 THEN SET NEW.KhuyenMai = 15;
            ELSEIF NEW.GoiTiem >= 6 THEN SET NEW.KhuyenMai = 5;
            ELSE SET NEW.KhuyenMai = 0;
            END IF;
        END IF;
     END`,

    // ==========================================================
    // 2. Trigger Cập nhật trạng thái khám
    // ==========================================================
    "DROP TRIGGER IF EXISTS trg_CapNhatTrangThaiKham",
    `CREATE TRIGGER trg_CapNhatTrangThaiKham
     AFTER INSERT ON KetQuaKham
     FOR EACH ROW
     BEGIN
        UPDATE PhieuKham SET TrangThai = 'Đã khám' WHERE ID_PhieuKham = NEW.ID_PhieuKham;
     END`,

    // ==========================================================
    // 3. Trigger Tính lại Tổng Tiền (Phải tách ra 3 cái cho mỗi bảng)
    // ==========================================================
    
    // --- Bảng PhieuKham ---
    "DROP TRIGGER IF EXISTS trg_PhieuKham_Insert",
    `CREATE TRIGGER trg_PhieuKham_Insert AFTER INSERT ON PhieuKham FOR EACH ROW BEGIN CALL sp_TinhLaiTongTien(NEW.ID_HoaDon); END`,
    
    "DROP TRIGGER IF EXISTS trg_PhieuKham_Update",
    `CREATE TRIGGER trg_PhieuKham_Update AFTER UPDATE ON PhieuKham FOR EACH ROW BEGIN CALL sp_TinhLaiTongTien(NEW.ID_HoaDon); CALL sp_TinhLaiTongTien(OLD.ID_HoaDon); END`,
    
    "DROP TRIGGER IF EXISTS trg_PhieuKham_Delete",
    `CREATE TRIGGER trg_PhieuKham_Delete AFTER DELETE ON PhieuKham FOR EACH ROW BEGIN CALL sp_TinhLaiTongTien(OLD.ID_HoaDon); END`,

    // --- Bảng DichVu_TiemPhong ---
    "DROP TRIGGER IF EXISTS trg_TiemPhong_Insert",
    `CREATE TRIGGER trg_TiemPhong_Insert AFTER INSERT ON DichVu_TiemPhong FOR EACH ROW BEGIN CALL sp_TinhLaiTongTien(NEW.ID_HoaDon); END`,

    "DROP TRIGGER IF EXISTS trg_TiemPhong_Update",
    `CREATE TRIGGER trg_TiemPhong_Update AFTER UPDATE ON DichVu_TiemPhong FOR EACH ROW BEGIN CALL sp_TinhLaiTongTien(NEW.ID_HoaDon); CALL sp_TinhLaiTongTien(OLD.ID_HoaDon); END`,

    "DROP TRIGGER IF EXISTS trg_TiemPhong_Delete",
    `CREATE TRIGGER trg_TiemPhong_Delete AFTER DELETE ON DichVu_TiemPhong FOR EACH ROW BEGIN CALL sp_TinhLaiTongTien(OLD.ID_HoaDon); END`,

    // --- Bảng DichVu_MuaHang ---
    "DROP TRIGGER IF EXISTS trg_MuaHang_Insert",
    `CREATE TRIGGER trg_MuaHang_Insert AFTER INSERT ON DichVu_MuaHang FOR EACH ROW BEGIN CALL sp_TinhLaiTongTien(NEW.ID_HoaDon); END`,

    "DROP TRIGGER IF EXISTS trg_MuaHang_Update",
    `CREATE TRIGGER trg_MuaHang_Update AFTER UPDATE ON DichVu_MuaHang FOR EACH ROW BEGIN CALL sp_TinhLaiTongTien(NEW.ID_HoaDon); CALL sp_TinhLaiTongTien(OLD.ID_HoaDon); END`,

    "DROP TRIGGER IF EXISTS trg_MuaHang_Delete",
    `CREATE TRIGGER trg_MuaHang_Delete AFTER DELETE ON DichVu_MuaHang FOR EACH ROW BEGIN CALL sp_TinhLaiTongTien(OLD.ID_HoaDon); END`,

    // ==========================================================
    // 4. Trigger Quản lý Kho Hàng (Cũng phải tách ra)
    // ==========================================================
    
    "DROP TRIGGER IF EXISTS trg_Kho_GiamHangKhiBan",
    `CREATE TRIGGER trg_Kho_GiamHangKhiBan AFTER INSERT ON DichVu_MuaHang
     FOR EACH ROW
     BEGIN
        UPDATE SanPham SET SoLuongTonKho = SoLuongTonKho - NEW.SoLuong WHERE ID_SanPham = NEW.ID_SanPham;
     END`,

    "DROP TRIGGER IF EXISTS trg_Kho_TraHangKhiHuy",
    `CREATE TRIGGER trg_Kho_TraHangKhiHuy AFTER DELETE ON DichVu_MuaHang
     FOR EACH ROW
     BEGIN
        UPDATE SanPham SET SoLuongTonKho = SoLuongTonKho + OLD.SoLuong WHERE ID_SanPham = OLD.ID_SanPham;
     END`,

    "DROP TRIGGER IF EXISTS trg_Kho_CapNhatKhiSua",
    `CREATE TRIGGER trg_Kho_CapNhatKhiSua AFTER UPDATE ON DichVu_MuaHang
     FOR EACH ROW
     BEGIN
        UPDATE SanPham SET SoLuongTonKho = SoLuongTonKho + OLD.SoLuong - NEW.SoLuong WHERE ID_SanPham = NEW.ID_SanPham;
     END`,

    // ==========================================================
    // 5. Trigger Cập nhật Điểm & Hạng (Phức tạp nhất)
    // ==========================================================
    "DROP TRIGGER IF EXISTS trg_CapNhatDiem_Va_HangThanhVien",
    `CREATE TRIGGER trg_CapNhatDiem_Va_HangThanhVien
     AFTER UPDATE ON HoaDon
     FOR EACH ROW
     BEGIN
        DECLARE v_NamHienTai int DEFAULT YEAR(CURDATE());
        DECLARE v_DiemThayDoi int;
        DECLARE v_TongChiTieuHienTai float;
        DECLARE v_TenHangMoi varchar(30);
        DECLARE v_ID_CapDoMoi char(10);

        -- Chỉ chạy khi Tổng tiền thay đổi và Có khách hàng
        IF NEW.TongTien <> OLD.TongTien AND NEW.ID_TaiKhoan IS NOT NULL THEN
            
            -- 1. Tạo bản ghi chi tiêu năm nếu chưa có (Tương tự MERGE)
            INSERT INTO TongChiTieuNam(ID_TaiKhoan, Nam, TongTienNamTruoc, TongTienNamNay) 
            SELECT NEW.ID_TaiKhoan, v_NamHienTai, 0, 0
            WHERE NOT EXISTS (SELECT 1 FROM TongChiTieuNam WHERE ID_TaiKhoan = NEW.ID_TaiKhoan AND Nam = v_NamHienTai);

            -- 2. Cập nhật tổng chi tiêu năm nay
            UPDATE TongChiTieuNam
            SET TongTienNamNay = TongTienNamNay + (NEW.TongTien - OLD.TongTien)
            WHERE ID_TaiKhoan = NEW.ID_TaiKhoan AND Nam = v_NamHienTai;

            -- 3. Tính điểm thay đổi
            SET v_DiemThayDoi = CAST((NEW.TongTien - OLD.TongTien) / 50000 AS SIGNED);

            -- 4. Lấy tổng chi tiêu mới nhất để xét hạng
            SELECT TongTienNamNay INTO v_TongChiTieuHienTai 
            FROM TongChiTieuNam WHERE ID_TaiKhoan = NEW.ID_TaiKhoan AND Nam = v_NamHienTai;

            -- 5. Xác định hạng mới (Gọi Function XacDinhHang đã tạo ở bước trước)
            SET v_TenHangMoi = XacDinhHang(v_TongChiTieuHienTai, NEW.ID_TaiKhoan);
            
            -- 6. Lấy ID cấp độ mới
            SELECT ID_CapDo INTO v_ID_CapDoMoi FROM CapDoThanhVien WHERE TenCapDo = v_TenHangMoi LIMIT 1;

            -- 7. Cập nhật vào tài khoản
            UPDATE TaiKhoanThanhVien
            SET SoDiem = SoDiem + v_DiemThayDoi,
                ID_CapDo = v_ID_CapDoMoi
            WHERE ID_TaiKhoan = NEW.ID_TaiKhoan;
        END IF;
     END`
];

async function runCommands() {
    console.log("⏳ Đang cài đặt TRIGGERS (Đây là bước cuối cùng)...");
    const promiseDb = db.promise();

    for (const [index, cmd] of sqlCommands.entries()) {
        try {
            await promiseDb.query(cmd);
            console.log(`✅ [${index + 1}/${sqlCommands.length}] Thành công.`);
        } catch (err) {
            console.error(`❌ Lỗi tại lệnh số ${index + 1}:`, err.message);
        }
    }
    console.log("🎉 XONG! Database của bạn đã đầy đủ Bảng, Dữ liệu, Procedure và Trigger.");
    db.end();
}

runCommands();
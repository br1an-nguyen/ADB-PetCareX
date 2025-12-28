const mysql = require('mysql2');
const path = require('path');
const dotenv = require('dotenv');
const ENV_PROFILE = process.env.ENV_PROFILE; // 'index' | 'non-index'
const EXPLICIT_ENV = process.env.ENV_FILE;
let envPath;
if (EXPLICIT_ENV && EXPLICIT_ENV.length > 0) {
    envPath = path.isAbsolute(EXPLICIT_ENV) ? EXPLICIT_ENV : path.join(__dirname, EXPLICIT_ENV);
} else if (ENV_PROFILE === 'index') {
    envPath = path.join(__dirname, 'index.env');
} else if (ENV_PROFILE === 'non-index') {
    envPath = path.join(__dirname, 'non-index.env');
} else {
    envPath = path.join(__dirname, '.env');
}
dotenv.config({ path: envPath });

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
    // --- XÓA CÁC PROCEDURE CŨ ĐỂ TRÁNH LỖI TRÙNG LẶP ---
    "DROP PROCEDURE IF EXISTS sp_ThemLoai",
    "DROP PROCEDURE IF EXISTS sp_ThemGiong",
    "DROP PROCEDURE IF EXISTS sp_ThemThuCung",
    "DROP PROCEDURE IF EXISTS sp_DangKiHoiVien",
    "DROP PROCEDURE IF EXISTS sp_CapNhatThongTinTK",
    "DROP PROCEDURE IF EXISTS sp_ThemSanPham",
    "DROP PROCEDURE IF EXISTS sp_CapNhatThongTinPet",
    "DROP PROCEDURE IF EXISTS sp_BacSiGhiKetQua",
    "DROP PROCEDURE IF EXISTS sp_NhanVien_TaoPhieuKhamTrucTiep",
    "DROP PROCEDURE IF EXISTS sp_ThemPhieuTiemPhong",
    "DROP PROCEDURE IF EXISTS sp_DangKyGoiTiem",
    "DROP PROCEDURE IF EXISTS sp_ThemDonMuaHang",
    "DROP PROCEDURE IF EXISTS sp_TinhLaiTongTien",
    "DROP PROCEDURE IF EXISTS sp_DieuChuyenNhanSu",
    "DROP PROCEDURE IF EXISTS sp_GuiDanhGia",
    "DROP PROCEDURE IF EXISTS sp_NhapThemHangVaoKho",

    // =============================================
    // BẮT ĐẦU TẠO PROCEDURE (FULL LIST)
    // =============================================

    // 1. sp_ThemLoai
    `CREATE PROCEDURE sp_ThemLoai(IN p_TenLoai varchar(50), IN p_MoTa varchar(100))
    BEGIN
        IF EXISTS (SELECT 1 FROM Loai WHERE TenLoai = p_TenLoai) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tên loài này đã tồn tại.';
        ELSE
            INSERT INTO Loai(ID_Loai, TenLoai, MoTa) VALUES (TaoIDLoai(), p_TenLoai, p_MoTa);
        END IF;
    END`,

    // 2. sp_ThemGiong
    `CREATE PROCEDURE sp_ThemGiong(IN p_TenGiong varchar(50), IN p_TenLoai varchar(50), IN p_DacDiem varchar(100))
    BEGIN
        DECLARE v_ID_Loai char(10);
        SELECT ID_Loai INTO v_ID_Loai FROM Loai WHERE TenLoai = p_TenLoai LIMIT 1;

        IF v_ID_Loai IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Loài vật chưa có trong hệ thống.';
        ELSEIF EXISTS (SELECT 1 FROM Giong WHERE TenGiong = p_TenGiong AND ID_Loai = v_ID_Loai) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Giống này đã tồn tại.';
        ELSE
            INSERT INTO Giong(ID_Giong, ID_Loai, TenGiong, DacDiem) VALUES (TaoIDGiong(), v_ID_Loai, p_TenGiong, p_DacDiem);
        END IF;
    END`,

    // 3. sp_ThemThuCung
    `CREATE PROCEDURE sp_ThemThuCung(IN p_TenThuCung varchar(50), IN p_ID_TaiKhoan char(10), IN p_TenLoai varchar(50), IN p_TenGiong varchar(50), IN p_NgaySinh date, IN p_GioiTinh char(3), IN p_TinhTrangSucKhoe varchar(50))
    BEGIN
        DECLARE v_ID_Giong_TimThay char(10);

        IF NOT EXISTS (SELECT 1 FROM TaiKhoanThanhVien WHERE ID_TaiKhoan = p_ID_TaiKhoan) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tài khoản không tồn tại.';
        END IF;

        IF p_NgaySinh > CURDATE() THEN
             SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ngày sinh không hợp lệ.';
        END IF;

        SELECT G.ID_Giong INTO v_ID_Giong_TimThay FROM Giong G JOIN Loai L ON G.ID_Loai = L.ID_Loai WHERE L.TenLoai = p_TenLoai AND G.TenGiong = p_TenGiong LIMIT 1;

        IF v_ID_Giong_TimThay IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Loài hoặc Giống không hợp lệ.';
        ELSE
            INSERT INTO ThuCung(ID_ThuCung, ID_TaiKhoan, ID_Giong, TenThuCung, NgaySinh, GioiTinh, TinhTrangSucKhoe)
            VALUES (TaoIDThuCung(), p_ID_TaiKhoan, v_ID_Giong_TimThay, p_TenThuCung, p_NgaySinh, p_GioiTinh, p_TinhTrangSucKhoe);
        END IF;
    END`,

    // 4. sp_DangKiHoiVien
    `CREATE PROCEDURE sp_DangKiHoiVien(IN p_Ten_KhachHang varchar(50), IN p_SDT char(10), IN p_Email varchar(30), IN p_CCCD char(12), IN p_GioiTinh char(3), IN p_NgaySinh date)
    BEGIN
        DECLARE v_ID_CapDoCoBan char(10);
        SELECT ID_CapDo INTO v_ID_CapDoCoBan FROM CapDoThanhVien WHERE TenCapDo = 'Cơ bản' LIMIT 1;

        IF EXISTS (SELECT 1 FROM TaiKhoanThanhVien WHERE Phone = p_SDT) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Số điện thoại đã đăng ký.';
        ELSE
            INSERT INTO TaiKhoanThanhVien (ID_TaiKhoan, ID_CapDo, HoTen, Phone, Email, CCCD, GioiTinh, NgaySinh, SoDiem)
            VALUES (TaoIDTaiKhoan(), v_ID_CapDoCoBan, p_Ten_KhachHang, p_SDT, p_Email, p_CCCD, p_GioiTinh, p_NgaySinh, 0);
        END IF;
    END`,



    // 6. sp_CapNhatThongTinTK
    `CREATE PROCEDURE sp_CapNhatThongTinTK(IN p_ID_TaiKhoan char(10), IN p_HoTen varchar(50), IN p_Phone char(10), IN p_Email varchar(30), IN p_CCCD char(12), IN p_GioiTinh char(3), IN p_NgaySinh date, IN p_SoDiem int)
    BEGIN
        IF NOT EXISTS (SELECT * FROM TaiKhoanThanhVien WHERE p_ID_TaiKhoan = ID_TaiKhoan) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Không tìm thấy ID tài khoản phù hợp';
        END IF;

        UPDATE TaiKhoanThanhVien
        SET
            HoTen = COALESCE(p_HoTen, HoTen),
            Phone = COALESCE(p_Phone, Phone),
            Email = COALESCE(p_Email, Email),
            CCCD = COALESCE(p_CCCD, CCCD),
            GioiTinh = COALESCE(p_GioiTinh, GioiTinh),
            NgaySinh = COALESCE(p_NgaySinh, NgaySinh),
            SoDiem = COALESCE(p_SoDiem, SoDiem)
        WHERE ID_TaiKhoan = p_ID_TaiKhoan;
    END`,

    // 7. sp_ThemSanPham
    `CREATE PROCEDURE sp_ThemSanPham(IN p_ID_LoaiSP char(10), IN p_TenSanPham varchar(50), IN p_GiaBan float, IN p_SoLuongTonKho int)
    BEGIN
        IF EXISTS (SELECT 1 FROM SanPham WHERE TenSanPham = p_TenSanPham) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Hệ thống đã tồn tại Tên Sản phầm';
        ELSEIF NOT EXISTS (SELECT 1 FROM Loai_SanPham WHERE ID_LoaiSP = p_ID_LoaiSP) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Không tồn tại loại sản phẩm trên';
        ELSE
            INSERT INTO SanPham(ID_SanPham, ID_LoaiSP, TenSanPham, GiaBan, SoLuongTonKho)
            VALUES (TaoIDSanPham(), p_ID_LoaiSP, p_TenSanPham, p_GiaBan, p_SoLuongTonKho);
        END IF;
    END`,

    // 8. sp_CapNhatThongTinPet
    `CREATE PROCEDURE sp_CapNhatThongTinPet(IN p_ID_ThuCung char(10), IN p_TenThuCung varchar(50), IN p_TenLoai varchar(50), IN p_TenGiong varchar(50), IN p_GioiTinh char(3), IN p_NgaySinh date, IN p_TinhTrangSucKhoe varchar(50))
    BEGIN
        DECLARE v_ID_Giong_Moi char(10);
        
        IF NOT EXISTS (SELECT 1 FROM ThuCung WHERE ID_ThuCung = p_ID_ThuCung) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Không tồn tại thú cưng có ID phù hợp';
        END IF;

        SELECT ID_Giong INTO v_ID_Giong_Moi FROM ThuCung WHERE ID_ThuCung = p_ID_ThuCung;

        IF p_TenLoai IS NOT NULL AND p_TenGiong IS NOT NULL THEN
            SELECT G.ID_Giong INTO v_ID_Giong_Moi FROM Giong G JOIN Loai L ON G.ID_Loai = L.ID_Loai WHERE L.TenLoai = p_TenLoai AND G.TenGiong = p_TenGiong LIMIT 1;
            IF v_ID_Giong_Moi IS NULL THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Loài hoặc Giống mới không hợp lệ.';
            END IF;
        END IF;

        UPDATE ThuCung
        SET
            TenThuCung = COALESCE(p_TenThuCung, TenThuCung),
            ID_Giong = v_ID_Giong_Moi,
            NgaySinh = COALESCE(p_NgaySinh, NgaySinh),
            GioiTinh = COALESCE(p_GioiTinh, GioiTinh),
            TinhTrangSucKhoe = COALESCE(p_TinhTrangSucKhoe, TinhTrangSucKhoe)
        WHERE ID_ThuCung = p_ID_ThuCung;
    END`,

    // 9. sp_NhanVien_TaoPhieuKhamTrucTiep (Tạo phiếu khám trực tiếp tại quầy)
    `CREATE PROCEDURE sp_NhanVien_TaoPhieuKhamTrucTiep(IN p_ID_NhanVien char(10), IN p_ID_ThuCung char(10), IN p_ID_DichVuGoc char(10))
    BEGIN
        DECLARE v_ID_ChiNhanh char(10);
        DECLARE v_ID_DichVuChiNhanh char(10);
        DECLARE v_GiaTien float;
        DECLARE v_ID_ChuSoHuu char(10);
        DECLARE v_ID_HoaDonMoi char(10);
        
        -- 1. Xác định Chi nhánh của nhân viên đang làm việc
        IF NOT EXISTS (SELECT 1 FROM NhanVien WHERE ID_NhanVien = p_ID_NhanVien) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Nhân viên không tồn tại.';
        END IF;
        
        SELECT ID_ChiNhanh INTO v_ID_ChiNhanh FROM NhanVien WHERE ID_NhanVien = p_ID_NhanVien;

        -- 2. Lấy ID dịch vụ chi nhánh (kèm giá tiền)
        SELECT ID_DichVuDuocDung, Gia_DichVu INTO v_ID_DichVuChiNhanh, v_GiaTien
        FROM ChiNhanh_DichVu 
        WHERE ID_ChiNhanh = v_ID_ChiNhanh AND ID_DichVu = p_ID_DichVuGoc;

        IF v_ID_DichVuChiNhanh IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Chi nhánh hiện tại của bạn không có dịch vụ này.';
        END IF;

        -- 3. Lấy thông tin chủ thú cưng để gắn vào hóa đơn
        SELECT ID_TaiKhoan INTO v_ID_ChuSoHuu FROM ThuCung WHERE ID_ThuCung = p_ID_ThuCung;
        
        IF v_ID_ChuSoHuu IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Thú cưng không tồn tại.';
        END IF;

        -- 4. Tạo Hóa Đơn Mới (Tính luôn tiền dịch vụ khám ban đầu)
        SET v_ID_HoaDonMoi = TaoIDHoaDon();
        
        INSERT INTO HoaDon(ID_HoaDon, NgayLap, ID_NhanVien, ID_TaiKhoan, ID_HinhThucTT, TongTien, KhuyenMai)
        VALUES (v_ID_HoaDonMoi, NOW(), p_ID_NhanVien, v_ID_ChuSoHuu, 'TT001', v_GiaTien, 0);

        -- 5. Tạo Phiếu Khám (Trạng thái: Chờ khám)
        INSERT INTO PhieuKham(ID_PhieuKham, ID_HoaDon, ID_DichVu, ID_ThuCung, TrangThai, NgayDangKy)
        VALUES (TaoIDPhieuKham(), v_ID_HoaDonMoi, v_ID_DichVuChiNhanh, p_ID_ThuCung, 'Chờ khám', NOW());
    END`,

    // 10. sp_BacSiGhiKetQua
    `CREATE PROCEDURE sp_BacSiGhiKetQua(IN p_ID_PhieuKham char(10), IN p_ID_BacSi char(10), IN p_TrieuChung varchar(200), IN p_ChuanDoan varchar(200), IN p_ToaThuoc varchar(200), IN p_NgayHenTaiKham date)
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM PhieuKham WHERE ID_PhieuKham = p_ID_PhieuKham) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Phiếu khám không tồn tại.';
        ELSEIF EXISTS (SELECT 1 FROM KetQuaKham WHERE ID_PhieuKham = p_ID_PhieuKham) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Phiếu này đã được khám xong rồi.';
        ELSE
            INSERT INTO KetQuaKham(ID_KetQua, ID_PhieuKham, ID_BacSi, TrieuChung, ChuanDoan, ToaThuoc, NgayHenTaiKham)
            VALUES (TaoIDKetQua(), p_ID_PhieuKham, p_ID_BacSi, p_TrieuChung, p_ChuanDoan, p_ToaThuoc, p_NgayHenTaiKham);
        END IF;
    END`,

    // 11. sp_ThemPhieuTiemPhong
    `CREATE PROCEDURE sp_ThemPhieuTiemPhong(IN p_ID_HoaDon char(10), IN p_ID_DichVu char(10), IN p_ID_NhanVien char(10), IN p_ID_ThuCung char(10), IN p_ID_LoaiVacxin char(10), IN p_NgayTiem date, IN p_lieuLuong float, IN p_GoiTiem int, IN p_KhuyenMai int)
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM HoaDon WHERE ID_HoaDon = p_ID_HoaDon) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Không tìm thấy hóa đơn hợp lệ';
        ELSEIF NOT EXISTS (SELECT 1 FROM ChiNhanh_DichVu WHERE ID_DichVuDuocDung = p_ID_DichVu) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Không có dịch vụ phù hợp';
        ELSEIF NOT EXISTS (SELECT 1 FROM DichVu dv JOIN ChiNhanh_DichVu cn_dv ON dv.ID_DichVu = cn_dv.ID_DichVu WHERE dv.Ten_DichVu = 'Tiêm Phòng' AND cn_dv.ID_DichVuDuocDung = p_ID_DichVu) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Dịch vụ được chọn không phải dịch vụ tiêm phòng';
        ELSEIF NOT EXISTS (SELECT 1 FROM ThuCung WHERE ID_ThuCung = p_ID_ThuCung) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Không tồn tại thú cưng';
        ELSEIF NOT EXISTS (SELECT 1 FROM Loai_Vacxin WHERE ID_LoaiVacxin = p_ID_LoaiVacxin ) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Không có loại Vác-xin phù hợp';
        ELSE
            INSERT INTO DichVu_TiemPhong(ID_HoaDon, ID_DichVu, ID_NhanVien, ID_ThuCung, ID_LoaiVacxin, NgayTiem, LieuLuong, GoiTiem, KhuyenMai)
            VALUES (p_ID_HoaDon, p_ID_DichVu, p_ID_NhanVien, p_ID_ThuCung, p_ID_LoaiVacxin, p_NgayTiem, p_lieuLuong, NULL, NULL);
        END IF;
    END`,

    // 12. sp_DangKyGoiTiem
    `CREATE PROCEDURE sp_DangKyGoiTiem(IN p_ID_HoaDon char(10), IN p_ID_DichVu char(10), IN p_ID_NhanVien char(10), IN p_ID_ThuCung char(10), IN p_ID_LoaiVacxin char(10), IN p_GoiTiem int)
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM HoaDon WHERE ID_HoaDon = p_ID_HoaDon) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Không tìm thấy hóa đơn hợp lệ';
        ELSE
            UPDATE DichVu_TiemPhong
            SET GoiTiem = COALESCE(p_GoiTiem, GoiTiem)
            WHERE p_ID_HoaDon = ID_HoaDon AND p_ID_DichVu = ID_DichVu AND p_ID_NhanVien = ID_NhanVien 
            AND p_ID_ThuCung = ID_ThuCung AND p_ID_LoaiVacxin = ID_LoaiVacxin;
        END IF;
    END`,

    // 13. sp_ThemDonMuaHang
    `CREATE PROCEDURE sp_ThemDonMuaHang(IN p_ID_HoaDon char(10), IN p_ID_DichVu char(10), IN p_ID_SanPham char(10), IN p_SoLuong int)
    BEGIN
        DECLARE v_TonKho int;
        SELECT SoLuongTonKho INTO v_TonKho FROM SanPham WHERE ID_SanPham = p_ID_SanPham;

        IF NOT EXISTS (SELECT 1 FROM HoaDon WHERE ID_HoaDon = p_ID_HoaDon) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Không tìm thấy hóa đơn hợp lệ';
        ELSEIF v_TonKho IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Không tồn tại sản phầm cần mua';
        ELSEIF p_SoLuong > v_TonKho THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Số Lượng sản phẩm tồn kho không đủ';
        ELSE
            INSERT INTO DichVu_MuaHang(ID_HoaDon, ID_DichVu, ID_SanPham, SoLuong)
            VALUES (p_ID_HoaDon, p_ID_DichVu, p_ID_SanPham, p_SoLuong);
        END IF;
    END`,

    // 14. sp_TinhLaiTongTien 
    `CREATE PROCEDURE sp_TinhLaiTongTien(IN p_ID_HoaDon CHAR(10))
     BEGIN
        DECLARE v_TongTienMoi FLOAT DEFAULT 0;
        SELECT IFNULL(SUM(ThanhTien), 0) INTO v_TongTienMoi
        FROM (
            SELECT CD.Gia_DichVu AS ThanhTien FROM PhieuKham PK JOIN ChiNhanh_DichVu CD ON PK.ID_DichVu = CD.ID_DichVuDuocDung WHERE PK.ID_HoaDon = p_ID_HoaDon
            UNION ALL
            SELECT CD.Gia_DichVu AS ThanhTien FROM DichVu_TiemPhong TP JOIN ChiNhanh_DichVu CD ON TP.ID_DichVu = CD.ID_DichVuDuocDung WHERE TP.ID_HoaDon = p_ID_HoaDon
            UNION ALL
            SELECT (SP.GiaBan * MH.SoLuong) AS ThanhTien FROM DichVu_MuaHang MH JOIN SanPham SP ON MH.ID_SanPham = SP.ID_SanPham WHERE MH.ID_HoaDon = p_ID_HoaDon
        ) AS TongHopChiPhi;
        UPDATE HoaDon SET TongTien = v_TongTienMoi WHERE ID_HoaDon = p_ID_HoaDon;
     END`,

    // 15. sp_DieuChuyenNhanSu 
    `CREATE PROCEDURE sp_DieuChuyenNhanSu(IN p_ID_NhanVien char(10), IN p_ID_ChiNhanhMoi char(10))
    BEGIN
        DECLARE v_ID_ChiNhanhCu char(10);
        DECLARE v_NgayHienTai date DEFAULT CURDATE();

        IF NOT EXISTS (SELECT 1 FROM NhanVien WHERE ID_NhanVien = p_ID_NhanVien) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Nhân viên không tồn tại';
        END IF;

        SELECT ID_ChiNhanh INTO v_ID_ChiNhanhCu FROM NhanVien WHERE ID_NhanVien = p_ID_NhanVien;

        IF v_ID_ChiNhanhCu = p_ID_ChiNhanhMoi THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Nhân viên đang làm việc tại chi nhánh này rồi';
        ELSE
            UPDATE LichSuDieuDong
            SET NgayKetThuc = DATE_SUB(v_NgayHienTai, INTERVAL 1 DAY) 
            WHERE ID_NhanVien = p_ID_NhanVien AND ID_ChiNhanh = v_ID_ChiNhanhCu AND NgayKetThuc IS NULL;

            INSERT INTO LichSuDieuDong(ID_NhanVien, ID_ChiNhanh, NgayBatDau, NgayKetThuc)
            VALUES (p_ID_NhanVien, p_ID_ChiNhanhMoi, v_NgayHienTai, NULL); 

            UPDATE NhanVien SET ID_ChiNhanh = p_ID_ChiNhanhMoi WHERE ID_NhanVien = p_ID_NhanVien;
        END IF;
    END`,

    // 16. sp_GuiDanhGia 
    `CREATE PROCEDURE sp_GuiDanhGia(IN p_ID_TaiKhoan char(10), IN p_ID_ChiNhanh char(10), IN p_DiemDichVu int, IN p_NhanXetNhanVien varchar(50), IN p_MucDoHaiLong varchar(50), IN p_BinhLuan varchar(100))
    BEGIN
        IF p_DiemDichVu < 1 OR p_DiemDichVu > 5 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Điểm dịch vụ phải từ 1 đến 5';
        ELSE
            INSERT INTO DanhGia (ID_TaiKhoan, ID_ChiNhanh, DiemDichVu, NhanXetNhanVien, MucDohaiLong, BinhLuan)
            VALUES (p_ID_TaiKhoan, p_ID_ChiNhanh, p_DiemDichVu, p_NhanXetNhanVien, p_MucDoHaiLong, p_BinhLuan)
            ON DUPLICATE KEY UPDATE
                DiemDichVu = VALUES(DiemDichVu),
                NhanXetNhanVien = VALUES(NhanXetNhanVien),
                MucDohaiLong = VALUES(MucDohaiLong),
                BinhLuan = VALUES(BinhLuan);
        END IF;
    END`,

    // 17. sp_NhapThemHangVaoKho
    `CREATE PROCEDURE sp_NhapThemHangVaoKho(IN p_ID_SanPham char(10), IN p_SoLuongNhap int)
    BEGIN
        IF p_SoLuongNhap <= 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Số lượng nhập phải lớn hơn 0';
        ELSEIF NOT EXISTS (SELECT 1 FROM SanPham WHERE ID_SanPham = p_ID_SanPham) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Sản phẩm không tồn tại';
        ELSE
            UPDATE SanPham
            SET SoLuongTonKho = SoLuongTonKho + p_SoLuongNhap
            WHERE ID_SanPham = p_ID_SanPham;
        END IF;
    END`
];

async function runCommands() {
    console.log("⏳ Đang cài đặt TOÀN BỘ Stored Procedures...");
    const promiseDb = db.promise();

    for (const [index, cmd] of sqlCommands.entries()) {
        try {
            await promiseDb.query(cmd);
            console.log(`✅ [${index + 1}/${sqlCommands.length}] Thành công.`);
        } catch (err) {
            console.error(`❌ Lỗi tại lệnh số ${index + 1}:`, err.message);
        }
    }
    console.log("🎉 Hoàn tất!");
    db.end();
}

runCommands();
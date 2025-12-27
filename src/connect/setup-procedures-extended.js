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
    "DROP PROCEDURE IF EXISTS sp_BaoCaoDoanhThu",
    "DROP PROCEDURE IF EXISTS sp_DanhSachTiemPhongTrongKy",
    "DROP PROCEDURE IF EXISTS sp_ThongKeVacxinHot",
    "DROP PROCEDURE IF EXISTS sp_BaoCaoTonKhoVaSucBan",
    "DROP PROCEDURE IF EXISTS sp_TraCuuHoSoBenhAn",
    "DROP PROCEDURE IF EXISTS sp_QuanLy_DoanhThuChiNhanh",
    "DROP PROCEDURE IF EXISTS sp_BacSi_XemLichTrinh",
    "DROP PROCEDURE IF EXISTS sp_KhachHang_DatLichOnline",
    "DROP PROCEDURE IF EXISTS sp_KhachHang_TimKiemSanPham",
    "DROP PROCEDURE IF EXISTS sp_KhachHang_XemLichSuKham",
    "DROP PROCEDURE IF EXISTS sp_BacSi_TraCuuHoSoBenhAn",
    "DROP PROCEDURE IF EXISTS sp_BacSi_TraCuuThuoc",
    "DROP PROCEDURE IF EXISTS sp_NhanVien_TraCuuKhachHang",
    "DROP PROCEDURE IF EXISTS sp_QuanLy_ThongKeTongHop",
    "DROP PROCEDURE IF EXISTS sp_QuanLy_HieuSuatBacSi",
    "DROP PROCEDURE IF EXISTS sp_QuanLy_DoanhThuSanPham",
    "DROP PROCEDURE IF EXISTS sp_ThemNhanVien",
    "DROP PROCEDURE IF EXISTS sp_CapNhatNhanVien",
    "DROP PROCEDURE IF EXISTS sp_DieuChinhLuongTheoPhanTram",
    "DROP PROCEDURE IF EXISTS sp_XoaNhanVien",
    "DROP PROCEDURE IF EXISTS sp_BaoCaoDoanhThu_ChiNhanh_HeThong",
    "DROP PROCEDURE IF EXISTS sp_ThongKeDichVuTop",
    "DROP PROCEDURE IF EXISTS sp_ThongKeThuCungChamSoc",
    "DROP PROCEDURE IF EXISTS sp_ThongKeHoiVien",
    "DROP PROCEDURE IF EXISTS sp_TraCuuNhanVien",

    // =============================================
    // CÁC PROCEDURES QUẢN LÝ & THỐNG KÊ
    // =============================================

    // 1. sp_BaoCaoDoanhThu
    `CREATE PROCEDURE sp_BaoCaoDoanhThu(
        IN p_LoaiBaoCao VARCHAR(10),
        IN p_NgayInput DATE,
        IN p_Thang INT,
        IN p_Quy INT,
        IN p_Nam INT,
        IN p_ID_ChiNhanh CHAR(10)
    )
    BEGIN
        SELECT 
            CN.ID_ChiNhanh,
            CN.Ten_ChiNhanh,
            COUNT(HD.ID_HoaDon) AS SoLuongDonHang,
            IFNULL(SUM(HD.TongTien), 0) AS TongDoanhThu
        FROM HoaDon HD
        JOIN NhanVien NV ON HD.ID_NhanVien = NV.ID_NhanVien
        JOIN ChiNhanh CN ON NV.ID_ChiNhanh = CN.ID_ChiNhanh
        WHERE 
            (p_ID_ChiNhanh IS NULL OR CN.ID_ChiNhanh = p_ID_ChiNhanh)
            AND (
                (p_LoaiBaoCao = 'NGAY' AND CAST(HD.NgayLap AS DATE) = p_NgayInput)
                OR (p_LoaiBaoCao = 'THANG' AND MONTH(HD.NgayLap) = p_Thang AND YEAR(HD.NgayLap) = p_Nam)
                OR (p_LoaiBaoCao = 'QUY' AND QUARTER(HD.NgayLap) = p_Quy AND YEAR(HD.NgayLap) = p_Nam)
                OR (p_LoaiBaoCao = 'NAM' AND YEAR(HD.NgayLap) = p_Nam)
            )
        GROUP BY CN.ID_ChiNhanh, CN.Ten_ChiNhanh
        ORDER BY TongDoanhThu DESC;
    END`,

    // 2. sp_DanhSachTiemPhongTrongKy
    `CREATE PROCEDURE sp_DanhSachTiemPhongTrongKy(
        IN p_LoaiBaoCao VARCHAR(10),
        IN p_NgayInput DATE,
        IN p_Thang INT,
        IN p_Quy INT,
        IN p_Nam INT
    )
    BEGIN
        SELECT 
            TP.NgayTiem,
            KH.HoTen AS ChuNhan,
            KH.Phone AS SDT,
            TC.TenThuCung,
            CONCAT(L.TenLoai, ' - ', G.TenGiong) AS GiongLoai,
            VX.Ten_LoaiVacxin,
            TP.LieuLuong,
            CASE 
                WHEN TP.GoiTiem IS NULL THEN 'Tiêm lẻ'
                ELSE CONCAT('Gói ', CAST(TP.GoiTiem AS CHAR(5)), ' mũi')
            END AS HinhThucTiem,
            NV.HoTen AS NguoiTiem
        FROM DichVu_TiemPhong TP
        JOIN ThuCung TC ON TP.ID_ThuCung = TC.ID_ThuCung
        JOIN TaiKhoanThanhVien KH ON TC.ID_TaiKhoan = KH.ID_TaiKhoan
        JOIN Giong G ON TC.ID_Giong = G.ID_Giong
        JOIN Loai L ON G.ID_Loai = L.ID_Loai
        JOIN Loai_Vacxin VX ON TP.ID_LoaiVacxin = VX.ID_LoaiVacxin
        JOIN NhanVien NV ON TP.ID_NhanVien = NV.ID_NhanVien
        WHERE 
            (
                (p_LoaiBaoCao = 'NGAY' AND TP.NgayTiem = p_NgayInput)
                OR (p_LoaiBaoCao = 'THANG' AND MONTH(TP.NgayTiem) = p_Thang AND YEAR(TP.NgayTiem) = p_Nam)
                OR (p_LoaiBaoCao = 'QUY' AND QUARTER(TP.NgayTiem) = p_Quy AND YEAR(TP.NgayTiem) = p_Nam)
                OR (p_LoaiBaoCao = 'NAM' AND YEAR(TP.NgayTiem) = p_Nam)
            )
        ORDER BY TP.NgayTiem DESC;
    END`,

    // 3. sp_ThongKeVacxinHot
    `CREATE PROCEDURE sp_ThongKeVacxinHot(
        IN p_LoaiBaoCao VARCHAR(10),
        IN p_NgayInput DATE,
        IN p_Thang INT,
        IN p_Quy INT,
        IN p_Nam INT
    )
    BEGIN
        SELECT 
            VX.ID_LoaiVacxin,
            VX.Ten_LoaiVacxin,
            COUNT(TP.ID_LoaiVacxin) AS SoLuongMuiTiem
        FROM DichVu_TiemPhong TP
        JOIN Loai_Vacxin VX ON TP.ID_LoaiVacxin = VX.ID_LoaiVacxin
        WHERE 
            (
                (p_LoaiBaoCao = 'NGAY' AND TP.NgayTiem = p_NgayInput)
                OR (p_LoaiBaoCao = 'THANG' AND MONTH(TP.NgayTiem) = p_Thang AND YEAR(TP.NgayTiem) = p_Nam)
                OR (p_LoaiBaoCao = 'QUY' AND QUARTER(TP.NgayTiem) = p_Quy AND YEAR(TP.NgayTiem) = p_Nam)
                OR (p_LoaiBaoCao = 'NAM' AND YEAR(TP.NgayTiem) = p_Nam)
            )
        GROUP BY VX.ID_LoaiVacxin, VX.Ten_LoaiVacxin
        ORDER BY SoLuongMuiTiem DESC;
    END`,

    // 4. sp_BaoCaoTonKhoVaSucBan
    `CREATE PROCEDURE sp_BaoCaoTonKhoVaSucBan(
        IN p_LoaiBaoCao VARCHAR(10),
        IN p_NgayInput DATE,
        IN p_Thang INT,
        IN p_Quy INT,
        IN p_Nam INT
    )
    BEGIN
        SELECT 
            SP.ID_SanPham,
            SP.TenSanPham,
            LSP.TenLoaiSP,
            SP.GiaBan,
            SP.SoLuongTonKho AS TonKhoHienTai,
            IFNULL(SUM(CASE 
                WHEN 
                    (p_LoaiBaoCao = 'NGAY' AND HD.NgayLap = p_NgayInput) OR
                    (p_LoaiBaoCao = 'THANG' AND MONTH(HD.NgayLap) = p_Thang AND YEAR(HD.NgayLap) = p_Nam) OR
                    (p_LoaiBaoCao = 'QUY' AND QUARTER(HD.NgayLap) = p_Quy AND YEAR(HD.NgayLap) = p_Nam) OR
                    (p_LoaiBaoCao = 'NAM' AND YEAR(HD.NgayLap) = p_Nam)
                THEN MH.SoLuong 
                ELSE 0 
            END), 0) AS DaBanTrongKy,
            IFNULL(SUM(CASE 
                WHEN 
                    (p_LoaiBaoCao = 'NGAY' AND HD.NgayLap = p_NgayInput) OR
                    (p_LoaiBaoCao = 'THANG' AND MONTH(HD.NgayLap) = p_Thang AND YEAR(HD.NgayLap) = p_Nam) OR
                    (p_LoaiBaoCao = 'QUY' AND QUARTER(HD.NgayLap) = p_Quy AND YEAR(HD.NgayLap) = p_Nam) OR
                    (p_LoaiBaoCao = 'NAM' AND YEAR(HD.NgayLap) = p_Nam)
                THEN MH.SoLuong * SP.GiaBan
                ELSE 0 
            END), 0) AS DoanhThuSanPham
        FROM SanPham SP
        JOIN Loai_SanPham LSP ON SP.ID_LoaiSP = LSP.ID_LoaiSP
        LEFT JOIN DichVu_MuaHang MH ON SP.ID_SanPham = MH.ID_SanPham
        LEFT JOIN HoaDon HD ON MH.ID_HoaDon = HD.ID_HoaDon
        GROUP BY SP.ID_SanPham, SP.TenSanPham, LSP.TenLoaiSP, SP.GiaBan, SP.SoLuongTonKho
        ORDER BY DaBanTrongKy DESC;
    END`,

    // 5. sp_TraCuuHoSoBenhAn
    `CREATE PROCEDURE sp_TraCuuHoSoBenhAn(IN p_SDT_ChuNhan CHAR(10), IN p_TenThuCung VARCHAR(50))
    BEGIN
        DECLARE v_ID_TaiKhoan CHAR(10);
        
        IF NOT EXISTS (SELECT 1 FROM TaiKhoanThanhVien WHERE Phone = p_SDT_ChuNhan) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Số điện thoại này chưa đăng ký thành viên.';
        END IF;

        SELECT ID_TaiKhoan INTO v_ID_TaiKhoan FROM TaiKhoanThanhVien WHERE Phone = p_SDT_ChuNhan;

        SELECT 
            TC.TenThuCung,
            PK.NgayDangKy AS NgayKham,
            NV.HoTen AS BacSiKham,
            KQ.ChuanDoan,
            CASE 
                WHEN KQ.ID_KetQua IS NULL THEN 'Đang chờ khám'
                ELSE 'Hoàn thành'
            END AS TrangThai
        FROM ThuCung TC
        JOIN PhieuKham PK ON TC.ID_ThuCung = PK.ID_ThuCung
        LEFT JOIN KetQuaKham KQ ON PK.ID_PhieuKham = KQ.ID_PhieuKham
        LEFT JOIN NhanVien NV ON KQ.ID_BacSi = NV.ID_NhanVien
        WHERE TC.ID_TaiKhoan = v_ID_TaiKhoan
          AND (p_TenThuCung IS NULL OR TC.TenThuCung LIKE CONCAT('%', p_TenThuCung, '%'))
        ORDER BY PK.NgayDangKy DESC;
    END`,

    // 6. sp_QuanLy_DoanhThuChiNhanh
    `CREATE PROCEDURE sp_QuanLy_DoanhThuChiNhanh(IN p_TuNgay date, IN p_DenNgay date)
    BEGIN
        SELECT 
            CN.ID_ChiNhanh,
            CN.Ten_ChiNhanh,
            COUNT(HD.ID_HoaDon) AS TongSoHoaDon,
            IFNULL(SUM(HD.TongTien), 0) AS TongDoanhThu,
            CASE WHEN COUNT(HD.ID_HoaDon) > 0 
                 THEN IFNULL(SUM(HD.TongTien), 0) / COUNT(HD.ID_HoaDon) 
                 ELSE 0 
            END AS TrungBinhHoaDon
        FROM ChiNhanh CN
        LEFT JOIN NhanVien NV ON CN.ID_ChiNhanh = NV.ID_ChiNhanh
        LEFT JOIN HoaDon HD ON NV.ID_NhanVien = HD.ID_NhanVien
        WHERE (HD.NgayLap BETWEEN p_TuNgay AND p_DenNgay) OR (HD.ID_HoaDon IS NULL)
        GROUP BY CN.ID_ChiNhanh, CN.Ten_ChiNhanh
        ORDER BY TongDoanhThu DESC;
    END`,

    // 7. sp_BacSi_XemLichTrinh
    `CREATE PROCEDURE sp_BacSi_XemLichTrinh(IN p_ID_BacSi char(10), IN p_NgayXem date)
    BEGIN
        SELECT 
            NV.HoTen, 
            CN.Ten_ChiNhanh, 
            LSDD.NgayBatDau AS BatDauTaiChiNhanh
        FROM NhanVien NV
        JOIN LichSuDieuDong LSDD ON NV.ID_NhanVien = LSDD.ID_NhanVien
        JOIN ChiNhanh CN ON LSDD.ID_ChiNhanh = CN.ID_ChiNhanh
        WHERE NV.ID_NhanVien = p_ID_BacSi
          AND LSDD.NgayBatDau <= p_NgayXem
          AND (LSDD.NgayKetThuc IS NULL OR LSDD.NgayKetThuc >= p_NgayXem);

        SELECT 
            PK.ID_PhieuKham AS MaPhieuCu,
            TC.TenThuCung,
            KH.HoTen AS ChuSoHuu,
            KH.Phone,
            KQ.ChuanDoan AS BenhCu,
            KQ.GhiChu
        FROM KetQuaKham KQ
        JOIN PhieuKham PK ON KQ.ID_PhieuKham = PK.ID_PhieuKham
        JOIN ThuCung TC ON PK.ID_ThuCung = TC.ID_ThuCung
        JOIN TaiKhoanThanhVien KH ON TC.ID_TaiKhoan = KH.ID_TaiKhoan
        WHERE KQ.ID_BacSi = p_ID_BacSi 
          AND KQ.NgayHenTaiKham = p_NgayXem;
    END`,

    // 8. sp_KhachHang_DatLichOnline
    `CREATE PROCEDURE sp_KhachHang_DatLichOnline(
        IN p_ID_TaiKhoan char(10),
        IN p_ID_ThuCung char(10),
        IN p_ID_ChiNhanh char(10),
        IN p_ID_DichVuGoc char(10),
        IN p_NgayHen datetime
    )
    BEGIN
        DECLARE v_ID_DichVuChiNhanh char(10);
        DECLARE v_ID_HoaDonMoi char(10);
        DECLARE v_ID_NhanVienDaiDien char(10);
        
        IF p_NgayHen <= NOW() THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ngày hẹn phải lớn hơn thời điểm hiện tại.';
        END IF;

        SELECT ID_DichVuDuocDung INTO v_ID_DichVuChiNhanh 
        FROM ChiNhanh_DichVu 
        WHERE ID_ChiNhanh = p_ID_ChiNhanh AND ID_DichVu = p_ID_DichVuGoc;

        IF v_ID_DichVuChiNhanh IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Chi nhánh này không cung cấp dịch vụ bạn chọn.';
        END IF;

        SET v_ID_HoaDonMoi = TaoIDHoaDon();
        
        SELECT ID_NhanVien INTO v_ID_NhanVienDaiDien 
        FROM NhanVien 
        WHERE ID_ChiNhanh = p_ID_ChiNhanh 
        LIMIT 1;

        INSERT INTO HoaDon(ID_HoaDon, NgayLap, TongTien, ID_NhanVien, ID_TaiKhoan, ID_HinhThucTT)
        VALUES (v_ID_HoaDonMoi, NOW(), 0, v_ID_NhanVienDaiDien, p_ID_TaiKhoan, 'TT001');

        INSERT INTO PhieuKham(ID_PhieuKham, ID_HoaDon, ID_DichVu, ID_ThuCung, TrangThai, NgayDangKy)
        VALUES (TaoIDPhieuKham(), v_ID_HoaDonMoi, v_ID_DichVuChiNhanh, p_ID_ThuCung, 'Đã đặt lịch', p_NgayHen);
    END`,

    // 9. sp_KhachHang_TimKiemSanPham
    `CREATE PROCEDURE sp_KhachHang_TimKiemSanPham(
        IN p_TuKhoa varchar(50),
        IN p_ID_LoaiSP char(10),
        IN p_GiaMin float,
        IN p_GiaMax float
    )
    BEGIN
        SELECT 
            SP.TenSanPham, 
            LSP.TenLoaiSP, 
            SP.GiaBan, 
            SP.SoLuongTonKho
        FROM SanPham SP
        JOIN Loai_SanPham LSP ON SP.ID_LoaiSP = LSP.ID_LoaiSP
        WHERE (p_TuKhoa IS NULL OR SP.TenSanPham LIKE CONCAT('%', p_TuKhoa, '%'))
          AND (p_ID_LoaiSP IS NULL OR SP.ID_LoaiSP = p_ID_LoaiSP)
          AND (SP.GiaBan BETWEEN p_GiaMin AND p_GiaMax)
          AND SP.SoLuongTonKho > 0;
    END`,

    // 10. sp_KhachHang_XemLichSuKham
    `CREATE PROCEDURE sp_KhachHang_XemLichSuKham(IN p_ID_ThuCung char(10))
    BEGIN
        SELECT 
            PK.NgayDangKy,
            DV.Ten_DichVu,
            NV.HoTen AS BacSiKham,
            KQ.ChuanDoan,
            KQ.ToaThuoc,
            KQ.NgayHenTaiKham
        FROM PhieuKham PK
        JOIN ChiNhanh_DichVu CNDV ON PK.ID_DichVu = CNDV.ID_DichVuDuocDung
        JOIN DichVu DV ON CNDV.ID_DichVu = DV.ID_DichVu
        LEFT JOIN KetQuaKham KQ ON PK.ID_PhieuKham = KQ.ID_PhieuKham
        LEFT JOIN NhanVien NV ON KQ.ID_BacSi = NV.ID_NhanVien
        WHERE PK.ID_ThuCung = p_ID_ThuCung
        ORDER BY PK.NgayDangKy DESC;
    END`,

    // 11. sp_BacSi_TraCuuHoSoBenhAn
    `CREATE PROCEDURE sp_BacSi_TraCuuHoSoBenhAn(IN p_ID_ThuCung char(10))
    BEGIN
        SELECT 
            PK.ID_PhieuKham,
            PK.NgayDangKy,
            KQ.TrieuChung,
            KQ.ChuanDoan,
            KQ.ToaThuoc,
            KQ.GhiChu,
            NV.HoTen AS BacSiPhuTrachTruocDo
        FROM PhieuKham PK
        JOIN KetQuaKham KQ ON PK.ID_PhieuKham = KQ.ID_PhieuKham
        JOIN NhanVien NV ON KQ.ID_BacSi = NV.ID_NhanVien
        WHERE PK.ID_ThuCung = p_ID_ThuCung
        ORDER BY PK.NgayDangKy DESC;
    END`,

    // 12. sp_BacSi_TraCuuThuoc
    `CREATE PROCEDURE sp_BacSi_TraCuuThuoc(IN p_TenThuoc varchar(50))
    BEGIN
        SELECT SP.ID_SanPham, SP.TenSanPham, SP.SoLuongTonKho, SP.GiaBan
        FROM SanPham SP
        JOIN Loai_SanPham LSP ON SP.ID_LoaiSP = LSP.ID_LoaiSP
        WHERE LSP.TenLoaiSP = 'Thuốc'
          AND SP.TenSanPham LIKE CONCAT('%', p_TenThuoc, '%')
          AND SP.SoLuongTonKho > 0;
    END`,

    // 13. sp_NhanVien_TraCuuKhachHang
    `CREATE PROCEDURE sp_NhanVien_TraCuuKhachHang(IN p_ThongTinTraCuu varchar(50))
    BEGIN
        SELECT 
            KH.ID_TaiKhoan, 
            KH.HoTen AS TenChu, 
            KH.Phone, 
            CD.TenCapDo,
            TC.ID_ThuCung,
            TC.TenThuCung,
            G.TenGiong,
            TC.TinhTrangSucKhoe
        FROM TaiKhoanThanhVien KH
        LEFT JOIN CapDoThanhVien CD ON KH.ID_CapDo = CD.ID_CapDo
        LEFT JOIN ThuCung TC ON KH.ID_TaiKhoan = TC.ID_TaiKhoan
        LEFT JOIN Giong G ON TC.ID_Giong = G.ID_Giong
        WHERE KH.Phone LIKE CONCAT('%', p_ThongTinTraCuu, '%') 
           OR KH.HoTen LIKE CONCAT('%', p_ThongTinTraCuu, '%');
    END`,

    // 14. sp_QuanLy_ThongKeTongHop
    `CREATE PROCEDURE sp_QuanLy_ThongKeTongHop(
        IN p_NgayBatDau DATE,
        IN p_NgayKetThuc DATE,
        IN p_ID_ChiNhanh char(10)
    )
    BEGIN
        SELECT 
            CN.Ten_ChiNhanh,
            COUNT(DISTINCT PK.ID_PhieuKham) AS SoLuotKham,
            SUM(IFNULL(HD.TongTien, 0)) AS TongDoanhThu
        FROM HoaDon HD
        JOIN NhanVien NV ON HD.ID_NhanVien = NV.ID_NhanVien
        JOIN ChiNhanh CN ON NV.ID_ChiNhanh = CN.ID_ChiNhanh
        LEFT JOIN PhieuKham PK ON HD.ID_HoaDon = PK.ID_HoaDon
        WHERE HD.NgayLap BETWEEN p_NgayBatDau AND p_NgayKetThuc
          AND (p_ID_ChiNhanh IS NULL OR CN.ID_ChiNhanh = p_ID_ChiNhanh)
        GROUP BY CN.Ten_ChiNhanh;
    END`,

    // 15. sp_QuanLy_HieuSuatBacSi
    `CREATE PROCEDURE sp_QuanLy_HieuSuatBacSi(IN p_Thang int, IN p_Nam int)
    BEGIN
        SELECT 
            NV.ID_NhanVien,
            NV.HoTen,
            CN.Ten_ChiNhanh,
            COUNT(KQ.ID_KetQua) AS SoCaKham,
            SUM(CNDV.Gia_DichVu) AS DoanhThuKhamBenh
        FROM NhanVien NV
        JOIN KetQuaKham KQ ON NV.ID_NhanVien = KQ.ID_BacSi
        JOIN PhieuKham PK ON KQ.ID_PhieuKham = PK.ID_PhieuKham
        JOIN ChiNhanh_DichVu CNDV ON PK.ID_DichVu = CNDV.ID_DichVuDuocDung
        JOIN ChiNhanh CN ON NV.ID_ChiNhanh = CN.ID_ChiNhanh
        WHERE MONTH(PK.NgayDangKy) = p_Thang AND YEAR(PK.NgayDangKy) = p_Nam
        GROUP BY NV.ID_NhanVien, NV.HoTen, CN.Ten_ChiNhanh
        ORDER BY DoanhThuKhamBenh DESC;
    END`,

    // 16. sp_QuanLy_DoanhThuSanPham
    `CREATE PROCEDURE sp_QuanLy_DoanhThuSanPham(IN p_NgayBatDau DATE, IN p_NgayKetThuc DATE)
    BEGIN
        SELECT 
            LSP.TenLoaiSP,
            SP.TenSanPham,
            SUM(MH.SoLuong) AS SoLuongDaBan,
            SUM(MH.SoLuong * SP.GiaBan) AS DoanhThu
        FROM DichVu_MuaHang MH
        JOIN HoaDon HD ON MH.ID_HoaDon = HD.ID_HoaDon
        JOIN SanPham SP ON MH.ID_SanPham = SP.ID_SanPham
        JOIN Loai_SanPham LSP ON SP.ID_LoaiSP = LSP.ID_LoaiSP
        WHERE HD.NgayLap BETWEEN p_NgayBatDau AND p_NgayKetThuc
        GROUP BY LSP.TenLoaiSP, SP.TenSanPham
        ORDER BY DoanhThu DESC;
    END`,

    // 17. sp_ThemNhanVien
    `CREATE PROCEDURE sp_ThemNhanVien(
        IN p_HoTen varchar(50),
        IN p_NgaySinh date,
        IN p_GioiTinh char(3),
        IN p_NgayVaoLam date,
        IN p_ID_ChucVu char(10),
        IN p_ID_ChiNhanh char(10),
        IN p_LuongCoBan float
    )
    BEGIN
        DECLARE v_ID_NhanVien char(10);
        SET v_ID_NhanVien = TaoIDNhanVien();

        IF p_NgayVaoLam IS NULL THEN
            SET p_NgayVaoLam = CURDATE();
        END IF;

        IF NOT EXISTS (SELECT 1 FROM ChucVu WHERE ID_ChucVu = p_ID_ChucVu) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ID_ChucVu không tồn tại.';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM ChiNhanh WHERE ID_ChiNhanh = p_ID_ChiNhanh) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ID_ChiNhanh không tồn tại.';
        END IF;

        INSERT INTO NhanVien (ID_NhanVien, HoTen, NgaySinh, GioiTinh, NgayVaoLam, ID_ChucVu, ID_ChiNhanh, LuongCoBan)
        VALUES (v_ID_NhanVien, p_HoTen, p_NgaySinh, p_GioiTinh, p_NgayVaoLam, p_ID_ChucVu, p_ID_ChiNhanh, p_LuongCoBan);

        INSERT INTO LichSuDieuDong (ID_NhanVien, ID_ChiNhanh, NgayBatDau, NgayKetThuc)
        VALUES (v_ID_NhanVien, p_ID_ChiNhanh, p_NgayVaoLam, NULL);
    END`,

    // 18. sp_CapNhatNhanVien
    `CREATE PROCEDURE sp_CapNhatNhanVien(
        IN p_ID_NhanVien char(10),
        IN p_HoTen varchar(50),
        IN p_NgaySinh date,
        IN p_GioiTinh char(3),
        IN p_ID_ChucVu char(10)
    )
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM NhanVien WHERE ID_NhanVien = p_ID_NhanVien) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Không tìm thấy nhân viên.';
        END IF;

        IF p_ID_ChucVu IS NOT NULL AND NOT EXISTS (SELECT 1 FROM ChucVu WHERE ID_ChucVu = p_ID_ChucVu) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ID_ChucVu không tồn tại.';
        END IF;

        UPDATE NhanVien
        SET HoTen = COALESCE(p_HoTen, HoTen),
            NgaySinh = COALESCE(p_NgaySinh, NgaySinh),
            GioiTinh = COALESCE(p_GioiTinh, GioiTinh),
            ID_ChucVu = COALESCE(p_ID_ChucVu, ID_ChucVu)
        WHERE ID_NhanVien = p_ID_NhanVien;
    END`,

    // 19. sp_DieuChinhLuongTheoPhanTram
    `CREATE PROCEDURE sp_DieuChinhLuongTheoPhanTram(
        IN p_ID_NhanVien char(10),
        IN p_TyLePhanTram float
    )
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM NhanVien WHERE ID_NhanVien = p_ID_NhanVien) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Không tìm thấy nhân viên.';
        END IF;

        UPDATE NhanVien
        SET LuongCoBan = LuongCoBan * (1 + p_TyLePhanTram / 100.0)
        WHERE ID_NhanVien = p_ID_NhanVien;
    END`,

    // 20. sp_XoaNhanVien
    `CREATE PROCEDURE sp_XoaNhanVien(IN p_ID_NhanVien char(10))
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM NhanVien WHERE ID_NhanVien = p_ID_NhanVien) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Không tìm thấy nhân viên.';
        END IF;

        IF EXISTS (SELECT 1 FROM HoaDon WHERE ID_NhanVien = p_ID_NhanVien) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Không thể xóa: nhân viên đã lập hóa đơn.';
        END IF;

        DELETE FROM LichSuDieuDong WHERE ID_NhanVien = p_ID_NhanVien;
        DELETE FROM NhanVien WHERE ID_NhanVien = p_ID_NhanVien;
    END`,

    // 21. sp_BaoCaoDoanhThu_ChiNhanh_HeThong
    `CREATE PROCEDURE sp_BaoCaoDoanhThu_ChiNhanh_HeThong()
    BEGIN
        SELECT
            CN.ID_ChiNhanh,
            CN.Ten_ChiNhanh,
            SUM(IFNULL(HD.TongTien, 0)) AS DoanhThu
        FROM HoaDon HD
        JOIN NhanVien NV ON NV.ID_NhanVien = HD.ID_NhanVien
        JOIN ChiNhanh CN ON CN.ID_ChiNhanh = NV.ID_ChiNhanh
        GROUP BY CN.ID_ChiNhanh, CN.Ten_ChiNhanh
        UNION ALL
        SELECT 'ALL', 'Toàn hệ thống', SUM(IFNULL(HD.TongTien, 0))
        FROM HoaDon HD;
    END`,

    // 22. sp_ThongKeDichVuTop
    `CREATE PROCEDURE sp_ThongKeDichVuTop()
    BEGIN
        DECLARE v_FromDate date;
        SET v_FromDate = DATE_SUB(CURDATE(), INTERVAL 6 MONTH);

        SELECT 
            DV.ID_DichVu, 
            DV.Ten_DichVu, 
            DV.Loai_DichVu,
            SUM(CD.Gia_DichVu) AS DoanhThu_6Thang, 
            COUNT(DISTINCT HD.ID_HoaDon) AS SoHoaDon
        FROM HoaDon HD
        JOIN PhieuKham PK ON PK.ID_HoaDon = HD.ID_HoaDon
        JOIN ChiNhanh_DichVu CD ON CD.ID_DichVuDuocDung = PK.ID_DichVu
        JOIN DichVu DV ON DV.ID_DichVu = CD.ID_DichVu
        WHERE HD.NgayLap >= v_FromDate
        GROUP BY DV.ID_DichVu, DV.Ten_DichVu, DV.Loai_DichVu
        ORDER BY DoanhThu_6Thang DESC
        LIMIT 10;
    END`,

    // 23. sp_ThongKeThuCungChamSoc
    `CREATE PROCEDURE sp_ThongKeThuCungChamSoc()
    BEGIN
        SELECT 
            L.ID_Loai, 
            L.TenLoai, 
            G.ID_Giong, 
            G.TenGiong, 
            COUNT(DISTINCT TC.ID_ThuCung) AS SoLuongThuCungDuocChamSoc
        FROM ThuCung TC
        JOIN Giong G ON G.ID_Giong = TC.ID_Giong
        JOIN Loai L ON L.ID_Loai = G.ID_Loai
        WHERE EXISTS (SELECT 1 FROM PhieuKham PK WHERE PK.ID_ThuCung = TC.ID_ThuCung AND PK.TrangThai = 'Đã khám')
           OR EXISTS (SELECT 1 FROM DichVu_TiemPhong TP WHERE TP.ID_ThuCung = TC.ID_ThuCung)
        GROUP BY L.ID_Loai, L.TenLoai, G.ID_Giong, G.TenGiong
        ORDER BY SoLuongThuCungDuocChamSoc DESC, L.TenLoai, G.TenGiong;
    END`,

    // 24. sp_ThongKeHoiVien
    `CREATE PROCEDURE sp_ThongKeHoiVien()
    BEGIN
        SELECT 
            CD.TenCapDo,
            COUNT(*) AS SoLuong,
            CAST(100.0 * COUNT(*) / NULLIF(SUM(COUNT(*)) OVER (), 0) AS DECIMAL(5,2)) AS TyLe_PhanTram
        FROM TaiKhoanThanhVien TK
        LEFT JOIN CapDoThanhVien CD ON CD.ID_CapDo = TK.ID_CapDo
        GROUP BY CD.TenCapDo
        ORDER BY SoLuong DESC;
    END`,

    // 25. sp_TraCuuNhanVien
    `CREATE PROCEDURE sp_TraCuuNhanVien(
        IN p_TuKhoa varchar(50),
        IN p_ID_ChiNhanh char(10),
        IN p_ID_ChucVu char(10)
    )
    BEGIN
        SELECT 
            NV.ID_NhanVien,
            NV.HoTen,
            NV.NgaySinh,
            NV.GioiTinh,
            CN.Ten_ChiNhanh,
            CV.TenChucVu,
            NV.NgayVaoLam,
            NV.LuongCoBan
        FROM NhanVien NV
        JOIN ChiNhanh CN ON NV.ID_ChiNhanh = CN.ID_ChiNhanh
        JOIN ChucVu CV ON NV.ID_ChucVu = CV.ID_ChucVu
        WHERE (p_TuKhoa IS NULL OR NV.HoTen LIKE CONCAT('%', p_TuKhoa, '%') OR NV.ID_NhanVien LIKE CONCAT('%', p_TuKhoa, '%'))
          AND (p_ID_ChiNhanh IS NULL OR NV.ID_ChiNhanh = p_ID_ChiNhanh)
          AND (p_ID_ChucVu IS NULL OR NV.ID_ChucVu = p_ID_ChucVu)
        ORDER BY NV.ID_ChiNhanh, NV.ID_ChucVu;
    END`
];

async function runCommands() {
    console.log("⏳ Đang cài đặt các PROCEDURES bổ sung...");
    const promiseDb = db.promise();

    for (const [index, cmd] of sqlCommands.entries()) {
        try {
            await promiseDb.query(cmd);
            console.log(`✅ [${index + 1}/${sqlCommands.length}] Thành công.`);
        } catch (err) {
            console.error(`❌ Lỗi tại lệnh số ${index + 1}:`, err.message);
        }
    }
    console.log("🎉 Hoàn tất cài đặt các procedures bổ sung!");
    db.end();
}

runCommands();

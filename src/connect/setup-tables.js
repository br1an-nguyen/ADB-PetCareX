// 1. Khai báo thư viện
const mysql = require('mysql2');

// 2. Cấu hình kết nối (Từ .env)
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

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
});

// 2. CODE SQL ĐÃ ĐƯỢC CHUYỂN ĐỔI SANG MYSQL
const sql = `
    -- Xóa bảng cũ nếu có để tránh lỗi trùng lặp (Chạy theo thứ tự ngược của khóa ngoại)
    DROP TABLE IF EXISTS DichVu_MuaHang;
    DROP TABLE IF EXISTS DichVu_TiemPhong;
    DROP TABLE IF EXISTS KetQuaKham;
    DROP TABLE IF EXISTS PhieuKham;
    DROP TABLE IF EXISTS LichSuDieuDong;
    DROP TABLE IF EXISTS DanhGia;
    DROP TABLE IF EXISTS TongChiTieuNam;
    DROP TABLE IF EXISTS HoaDon;
    DROP TABLE IF EXISTS ThuCung;
    DROP TABLE IF EXISTS ChiNhanh_DichVu;
    DROP TABLE IF EXISTS SanPham;
    DROP TABLE IF EXISTS NhanVien;
    DROP TABLE IF EXISTS TaiKhoanThanhVien;
    DROP TABLE IF EXISTS Giong;
    DROP TABLE IF EXISTS DichVu;
    DROP TABLE IF EXISTS CapDoThanhVien;
    DROP TABLE IF EXISTS HinhThucThanhToan;
    DROP TABLE IF EXISTS Loai_SanPham;
    DROP TABLE IF EXISTS Loai_Vacxin;
    DROP TABLE IF EXISTS Loai;
    DROP TABLE IF EXISTS ChucVu;
    DROP TABLE IF EXISTS ChiNhanh;

    -- TẠO BẢNG
    CREATE TABLE ChiNhanh (
        ID_ChiNhanh char(10) PRIMARY KEY,
        Ten_ChiNhanh varchar(50),
        SDT char(10),
        DiaChi_ChiNhanh varchar(100),
        GioMoCua time,
        GioDongCua time
    );

    CREATE TABLE ChucVu (
        ID_ChucVu char(10) PRIMARY KEY,
        TenChucVu varchar(50)
    );

    CREATE TABLE Loai (
        ID_Loai char(10) PRIMARY KEY,
        TenLoai varchar(50),
        MoTa varchar(100)
    );

    CREATE TABLE Loai_Vacxin (
        ID_LoaiVacxin char(10) PRIMARY KEY,
        Ten_LoaiVacxin varchar(50)
    );

    CREATE TABLE Loai_SanPham (
        ID_LoaiSP char(10) PRIMARY KEY,
        TenLoaiSP varchar(50)
    );

    CREATE TABLE HinhThucThanhToan (
        ID_HinhThuc char(10) PRIMARY KEY,
        TenHinhThuc varchar(20)
    );

    CREATE TABLE CapDoThanhVien (
        ID_CapDo char(10) PRIMARY KEY,
        TenCapDo varchar(30),
        MucChiTieuToiThieu float,
        MucChiTieuGiuHang float
    );

    CREATE TABLE DichVu (
        ID_DichVu char(10) PRIMARY KEY,
        Ten_DichVu varchar(50),
        Loai_DichVu varchar(4),
        MoTa varchar(100)
    );

    CREATE TABLE Giong (
        ID_Giong char(10) PRIMARY KEY,
        ID_Loai char(10),
        TenGiong varchar(50),
        DacDiem varchar(100),
        FOREIGN KEY (ID_Loai) REFERENCES Loai(ID_Loai)
    );

    CREATE TABLE TaiKhoanThanhVien (
        ID_TaiKhoan char(10) PRIMARY KEY,
        ID_CapDo char(10),
        HoTen varchar(50),
        Phone char(10),
        Email varchar(30),
        CCCD char(12),
        GioiTinh char(3),
        NgaySinh date,
        SoDiem int DEFAULT 0,
        FOREIGN KEY (ID_CapDo) REFERENCES CapDoThanhVien(ID_CapDo)
    );

    CREATE TABLE NhanVien (
        ID_NhanVien char(10) PRIMARY KEY,
        HoTen varchar(50),
        NgaySinh date,
        GioiTinh char(3),
        NgayVaoLam date,
        ID_ChucVu char(10),
        ID_ChiNhanh char(10),
        LuongCoBan float,
        FOREIGN KEY (ID_ChucVu) REFERENCES ChucVu(ID_ChucVu),
        FOREIGN KEY (ID_ChiNhanh) REFERENCES ChiNhanh(ID_ChiNhanh)
    );

    CREATE TABLE SanPham (
        ID_SanPham char(10) PRIMARY KEY,
        ID_LoaiSP char(10),
        TenSanPham varchar(50),
        GiaBan float,
        SoLuongTonKho int,
        FOREIGN KEY (ID_LoaiSP) REFERENCES Loai_SanPham(ID_LoaiSP)
    );

    CREATE TABLE ChiNhanh_DichVu (
        ID_DichVuDuocDung char(10) PRIMARY KEY,
        ID_ChiNhanh char(10),
        ID_DichVu char(10),
        Gia_DichVu float,
        FOREIGN KEY (ID_ChiNhanh) REFERENCES ChiNhanh(ID_ChiNhanh),
        FOREIGN KEY (ID_DichVu) REFERENCES DichVu(ID_DichVu)
    );

    CREATE TABLE ThuCung (
        ID_ThuCung char(10) PRIMARY KEY,
        ID_TaiKhoan char(10),
        ID_Giong char(10),
        TenThuCung varchar(50),
        NgaySinh date,
        GioiTinh char(3),
        TinhTrangSucKhoe varchar(50),
        FOREIGN KEY (ID_TaiKhoan) REFERENCES TaiKhoanThanhVien(ID_TaiKhoan),
        FOREIGN KEY (ID_Giong) REFERENCES Giong(ID_Giong)
    );

    CREATE TABLE HoaDon (
        ID_HoaDon char(10) PRIMARY KEY,
        NgayLap datetime DEFAULT CURRENT_TIMESTAMP,
        TongTien float DEFAULT 0,
        ID_NhanVien char(10),
        ID_TaiKhoan char(10),
        ID_HinhThucTT char(10),
        KhuyenMai float DEFAULT 0,
        FOREIGN KEY (ID_NhanVien) REFERENCES NhanVien(ID_NhanVien),
        FOREIGN KEY (ID_TaiKhoan) REFERENCES TaiKhoanThanhVien(ID_TaiKhoan),
        FOREIGN KEY (ID_HinhThucTT) REFERENCES HinhThucThanhToan(ID_HinhThuc)
    );

    CREATE TABLE TongChiTieuNam (
        ID_TaiKhoan char(10),
        Nam int,
        TongTienNamTruoc float DEFAULT 0,
        TongTienNamNay float DEFAULT 0,
        PRIMARY KEY (ID_TaiKhoan, Nam),
        FOREIGN KEY (ID_TaiKhoan) REFERENCES TaiKhoanThanhVien(ID_TaiKhoan)
    );

    CREATE TABLE DanhGia (
        ID_TaiKhoan char(10),
        ID_ChiNhanh char(10),
        DiemDichVu int CHECK (DiemDichVu BETWEEN 1 AND 5),
        NhanXetNhanVien varchar(50),
        MucDohaiLong varchar(50),
        BinhLuan varchar(100),
        PRIMARY KEY (ID_TaiKhoan, ID_ChiNhanh),
        FOREIGN KEY (ID_TaiKhoan) REFERENCES TaiKhoanThanhVien(ID_TaiKhoan),
        FOREIGN KEY (ID_ChiNhanh) REFERENCES ChiNhanh(ID_ChiNhanh)
    );

    CREATE TABLE LichSuDieuDong (
        ID_NhanVien char(10),
        ID_ChiNhanh char(10),
        NgayBatDau date,
        NgayKetThuc date,
        PRIMARY KEY (ID_NhanVien, ID_ChiNhanh, NgayBatDau),
        FOREIGN KEY (ID_NhanVien) REFERENCES NhanVien(ID_NhanVien),
        FOREIGN KEY (ID_ChiNhanh) REFERENCES ChiNhanh(ID_ChiNhanh)
    );

    CREATE TABLE PhieuKham (
        ID_PhieuKham char(10) PRIMARY KEY,
        ID_HoaDon char(10),
        ID_DichVu char(10),
        ID_ThuCung char(10),
        TrangThai varchar(20) DEFAULT 'Chờ khám',
        NgayDangKy datetime DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(ID_HoaDon, ID_DichVu, ID_ThuCung),
        FOREIGN KEY (ID_HoaDon) REFERENCES HoaDon(ID_HoaDon),
        FOREIGN KEY (ID_DichVu) REFERENCES ChiNhanh_DichVu(ID_DichVuDuocDung),
        FOREIGN KEY (ID_ThuCung) REFERENCES ThuCung(ID_ThuCung)
    );

    CREATE TABLE KetQuaKham (
        ID_KetQua char(10) PRIMARY KEY,
        ID_PhieuKham char(10) UNIQUE,
        ID_BacSi char(10),
        TrieuChung varchar(200),
        ChuanDoan varchar(200),
        ToaThuoc varchar(200),
        NgayHenTaiKham date,
        GhiChu varchar(100),
        FOREIGN KEY (ID_PhieuKham) REFERENCES PhieuKham(ID_PhieuKham),
        FOREIGN KEY (ID_BacSi) REFERENCES NhanVien(ID_NhanVien)
    );

    CREATE TABLE DichVu_TiemPhong (
        ID_HoaDon char(10),
        ID_DichVu char(10),
        ID_NhanVien char(10),
        ID_ThuCung char(10),
        ID_LoaiVacxin char(10),
        NgayTiem date,
        LieuLuong float,
        GoiTiem int,
        KhuyenMai int DEFAULT 0,
        PRIMARY KEY (ID_HoaDon, ID_DichVu, ID_NhanVien, ID_ThuCung, ID_LoaiVacxin),
        FOREIGN KEY (ID_HoaDon) REFERENCES HoaDon(ID_HoaDon),
        FOREIGN KEY (ID_DichVu) REFERENCES ChiNhanh_DichVu(ID_DichVuDuocDung),
        FOREIGN KEY (ID_NhanVien) REFERENCES NhanVien(ID_NhanVien),
        FOREIGN KEY (ID_ThuCung) REFERENCES ThuCung(ID_ThuCung),
        FOREIGN KEY (ID_LoaiVacxin) REFERENCES Loai_Vacxin(ID_LoaiVacxin)
    );

    CREATE TABLE DichVu_MuaHang (
        ID_HoaDon char(10),
        ID_DichVu char(10),
        ID_SanPham char(10),
        SoLuong int,
        PRIMARY KEY (ID_HoaDon, ID_DichVu, ID_SanPham),
        FOREIGN KEY (ID_HoaDon) REFERENCES HoaDon(ID_HoaDon),
        FOREIGN KEY (ID_DichVu) REFERENCES ChiNhanh_DichVu(ID_DichVuDuocDung),
        FOREIGN KEY (ID_SanPham) REFERENCES SanPham(ID_SanPham)
    );
`;

// 3. THỰC THI
console.log('⏳ Đang tạo bảng và nhập dữ liệu...');
db.query(sql, (err, results) => {
    if (err) {
        console.error('❌ Lỗi SQL:', err.message);
    } else {
        console.log('✅ Đã tạo Database và nhập dữ liệu thành công!');
    }
    db.end();
});
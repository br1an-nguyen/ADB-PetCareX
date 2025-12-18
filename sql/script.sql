-- 1. KHỞI TẠO DATABASE
CREATE DATABASE PETCARX
GO
USE PETCARX
GO

-- 2. TẠO BẢNG (DDL)
CREATE TABLE ChiNhanh (
	ID_ChiNhanh char(10) PRIMARY KEY,
	Ten_ChiNhanh nvarchar(50),
	SDT char(10),
	DiaChi_ChiNhanh nvarchar(100),
	GioMoCua time,
	GioDongCua time,
)

CREATE TABLE ChucVu (
	ID_ChucVu char(10) PRIMARY KEY,
	TenChucVu nvarchar(50)
)

CREATE TABLE Loai (
	ID_Loai char(10) PRIMARY KEY,
	TenLoai nvarchar(50),
	MoTa nvarchar(100)
)

CREATE TABLE Loai_Vacxin (
	ID_LoaiVacxin char(10) PRIMARY KEY,
	Ten_LoaiVacxin nvarchar(50)
)

CREATE TABLE Loai_SanPham (
	ID_LoaiSP char(10) PRIMARY KEY,
	TenLoaiSP nvarchar(50)
)

CREATE TABLE HinhThucThanhToan (
	ID_HinhThuc char(10) PRIMARY KEY,
	TenHinhThuc nvarchar(20)
)

CREATE TABLE CapDoThanhVien (
	ID_CapDo char(10) PRIMARY KEY,
	TenCapDo nvarchar(30),
	MucChiTieuToiThieu float,
	MucChiTieuGiuHang float
)

CREATE TABLE DichVu (
	ID_DichVu char(10) PRIMARY KEY,
	Ten_DichVu nvarchar(50),
	Loai_DichVu varchar(4),
	MoTa nvarchar(100)
)

CREATE TABLE Giong (
	ID_Giong char(10) PRIMARY KEY,
	ID_Loai char(10) FOREIGN KEY REFERENCES Loai(ID_Loai),
	TenGiong nvarchar(50),
	DacDiem nvarchar(100)
)

CREATE TABLE TaiKhoanThanhVien (
	ID_TaiKhoan char(10) PRIMARY KEY,
	ID_CapDo char(10) FOREIGN KEY REFERENCES CapDoThanhVien(ID_CapDo),
	HoTen nvarchar(50),
	Phone char(10),
	Email nvarchar(30),
	CCCD char(12),
	GioiTinh nchar(3),
	NgaySinh date,
	SoDiem int DEFAULT 0
)

CREATE TABLE NhanVien (
	ID_NhanVien char(10) PRIMARY KEY,
	HoTen nvarchar(50),
	NgaySinh date,
	GioiTinh nchar(3),
	NgayVaoLam date,
	ID_ChucVu char(10) FOREIGN KEY REFERENCES ChucVu(ID_ChucVu),
	ID_ChiNhanh char(10) FOREIGN KEY REFERENCES ChiNhanh(ID_ChiNhanh),
	LuongCoBan float
)

CREATE TABLE SanPham (
	ID_SanPham char(10) PRIMARY KEY,
	ID_LoaiSP char(10) FOREIGN KEY REFERENCES Loai_SanPham(ID_LoaiSP),
	TenSanPham nvarchar(50),
	GiaBan float,
	SoLuongTonKho int
)

CREATE TABLE ChiNhanh_DichVu (
	ID_DichVuDuocDung char(10) PRIMARY KEY,
	ID_ChiNhanh char(10) FOREIGN KEY REFERENCES ChiNhanh(ID_ChiNhanh),
	ID_DichVu char(10) FOREIGN KEY REFERENCES DichVu(ID_DichVu),
	Gia_DichVu float
)

CREATE TABLE ThuCung (
	ID_ThuCung char(10) PRIMARY KEY,
	ID_TaiKhoan char(10) FOREIGN KEY REFERENCES TaiKhoanThanhVien(ID_TaiKhoan),
	ID_Giong char(10) FOREIGN KEY REFERENCES Giong(ID_Giong),
	TenThuCung nvarchar(50),
	NgaySinh date,
	GioiTinh nchar(3),
	TinhTrangSucKhoe nvarchar(50)
)

CREATE TABLE HoaDon (
	ID_HoaDon char(10) PRIMARY KEY,
	NgayLap date DEFAULT GETDATE(),
	TongTien float DEFAULT 0,
	ID_NhanVien char(10) FOREIGN KEY REFERENCES NhanVien(ID_NhanVien),
	ID_TaiKhoan char(10) FOREIGN KEY REFERENCES TaiKhoanThanhVien(ID_TaiKhoan),
	ID_HinhThucTT char(10) FOREIGN KEY REFERENCES HinhThucThanhToan(ID_HinhThuc),
	KhuyenMai float DEFAULT 0
)

CREATE TABLE TongChiTieuNam (
	ID_TaiKhoan char(10) FOREIGN KEY REFERENCES TaiKhoanThanhVien(ID_TaiKhoan),
	Nam int,
	TongTienNamTruoc float DEFAULT 0,
	TongTienNamNay float DEFAULT 0,
	PRIMARY KEY (ID_TaiKhoan, Nam)
)

CREATE TABLE DanhGia (
	ID_TaiKhoan char(10) FOREIGN KEY REFERENCES TaiKhoanThanhVien(ID_TaiKhoan),
	ID_ChiNhanh char(10) FOREIGN KEY REFERENCES ChiNhanh(ID_ChiNhanh),
	DiemDichVu int CHECK (DiemDichVu BETWEEN 1 AND 5),
	NhanXetNhanVien nvarchar(50),
	MucDohaiLong nvarchar(50),
	BinhLuan nvarchar(100),
	PRIMARY KEY (ID_TaiKhoan, ID_ChiNhanh)
)

CREATE TABLE LichSuDieuDong (
	ID_NhanVien char(10) FOREIGN KEY REFERENCES NhanVien(ID_NhanVien),
	ID_ChiNhanh char(10) FOREIGN KEY REFERENCES ChiNhanh(ID_ChiNhanh),
	NgayBatDau date,
	NgayKetThuc date,
	PRIMARY KEY (ID_NhanVien, ID_ChiNhanh, NgayBatDau)
)

CREATE TABLE PhieuKham (
    ID_PhieuKham char(10) PRIMARY KEY,
    ID_HoaDon char(10) FOREIGN KEY REFERENCES HoaDon(ID_HoaDon),
    ID_DichVu char(10) FOREIGN KEY REFERENCES ChiNhanh_DichVu(ID_DichVuDuocDung),
    ID_ThuCung char(10) FOREIGN KEY REFERENCES ThuCung(ID_ThuCung),
    
    TrangThai nvarchar(20) DEFAULT N'Chờ khám',
    NgayDangKy datetime DEFAULT GETDATE(),
    
    UNIQUE(ID_HoaDon, ID_DichVu, ID_ThuCung)
)
GO


CREATE TABLE KetQuaKham (
    ID_KetQua char(10) PRIMARY KEY,
    ID_PhieuKham char(10) FOREIGN KEY REFERENCES PhieuKham(ID_PhieuKham) UNIQUE,
    ID_BacSi char(10) FOREIGN KEY REFERENCES NhanVien(ID_NhanVien),
    
    TrieuChung nvarchar(200),
    ChuanDoan nvarchar(200),
    ToaThuoc nvarchar(200),
    NgayHenTaiKham date,
    GhiChu nvarchar(100)
)
GO


CREATE TABLE DichVu_TiemPhong (
	ID_HoaDon char(10) FOREIGN KEY REFERENCES HoaDon(ID_HoaDon),
	ID_DichVu char(10) FOREIGN KEY REFERENCES ChiNhanh_DichVu(ID_DichVuDuocDung),
	ID_NhanVien char(10) FOREIGN KEY REFERENCES NhanVien(ID_NhanVien),
	ID_ThuCung char(10) FOREIGN KEY REFERENCES ThuCung(ID_ThuCung),
	ID_LoaiVacxin char(10) FOREIGN KEY REFERENCES Loai_Vacxin(ID_LoaiVacxin),
	NgayTiem date,
	LieuLuong float,
	GoiTiem int,
	KhuyenMai int DEFAULT 0,
	PRIMARY KEY (ID_HoaDon, ID_DichVu, ID_NhanVien, ID_ThuCung, ID_LoaiVacxin)
)

CREATE TABLE DichVu_MuaHang (
	ID_HoaDon char(10) FOREIGN KEY REFERENCES HoaDon(ID_HoaDon),
	ID_DichVu char(10) FOREIGN KEY REFERENCES ChiNhanh_DichVu(ID_DichVuDuocDung),
	ID_SanPham char(10) FOREIGN KEY REFERENCES SanPham(ID_SanPham),
	SoLuong int,
	PRIMARY KEY (ID_HoaDon, ID_DichVu, ID_SanPham)
)
GO

-- CHÈN DỮ LIỆU CẤU HÌNH (BẮT BUỘC ĐỂ CÁC SP CHẠY ĐƯỢC)
INSERT INTO CapDoThanhVien (ID_CapDo, TenCapDo, MucChiTieuToiThieu, MucChiTieuGiuHang) VALUES 
('CD001', N'Cơ bản', 0, 0),
('CD002', N'Thân thiết', 5000000, 3000000),
('CD003', N'VIP', 12000000, 8000000);

INSERT INTO ChucVu (ID_ChucVu, TenChucVu) VALUES 
('CV001', N'Bác sĩ thú y'),
('CV002', N'Nhân viên bán hàng'),
('CV003', N'Lễ tân'),
('CV004', N'Quản lý');

INSERT INTO HinhThucThanhToan (ID_HinhThuc, TenHinhThuc) VALUES 
('TT001', N'Tiền mặt'),
('TT002', N'Chuyển khoản'),
('TT003', N'Thẻ tín dụng');

INSERT INTO Loai_SanPham (ID_LoaiSP, TenLoaiSP) VALUES 
('LSP001', N'Thức ăn'),
('LSP002', N'Phụ kiện'),
('LSP003', N'Thuốc');

INSERT INTO Loai_Vacxin (ID_LoaiVacxin, Ten_LoaiVacxin) VALUES 
('VX001', N'Dại (Rabies)'),
('VX002', N'Đa giá (5 bệnh)');


INSERT INTO Loai (ID_Loai, TenLoai, MoTa) VALUES 
('LTC0000001', N'Chó', N'Loài chó'),
('LTC0000002', N'Mèo', N'Loài mèo');

INSERT INTO Giong (ID_Giong, ID_Loai, TenGiong, DacDiem) VALUES 
('GTC0000001', 'LTC0000001', N'Poodle', N'Lông xoăn, nhỏ'),
('GTC0000002', 'LTC0000001', N'Husky', N'Ngáo, lông dày'),
('GTC0000003', 'LTC0000002', N'Mướp', N'Mèo ta, lông vằn'),
('GTC0000004', 'LTC0000002', N'Anh Lông Ngắn', N'Mặt nọng, lông ngắn');


INSERT INTO DichVu (ID_DichVu, Ten_DichVu, Loai_DichVu, MoTa) VALUES 
('DV001', N'Khám Lâm Sàng', 'KHAM', N'Khám tổng quát cho thú cưng'),
('DV002', N'Tiêm Phòng Dại', 'TIEM', N'Tiêm vắc xin dại'),
('DV003', N'Spa - Cắt tỉa', 'SPA', N'Cắt tỉa lông');


INSERT INTO ChiNhanh (ID_ChiNhanh, Ten_ChiNhanh, SDT, DiaChi_ChiNhanh) VALUES
('CN001', N'PetCarX Quận 1', '0909000001', N'135B Trần Hưng Đạo, Q1');


INSERT INTO ChiNhanh_DichVu (ID_DichVuDuocDung, ID_ChiNhanh, ID_DichVu, Gia_DichVu) VALUES
('CNDV001', 'CN001', 'DV001', 150000), -- Giá khám
('CNDV002', 'CN001', 'DV002', 200000), -- Giá tiêm
('CNDV003', 'CN001', 'DV003', 300000); -- Giá Spa
GO




-- 3. FUNCTIONS
CREATE FUNCTION TaoIDPhieuKham() RETURNS char(10) AS
BEGIN
	DECLARE @ID char(10) = (SELECT MAX(ID_PhieuKham) FROM PhieuKham);
	RETURN 'PK' + FORMAT(ISNULL(CAST(RIGHT(@ID, 8) AS INT), 0) + 1, 'D8');
END;
GO

CREATE FUNCTION TaoIDKetQua() RETURNS char(10) AS
BEGIN
	DECLARE @ID char(10) = (SELECT MAX(ID_KetQua) FROM KetQuaKham);
	RETURN 'KQ' + FORMAT(ISNULL(CAST(RIGHT(@ID, 8) AS INT), 0) + 1, 'D8');
END;
GO

CREATE FUNCTION TaoIDTaiKhoan() RETURNS char(10) AS
BEGIN
	DECLARE @ID_MoiNhat char(10) = (SELECT MAX(ID_TaiKhoan) FROM TaiKhoanThanhVien);
	IF @ID_MoiNhat IS NULL RETURN 'KH00000001';
	RETURN 'KH' + FORMAT(CAST(RIGHT(@ID_MoiNhat, 8) AS INT) + 1, 'D8');
END;
GO

CREATE FUNCTION TaoIDGiong() RETURNS char(10) AS
BEGIN
	DECLARE @ID_MoiNhat char(10) = (SELECT MAX(ID_Giong) FROM Giong);
	IF @ID_MoiNhat IS NULL RETURN 'GTC0000001';
	RETURN 'GTC' + FORMAT(CAST(RIGHT(@ID_MoiNhat, 7) AS INT) + 1, 'D7');
END;
GO

CREATE FUNCTION TaoIDLoai() RETURNS char(10) AS
BEGIN
	DECLARE @ID_MoiNhat char(10) = (SELECT MAX(ID_Loai) FROM Loai);
	IF @ID_MoiNhat IS NULL RETURN 'LTC0000001';
	RETURN 'LTC' + FORMAT(CAST(RIGHT(@ID_MoiNhat, 7) AS INT) + 1, 'D7');
END;
GO

CREATE FUNCTION TaoIDThuCung() RETURNS char(10) AS
BEGIN
	DECLARE @ID_MoiNhat char(10) = (SELECT MAX(ID_ThuCung) FROM ThuCung);
	IF @ID_MoiNhat IS NULL RETURN 'TC00000001';
	RETURN 'TC' + FORMAT(CAST(RIGHT(@ID_MoiNhat, 8) AS INT) + 1, 'D8');
END;
GO

CREATE FUNCTION TaoIDHoaDon() RETURNS char(10) AS
BEGIN
	DECLARE @ID_MoiNhat char(10) = (SELECT MAX(ID_HoaDon) FROM HoaDon);
	IF @ID_MoiNhat IS NULL RETURN 'HD00000001';
	RETURN 'HD' + FORMAT(CAST(RIGHT(@ID_MoiNhat, 8) AS INT) + 1, 'D8');
END;
GO

CREATE FUNCTION TaoIDSanPham() RETURNS char(10) AS
BEGIN
	DECLARE @ID_MoiNhat char(10) = (SELECT MAX(ID_SanPham) FROM SanPham);
	IF @ID_MoiNhat IS NULL RETURN 'SP00000001';
	RETURN 'SP' + FORMAT(CAST(RIGHT(@ID_MoiNhat, 8) AS INT) + 1, 'D8');
END;
GO

CREATE FUNCTION TaoIDNhanVien() RETURNS char(10) AS
BEGIN
	DECLARE @ID_MoiNhat char(10) = (SELECT MAX(ID_NhanVien) FROM NhanVien);
	IF @ID_MoiNhat IS NULL RETURN 'NV00000001';
	RETURN 'NV' + FORMAT(CAST(RIGHT(@ID_MoiNhat, 8) AS INT) + 1, 'D8');
END;
GO

CREATE FUNCTION TinhDiemTichLuy(@TongHoaDon float) RETURNS int AS
BEGIN
	RETURN CAST(@TongHoaDon / 50000 AS int);
END;
GO

CREATE FUNCTION XacDinhHang(@TongChiTieuNamNay float, @ID_TaiKhoan char(10))
RETURNS nvarchar(30)
AS
BEGIN
    DECLARE @CapDoHienTai nvarchar(30);
    
    SELECT @CapDoHienTai = CD.TenCapDo
    FROM TaiKhoanThanhVien TK 
    LEFT JOIN CapDoThanhVien CD ON TK.ID_CapDo = CD.ID_CapDo
    WHERE TK.ID_TaiKhoan = @ID_TaiKhoan;

    SET @CapDoHienTai = ISNULL(@CapDoHienTai, N'Cơ bản');


    IF @TongChiTieuNamNay >= 12000000 
        RETURN N'VIP';
    
    IF @CapDoHienTai = N'VIP' AND @TongChiTieuNamNay >= 8000000 
        RETURN N'VIP';

    IF @TongChiTieuNamNay >= 5000000 
        RETURN N'Thân thiết';

    IF (@CapDoHienTai = N'Thân thiết' OR @CapDoHienTai = N'VIP') AND @TongChiTieuNamNay >= 3000000
        RETURN N'Thân thiết';

    RETURN N'Cơ bản';
END;
GO

CREATE FUNCTION fn_DoanhThuChiNhanhThang(@ID_ChiNhanh char(10), @Thang int, @Nam int)
RETURNS float
AS
BEGIN
    DECLARE @DoanhThu float;


    SELECT @DoanhThu = ISNULL(SUM(HD.TongTien), 0)
    FROM HoaDon HD
    JOIN NhanVien NV ON HD.ID_NhanVien = NV.ID_NhanVien
    WHERE NV.ID_ChiNhanh = @ID_ChiNhanh
      AND MONTH(HD.NgayLap) = @Thang
      AND YEAR(HD.NgayLap) = @Nam;

    RETURN @DoanhThu;
END;
GO

-- 4. STORED PROCEDURES
CREATE PROCEDURE sp_ThemLoai
	@TenLoai nvarchar(50),
	@MoTa nvarchar(100) = NULL
AS
BEGIN
	SET NOCOUNT ON;
	IF EXISTS (SELECT 1 FROM Loai WHERE TenLoai = @TenLoai)
	BEGIN
		RAISERROR (N'Tên loài này đã tồn tại.', 16, 1);
		RETURN -1;
	END
	INSERT INTO Loai(ID_Loai, TenLoai, MoTa) VALUES (dbo.TaoIDLoai(), @TenLoai, @MoTa);
	RETURN 0;
END;
GO

CREATE PROCEDURE sp_ThemGiong
	@TenGiong nvarchar(50),
	@TenLoai nvarchar(50),
	@DacDiem nvarchar(100) = NULL
AS
BEGIN
	SET NOCOUNT ON;
	DECLARE @ID_Loai char(10);

	SELECT @ID_Loai = ID_Loai FROM Loai WHERE TenLoai = @TenLoai;

	IF @ID_Loai IS NULL
	BEGIN
		RAISERROR (N'Loài vật chưa có trong hệ thống.', 16, 1);
		RETURN -1;
	END

	IF EXISTS (SELECT 1 FROM Giong WHERE TenGiong = @TenGiong AND ID_Loai = @ID_Loai)
	BEGIN
		RAISERROR (N'Giống này đã tồn tại.', 16, 1);
		RETURN -1;
	END

	INSERT INTO Giong(ID_Giong, ID_Loai, TenGiong, DacDiem)
	VALUES (dbo.TaoIDGiong(), @ID_Loai, @TenGiong, @DacDiem);
	RETURN 0;
END;
GO

CREATE PROCEDURE sp_ThemThuCung
	@TenThuCung nvarchar(50),
	@ID_TaiKhoan char(10),
	@TenLoai nvarchar(50),
	@TenGiong nvarchar(50),
	@NgaySinh date,
	@GioiTinh nchar(3),
	@TinhTrangSucKhoe nvarchar(50)
AS
BEGIN
	SET NOCOUNT ON;
	DECLARE @ID_Giong_TimThay char(10);

	IF NOT EXISTS (SELECT 1 FROM TaiKhoanThanhVien WHERE ID_TaiKhoan = @ID_TaiKhoan)
	BEGIN
		RAISERROR (N'Tài khoản không tồn tại.', 16, 1);
		RETURN -1;
	END

	IF @NgaySinh > GETDATE()
	BEGIN
		RAISERROR (N'Ngày sinh không hợp lệ.', 16, 1);
		RETURN -1;
	END

	SELECT @ID_Giong_TimThay = G.ID_Giong
	FROM Giong G JOIN Loai L ON G.ID_Loai = L.ID_Loai
	WHERE L.TenLoai = @TenLoai AND G.TenGiong = @TenGiong;

	IF @ID_Giong_TimThay IS NULL
	BEGIN
		RAISERROR (N'Loài hoặc Giống không hợp lệ.', 16, 1);
		RETURN -1;
	END

	INSERT INTO ThuCung(ID_ThuCung, ID_TaiKhoan, ID_Giong, TenThuCung, NgaySinh, GioiTinh, TinhTrangSucKhoe)
	VALUES (dbo.TaoIDThuCung(), @ID_TaiKhoan, @ID_Giong_TimThay, @TenThuCung, @NgaySinh, @GioiTinh, @TinhTrangSucKhoe);

	RETURN 0;
END;
GO

CREATE PROCEDURE sp_DangKiHoiVien
	@Ten_KhachHang nvarchar(50),
	@SĐT char(10),
	@Email nvarchar(30),
	@CCCD char(12),
	@GioiTinh nchar(3),
	@NgaySinh date
AS
BEGIN
	SET NOCOUNT ON;
	DECLARE @ID_CapDoCoBan char(10);

	SELECT TOP 1 @ID_CapDoCoBan = ID_CapDo FROM CapDoThanhVien WHERE TenCapDo = N'Cơ bản';

	IF EXISTS (SELECT 1 FROM TaiKhoanThanhVien WHERE Phone = @SĐT)
	BEGIN 
		RAISERROR (N'Số điện thoại đã đăng ký.', 16, 1);
		RETURN -1;
	END

	INSERT INTO TaiKhoanThanhVien (ID_TaiKhoan, ID_CapDo, HoTen, Phone, Email, CCCD, GioiTinh, NgaySinh, SoDiem)
	VALUES (dbo.TaoIDTaiKhoan(), @ID_CapDoCoBan, @Ten_KhachHang, @SĐT, @Email, @CCCD, @GioiTinh, @NgaySinh, 0);

	RETURN 0;
END;
GO

CREATE PROCEDURE sp_TaoHoaDonMoi
	@ID_NhanVien char(10),
	@ID_TaiKhoan char(10),
	@ID_HinhThucTT char(10),
	@KhuyenMai float
AS
BEGIN
	SET NOCOUNT ON;

	IF NOT EXISTS (SELECT 1 FROM NhanVien WHERE ID_NhanVien = @ID_NhanVien)
	BEGIN
		RAISERROR (N'Nhân viên không tồn tại.', 16, 1);
		RETURN -1;
	END;

	INSERT INTO HoaDon(ID_HoaDon, ID_NhanVien, ID_TaiKhoan, ID_HinhThucTT, NgayLap, TongTien, KhuyenMai)
	VALUES (dbo.TaoIDHoaDon(), @ID_NhanVien, @ID_TaiKhoan, @ID_HinhThucTT, GETDATE(), 0, @KhuyenMai)
	
	RETURN 0;
END;
GO

CREATE PROCEDURE sp_CapNhatThongTinTK
	@ID_TaiKhoan char(10),
	@HoTen nvarchar(50) = NULL,
	@Phone char(10) = NULL,
	@Email nvarchar(30) = NULL,
	@CCCD char(12) = NULL,
	@GioiTinh nchar(3) = NULL,
	@NgaySinh date = NULL,
	@SoDiem int = NULL
AS
BEGIN
	SET NOCOUNT ON;
	IF NOT EXISTS (SELECT * FROM TaiKhoanThanhVien WHERE @ID_TaiKhoan = ID_TaiKhoan)
	BEGIN
		RAISERROR ('Không tìm thấy ID tài khoản phù hợp', 16, 1);
		RETURN -1;
	END

	UPDATE TaiKhoanThanhVien
	SET
		HoTen = COALESCE(@HoTen, HoTen),
		Phone = COALESCE(@Phone, Phone),
		Email = COALESCE(@Email, Email),
		CCCD = COALESCE(@CCCD, CCCD),
		GioiTinh = COALESCE(@GioiTinh, GioiTinh),
		NgaySinh = COALESCE(@NgaySinh, NgaySinh),
		SoDiem = COALESCE(@SoDiem, SoDiem)
	WHERE @ID_TaiKhoan = ID_TaiKhoan;
	RETURN 0;
END;
GO

CREATE PROCEDURE sp_ThemSanPham
	@ID_LoaiSP char(10),
	@TenSanPham nvarchar(50),
	@GiaBan float,
	@SoLuongTonKho int
AS
BEGIN
	SET NOCOUNT ON;

	IF EXISTS (SELECT 1 FROM SanPham WHERE TenSanPham = @TenSanPham)
	BEGIN
		RAISERROR ('Hệ thống đã tồn tại Tên Sản phầm', 16, 1);
		RETURN -1;
	END;

	IF NOT EXISTS (SELECT 1 FROM Loai_SanPham WHERE ID_LoaiSP = @ID_LoaiSP)
	BEGIN
		RAISERROR ('Không tồn tại loại sản phẩm trên', 16, 1);
		RETURN -1;
	END;

	INSERT INTO SanPham(ID_SanPham, ID_LoaiSP, TenSanPham, GiaBan, SoLuongTonKho)
	VALUES (dbo.TaoIDSanPham(), @ID_LoaiSP, @TenSanPham, @GiaBan, @SoLuongTonKho)
	
	RETURN 0;
END;
GO

CREATE PROCEDURE sp_CapNhatThongTinPet
	@ID_ThuCung char(10),
	@TenThuCung nvarchar(50) = NULL,
	@TenLoai nvarchar(50) = NULL,
	@TenGiong nvarchar(50) = NULL,
	@GioiTinh nchar(3) = NULL,
	@NgaySinh date = NULL,
	@TinhTrangSucKhoe nvarchar(50) = NULL
AS 
BEGIN
	SET NOCOUNT ON;

	IF NOT EXISTS (SELECT 1 FROM ThuCung WHERE ID_ThuCung = @ID_ThuCung)
	BEGIN
		RAISERROR (N'Không tồn tại thú cưng có ID phù hợp', 16, 1);
		RETURN -1;
	END

	DECLARE @ID_Giong_Moi char(10);
	SELECT @ID_Giong_Moi = ID_Giong FROM ThuCung WHERE ID_ThuCung = @ID_ThuCung;

	IF @TenLoai IS NOT NULL AND @TenGiong IS NOT NULL
	BEGIN
		SELECT @ID_Giong_Moi = G.ID_Giong
		FROM Giong G JOIN Loai L ON G.ID_Loai = L.ID_Loai
		WHERE L.TenLoai = @TenLoai AND G.TenGiong = @TenGiong;

		IF @ID_Giong_Moi IS NULL
		BEGIN
			RAISERROR (N'Loài hoặc Giống mới không hợp lệ.', 16, 1);
			RETURN -1;
		END
	END

	UPDATE ThuCung
	SET
		TenThuCung = COALESCE(@TenThuCung, TenThuCung),
		ID_Giong = @ID_Giong_Moi,
		NgaySinh = COALESCE(@NgaySinh, NgaySinh),
		GioiTinh = COALESCE(@GioiTinh, GioiTinh),
		TinhTrangSucKhoe = COALESCE(@TinhTrangSucKhoe, TinhTrangSucKhoe)
	WHERE ID_ThuCung = @ID_ThuCung;

	RETURN 0;
END;
GO

CREATE PROCEDURE sp_DangKyKham
	@ID_HoaDon char(10),
	@ID_DichVu char(10),
	@ID_ThuCung char(10)
AS
BEGIN
	SET NOCOUNT ON;

	IF NOT EXISTS (SELECT 1 FROM HoaDon WHERE ID_HoaDon = @ID_HoaDon)
	BEGIN
		RAISERROR (N'Hóa đơn không tồn tại.', 16, 1); RETURN -1;
	END
	IF NOT EXISTS (SELECT 1 FROM ThuCung WHERE ID_ThuCung = @ID_ThuCung)
	BEGIN
		RAISERROR (N'Thú cưng không tồn tại.', 16, 1); RETURN -1;
	END

	IF NOT EXISTS (SELECT 1 FROM DichVu dv JOIN ChiNhanh_DichVu cn_dv ON dv.ID_DichVu = cn_dv.ID_DichVu
					WHERE dv.Ten_DichVu LIKE N'%Khám%' AND cn_dv.ID_DichVuDuocDung = @ID_DichVu)
	BEGIN
		RAISERROR (N'Dịch vụ chọn không phải là dịch vụ Khám.', 16, 1); RETURN -1;
	END


	INSERT INTO PhieuKham(ID_PhieuKham, ID_HoaDon, ID_DichVu, ID_ThuCung, TrangThai)
	VALUES (dbo.TaoIDPhieuKham(), @ID_HoaDon, @ID_DichVu, @ID_ThuCung, N'Chờ khám');

	PRINT N'Đăng ký khám thành công. Vui lòng đợi bác sĩ gọi tên.';
	RETURN 0;
END;
GO

CREATE PROCEDURE sp_BacSiGhiKetQua
    @ID_PhieuKham char(10),
    @ID_BacSi char(10),
    @TrieuChung nvarchar(200),
    @ChuanDoan nvarchar(200),
    @ToaThuoc nvarchar(200),
    @NgayHenTaiKham date
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM PhieuKham WHERE ID_PhieuKham = @ID_PhieuKham)
    BEGIN
        RAISERROR (N'Phiếu khám không tồn tại.', 16, 1); RETURN -1;
    END

    IF EXISTS (SELECT 1 FROM KetQuaKham WHERE ID_PhieuKham = @ID_PhieuKham)
    BEGIN
        RAISERROR (N'Phiếu này đã được khám xong rồi.', 16, 1); RETURN -1;
    END

    INSERT INTO KetQuaKham(ID_KetQua, ID_PhieuKham, ID_BacSi, TrieuChung, ChuanDoan, ToaThuoc, NgayHenTaiKham)
    VALUES (dbo.TaoIDKetQua(), @ID_PhieuKham, @ID_BacSi, @TrieuChung, @ChuanDoan, @ToaThuoc, @NgayHenTaiKham);

    PRINT N'Lưu kết quả khám bệnh thành công.';
    RETURN 0;
END;
GO

CREATE PROCEDURE sp_ThemPhieuTiemPhong
	@ID_HoaDon char(10),
	@ID_DichVu char(10),
	@ID_NhanVien char(10),
	@ID_ThuCung char(10),
	@ID_LoaiVacxin char(10),
	@NgayTiem date,
	@lieuLuong float,
	@GoiTiem int = NULL,
	@KhuyenMai int = NULL
AS
BEGIN
	SET NOCOUNT ON;

	IF NOT EXISTS (SELECT 1 FROM HoaDon WHERE ID_HoaDon = @ID_HoaDon)
	BEGIN
		RAISERROR ('Không tìm thấy hóa đơn hợp lệ', 16, 1);
		RETURN -1;
	END;

	IF NOT EXISTS (SELECT 1 FROM ChiNhanh_DichVu WHERE ID_DichVuDuocDung = @ID_DichVu)
	BEGIN
		RAISERROR ('Không có dịch vụ phù hợp', 16, 1);
		RETURN -1;
	END;

	IF NOT EXISTS (SELECT 1 FROM DichVu dv JOIN ChiNhanh_DichVu cn_dv ON dv.ID_DichVu = cn_dv.ID_DichVu
					WHERE dv.Ten_DichVu = N'Tiêm Phòng' AND cn_dv.ID_DichVuDuocDung = @ID_DichVu)
	BEGIN
		RAISERROR ('Dịch vụ được chọn không phải dịch vụ tiêm phòng', 16, 1);
		RETURN -1;
	END;

	IF NOT EXISTS (SELECT 1 FROM ThuCung WHERE ID_ThuCung = @ID_ThuCung)
	BEGIN
		RAISERROR ('Không tồn tại thú cưng', 16, 1);
		RETURN -1;
	END;

	IF NOT EXISTS (SELECT 1 FROM Loai_Vacxin WHERE ID_LoaiVacxin = @ID_LoaiVacxin )
	BEGIN
		RAISERROR ('Không có loại Vác-xin phù hợp', 16, 1);
		RETURN -1;
	END;

	INSERT INTO DichVu_TiemPhong(ID_HoaDon, ID_DichVu, ID_NhanVien, ID_ThuCung, ID_LoaiVacxin, NgayTiem, LieuLuong, GoiTiem, KhuyenMai)
	VALUES (@ID_HoaDon, @ID_DichVu, @ID_NhanVien, @ID_ThuCung, @ID_LoaiVacxin, @NgayTiem, @lieuLuong, NULL, NULL)

	RETURN 0;
END;
GO

CREATE PROCEDURE sp_DangKyGoiTiem
	@ID_HoaDon char(10),
	@ID_DichVu char(10),
	@ID_NhanVien char(10),
	@ID_ThuCung char(10),
	@ID_LoaiVacxin char(10),
	@GoiTiem int
AS
BEGIN
	SET NOCOUNT ON;

	IF NOT EXISTS (SELECT 1 FROM HoaDon WHERE ID_HoaDon = @ID_HoaDon)
	BEGIN
		RAISERROR ('Không tìm thấy hóa đơn hợp lệ', 16, 1);
		RETURN -1;
	END;

	UPDATE DichVu_TiemPhong
	SET GoiTiem = COALESCE(@GoiTiem, GoiTiem)
	WHERE @ID_HoaDon = ID_HoaDon AND @ID_DichVu = ID_DichVu AND @ID_NhanVien = ID_NhanVien 
	AND @ID_ThuCung = ID_ThuCung AND @ID_LoaiVacxin = ID_LoaiVacxin

	RETURN 0;
END;
GO

CREATE PROCEDURE sp_ThemDonMuaHang
	@ID_HoaDon char(10),
	@ID_DichVu char(10),
	@ID_SanPham char(10),
	@SoLuong int
AS
BEGIN
	SET NOCOUNT ON;

	IF NOT EXISTS (SELECT 1 FROM HoaDon WHERE ID_HoaDon = @ID_HoaDon)
	BEGIN
		RAISERROR ('Không tìm thấy hóa đơn hợp lệ', 16, 1);
		RETURN -1;
	END;

	IF NOT EXISTS (SELECT 1 FROM SanPham WHERE ID_SanPham = @ID_SanPham)
	BEGIN
		RAISERROR ('Không tồn tại sản phầm cần mua', 16, 1);
		RETURN -1;
	END;

	IF @SoLuong > (SELECT SoLuongTonKho FROM SanPham WHERE ID_SanPham = @ID_SanPham)
	BEGIN
		RAISERROR ('Số Lượng sản phẩm tồn kho không đủ', 16, 1);
		RETURN -1;
	END;

	INSERT INTO DichVu_MuaHang(ID_HoaDon, ID_DichVu, ID_SanPham, SoLuong)
	VALUES (@ID_HoaDon, @ID_DichVu, @ID_SanPham, @SoLuong)

	RETURN 0;
END;
GO

CREATE OR ALTER PROCEDURE sp_TinhLaiTongTien
    @ID_HoaDon CHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @TongTienMoi FLOAT = 0;
	DECLARE @KhuyenMaiHoaDon FLOAT = 0;

	-- Lấy khuyến mãi của hóa đơn
    SELECT @KhuyenMaiHoaDon = ISNULL(KhuyenMai, 0) FROM HoaDon WHERE ID_HoaDon = @ID_HoaDon;

    SELECT @TongTienMoi = ISNULL(SUM(ThanhTien), 0)
    FROM (

        SELECT CD.Gia_DichVu AS ThanhTien
        FROM PhieuKham PK
        JOIN ChiNhanh_DichVu CD ON PK.ID_DichVu = CD.ID_DichVuDuocDung
        WHERE PK.ID_HoaDon = @ID_HoaDon

        UNION ALL

        SELECT CD.Gia_DichVu * (1.0 - ISNULL(TP.KhuyenMai, 0)/100.0) AS ThanhTien
        FROM DichVu_TiemPhong TP
        JOIN ChiNhanh_DichVu CD ON TP.ID_DichVu = CD.ID_DichVuDuocDung
        WHERE TP.ID_HoaDon = @ID_HoaDon

        UNION ALL

        SELECT (SP.GiaBan * MH.SoLuong) AS ThanhTien
        FROM DichVu_MuaHang MH
        JOIN SanPham SP ON MH.ID_SanPham = SP.ID_SanPham
        WHERE MH.ID_HoaDon = @ID_HoaDon
    ) AS TongHopChiPhi;

    UPDATE HoaDon 
    SET TongTien = CASE WHEN (@TongTienMoi - @KhuyenMaiHoaDon) < 0 THEN 0 ELSE (@TongTienMoi - @KhuyenMaiHoaDon) END
    WHERE ID_HoaDon = @ID_HoaDon;

END;
GO

CREATE PROCEDURE sp_DieuChuyenNhanSu
    @ID_NhanVien char(10),
    @ID_ChiNhanhMoi char(10)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @ID_ChiNhanhCu char(10);
    DECLARE @NgayHienTai date = GETDATE();

    IF NOT EXISTS (SELECT 1 FROM NhanVien WHERE ID_NhanVien = @ID_NhanVien)
    BEGIN
        RAISERROR(N'Nhân viên không tồn tại', 16, 1);
        RETURN -1;
    END

    SELECT @ID_ChiNhanhCu = ID_ChiNhanh FROM NhanVien WHERE ID_NhanVien = @ID_NhanVien;

    IF @ID_ChiNhanhCu = @ID_ChiNhanhMoi
    BEGIN
        RAISERROR(N'Nhân viên đang làm việc tại chi nhánh này rồi', 16, 1);
        RETURN -1;
    END

    UPDATE LichSuDieuDong
    SET NgayKetThuc = DATEADD(day, -1, @NgayHienTai) 
    WHERE ID_NhanVien = @ID_NhanVien AND ID_ChiNhanh = @ID_ChiNhanhCu AND NgayKetThuc IS NULL;


    INSERT INTO LichSuDieuDong(ID_NhanVien, ID_ChiNhanh, NgayBatDau, NgayKetThuc)
    VALUES (@ID_NhanVien, @ID_ChiNhanhMoi, @NgayHienTai, NULL); 

    UPDATE NhanVien
    SET ID_ChiNhanh = @ID_ChiNhanhMoi
    WHERE ID_NhanVien = @ID_NhanVien;

    PRINT N'Điều chuyển nhân viên thành công!';
    RETURN 0;
END;
GO

CREATE PROCEDURE sp_GuiDanhGia
    @ID_TaiKhoan char(10),
    @ID_ChiNhanh char(10),
    @DiemDichVu int, -- 1 đến 5
    @NhanXetNhanVien nvarchar(50),
    @MucDoHaiLong nvarchar(50),
    @BinhLuan nvarchar(100)
AS
BEGIN
    SET NOCOUNT ON;

    IF @DiemDichVu < 1 OR @DiemDichVu > 5
    BEGIN
        RAISERROR(N'Điểm dịch vụ phải từ 1 đến 5', 16, 1);
        RETURN -1;
    END


    MERGE DanhGia AS target
    USING (SELECT @ID_TaiKhoan AS TK, @ID_ChiNhanh AS CN) AS source
    ON (target.ID_TaiKhoan = source.TK AND target.ID_ChiNhanh = source.CN)
    WHEN MATCHED THEN
        UPDATE SET 
            DiemDichVu = @DiemDichVu,
            NhanXetNhanVien = @NhanXetNhanVien,
            MucDohaiLong = @MucDoHaiLong,
            BinhLuan = @BinhLuan
    WHEN NOT MATCHED THEN
        INSERT (ID_TaiKhoan, ID_ChiNhanh, DiemDichVu, NhanXetNhanVien, MucDohaiLong, BinhLuan)
        VALUES (@ID_TaiKhoan, @ID_ChiNhanh, @DiemDichVu, @NhanXetNhanVien, @MucDoHaiLong, @BinhLuan);
    
    RETURN 0;
END;
GO

CREATE PROCEDURE sp_NhapThemHangVaoKho
    @ID_SanPham char(10),
    @SoLuongNhap int
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @SoLuongNhap <= 0
    BEGIN
        RAISERROR(N'Số lượng nhập phải lớn hơn 0', 16, 1);
        RETURN -1;
    END

    IF NOT EXISTS (SELECT 1 FROM SanPham WHERE ID_SanPham = @ID_SanPham)
    BEGIN
        RAISERROR(N'Sản phẩm không tồn tại', 16, 1);
        RETURN -1;
    END

    UPDATE SanPham
    SET SoLuongTonKho = SoLuongTonKho + @SoLuongNhap
    WHERE ID_SanPham = @ID_SanPham;

    PRINT N'Đã cập nhật số lượng tồn kho thành công.';
    RETURN 0;
END;
GO

CREATE PROCEDURE sp_BaoCaoDoanhThu
    @LoaiBaoCao VARCHAR(10),
    @NgayInput DATE = NULL,
    @Thang INT = NULL, 
    @Quy INT = NULL,
    @Nam INT = NULL,
    @ID_ChiNhanh CHAR(10) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @LoaiBaoCao IN ('THANG', 'QUY', 'NAM') AND @Nam IS NULL
    BEGIN
        RAISERROR(N'Vui lòng nhập Năm cần xem báo cáo.', 16, 1);
        RETURN;
    END;

    SELECT 
        CN.ID_ChiNhanh,
        CN.Ten_ChiNhanh,
        COUNT(HD.ID_HoaDon) AS SoLuongDonHang,
        ISNULL(SUM(HD.TongTien), 0) AS TongDoanhThu
    FROM HoaDon HD
    JOIN NhanVien NV ON HD.ID_NhanVien = NV.ID_NhanVien
    JOIN ChiNhanh CN ON NV.ID_ChiNhanh = CN.ID_ChiNhanh
    WHERE 
        (@ID_ChiNhanh IS NULL OR CN.ID_ChiNhanh = @ID_ChiNhanh)
        
        AND (
            (@LoaiBaoCao = 'NGAY' AND CAST(HD.NgayLap AS DATE) = @NgayInput)
            
            OR
            (@LoaiBaoCao = 'THANG' AND MONTH(HD.NgayLap) = @Thang AND YEAR(HD.NgayLap) = @Nam)
            
            OR
            (@LoaiBaoCao = 'QUY' AND DATEPART(QUARTER, HD.NgayLap) = @Quy AND YEAR(HD.NgayLap) = @Nam)
            
            OR
            (@LoaiBaoCao = 'NAM' AND YEAR(HD.NgayLap) = @Nam)
        )
    GROUP BY CN.ID_ChiNhanh, CN.Ten_ChiNhanh
    ORDER BY TongDoanhThu DESC;
END;
GO

CREATE PROCEDURE sp_DanhSachTiemPhongTrongKy
    @LoaiBaoCao VARCHAR(10),
    @NgayInput DATE = NULL,
    @Thang INT = NULL,
    @Quy INT = NULL,
    @Nam INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @LoaiBaoCao IN ('THANG', 'QUY', 'NAM') AND @Nam IS NULL
    BEGIN
        RAISERROR(N'Vui lòng nhập Năm cần xem danh sách.', 16, 1);
        RETURN;
    END;

    SELECT 
        TP.NgayTiem,
        KH.HoTen AS ChuNhan,
        KH.Phone AS SDT,
        TC.TenThuCung,
        (L.TenLoai + N' - ' + G.TenGiong) AS GiongLoai,
        VX.Ten_LoaiVacxin,
        TP.LieuLuong,
        CASE 
            WHEN TP.GoiTiem IS NULL THEN N'Tiêm lẻ'
            ELSE N'Gói ' + CAST(TP.GoiTiem AS NVARCHAR(10)) + N' mũi'
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
            (@LoaiBaoCao = 'NGAY' AND TP.NgayTiem = @NgayInput)
            
            OR
            (@LoaiBaoCao = 'THANG' AND MONTH(TP.NgayTiem) = @Thang AND YEAR(TP.NgayTiem) = @Nam)
            
            OR
            (@LoaiBaoCao = 'QUY' AND DATEPART(QUARTER, TP.NgayTiem) = @Quy AND YEAR(TP.NgayTiem) = @Nam)
            
            OR
            (@LoaiBaoCao = 'NAM' AND YEAR(TP.NgayTiem) = @Nam)
        )
    ORDER BY TP.NgayTiem DESC;
END;
GO

CREATE PROCEDURE sp_ThongKeVacxinHot
    @LoaiBaoCao VARCHAR(10),
    @NgayInput DATE = NULL,
    @Thang INT = NULL,
    @Quy INT = NULL,
    @Nam INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @LoaiBaoCao IN ('THANG', 'QUY', 'NAM') AND @Nam IS NULL
    BEGIN
        RAISERROR(N'Vui lòng nhập Năm cần xem thống kê.', 16, 1);
        RETURN;
    END;

    SELECT 
        VX.ID_LoaiVacxin,
        VX.Ten_LoaiVacxin,
        COUNT(TP.ID_LoaiVacxin) AS SoLuongMuiTiem,
        FORMAT(CAST(COUNT(TP.ID_LoaiVacxin) * 100.0 / (SUM(COUNT(TP.ID_LoaiVacxin)) OVER()) AS decimal(5,2)), 'N2') + '%' AS TiLePhanTram
    FROM DichVu_TiemPhong TP
    JOIN Loai_Vacxin VX ON TP.ID_LoaiVacxin = VX.ID_LoaiVacxin
    WHERE 
        (
            (@LoaiBaoCao = 'NGAY' AND TP.NgayTiem = @NgayInput)
            OR
            (@LoaiBaoCao = 'THANG' AND MONTH(TP.NgayTiem) = @Thang AND YEAR(TP.NgayTiem) = @Nam)
            OR
            (@LoaiBaoCao = 'QUY' AND DATEPART(QUARTER, TP.NgayTiem) = @Quy AND YEAR(TP.NgayTiem) = @Nam)
            OR
            (@LoaiBaoCao = 'NAM' AND YEAR(TP.NgayTiem) = @Nam)
        )
    GROUP BY VX.ID_LoaiVacxin, VX.Ten_LoaiVacxin
    ORDER BY SoLuongMuiTiem DESC;
END;
GO

CREATE PROCEDURE sp_BaoCaoTonKhoVaSucBan
    @LoaiBaoCao VARCHAR(10),
    @NgayInput DATE = NULL,
    @Thang INT = NULL,
    @Quy INT = NULL,
    @Nam INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @LoaiBaoCao IN ('THANG', 'QUY', 'NAM') AND @Nam IS NULL
    BEGIN
        RAISERROR(N'Vui lòng nhập Năm cần xem báo cáo.', 16, 1);
        RETURN;
    END;

    -- Sử dụng LEFT JOIN để liệt kê cả những sản phẩm KHÔNG bán được (để biết đường mà xả hàng)
    SELECT 
        SP.ID_SanPham,
        SP.TenSanPham,
        LSP.TenLoaiSP,
        SP.GiaBan,
        
        -- Cột 1: Tồn kho thực tế ngay lúc này
        SP.SoLuongTonKho AS TonKhoHienTai,

        -- Cột 2: Số lượng bán ra trong kỳ đã chọn
        ISNULL(SUM(CASE 
            WHEN 
                (@LoaiBaoCao = 'NGAY' AND HD.NgayLap = @NgayInput) OR
                (@LoaiBaoCao = 'THANG' AND MONTH(HD.NgayLap) = @Thang AND YEAR(HD.NgayLap) = @Nam) OR
                (@LoaiBaoCao = 'QUY' AND DATEPART(QUARTER, HD.NgayLap) = @Quy AND YEAR(HD.NgayLap) = @Nam) OR
                (@LoaiBaoCao = 'NAM' AND YEAR(HD.NgayLap) = @Nam)
            THEN MH.SoLuong 
            ELSE 0 
        END), 0) AS DaBanTrongKy,

        ISNULL(SUM(CASE 
            WHEN 
                (@LoaiBaoCao = 'NGAY' AND HD.NgayLap = @NgayInput) OR
                (@LoaiBaoCao = 'THANG' AND MONTH(HD.NgayLap) = @Thang AND YEAR(HD.NgayLap) = @Nam) OR
                (@LoaiBaoCao = 'QUY' AND DATEPART(QUARTER, HD.NgayLap) = @Quy AND YEAR(HD.NgayLap) = @Nam) OR
                (@LoaiBaoCao = 'NAM' AND YEAR(HD.NgayLap) = @Nam)
            THEN MH.SoLuong * SP.GiaBan
            ELSE 0 
        END), 0) AS DoanhThuSanPham

    FROM SanPham SP
    JOIN Loai_SanPham LSP ON SP.ID_LoaiSP = LSP.ID_LoaiSP
    LEFT JOIN DichVu_MuaHang MH ON SP.ID_SanPham = MH.ID_SanPham
    LEFT JOIN HoaDon HD ON MH.ID_HoaDon = HD.ID_HoaDon
    
    GROUP BY SP.ID_SanPham, SP.TenSanPham, LSP.TenLoaiSP, SP.GiaBan, SP.SoLuongTonKho
    

    ORDER BY DaBanTrongKy DESC;
END;
GO

CREATE PROCEDURE sp_TraCuuHoSoBenhAn
    @SDT_ChuNhan CHAR(10),
    @TenThuCung NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM TaiKhoanThanhVien WHERE Phone = @SDT_ChuNhan)
    BEGIN
        RAISERROR(N'Số điện thoại này chưa đăng ký thành viên.', 16, 1);
        RETURN;
    END

    DECLARE @ID_TaiKhoan CHAR(10);
    SELECT @ID_TaiKhoan = ID_TaiKhoan FROM TaiKhoanThanhVien WHERE Phone = @SDT_ChuNhan;

    -- KẾT QUẢ 1: LỊCH SỬ KHÁM BỆNH
    SELECT 
        TC.TenThuCung,
        PK.NgayDangKy AS NgayKham,
        NV.HoTen AS BacSiKham,
        KQ.ChuanDoan,
        CASE 
            WHEN KQ.ID_KetQua IS NULL THEN N'Đang chờ khám'
            ELSE N'Hoàn thành'
        END AS TrangThai
    FROM ThuCung TC
    JOIN PhieuKham PK ON TC.ID_ThuCung = PK.ID_ThuCung
    LEFT JOIN KetQuaKham KQ ON PK.ID_PhieuKham = KQ.ID_PhieuKham
    LEFT JOIN NhanVien NV ON KQ.ID_BacSi = NV.ID_NhanVien
    WHERE TC.ID_TaiKhoan = @ID_TaiKhoan
      AND (@TenThuCung IS NULL OR TC.TenThuCung LIKE N'%' + @TenThuCung + N'%')
    ORDER BY PK.NgayDangKy DESC;

    -- KẾT QUẢ 2: TÌNH TRẠNG TIÊM CHỦNG MỚI NHẤT (Sửa lại logic)
    -- Chỉ lấy mũi tiêm gần nhất của từng loại để tính ngày tái chủng
    ;WITH MuiTiemMoiNhat AS (
        SELECT 
            TC.ID_ThuCung,
            TP.ID_LoaiVacxin,
            MAX(TP.NgayTiem) AS NgayTiemGanNhat
        FROM DichVu_TiemPhong TP
        JOIN ThuCung TC ON TP.ID_ThuCung = TC.ID_ThuCung
        WHERE TC.ID_TaiKhoan = @ID_TaiKhoan
          AND (@TenThuCung IS NULL OR TC.TenThuCung LIKE N'%' + @TenThuCung + N'%')
        GROUP BY TC.ID_ThuCung, TP.ID_LoaiVacxin
    )
    SELECT 
        TC.TenThuCung,
        VX.Ten_LoaiVacxin,
        MT.NgayTiemGanNhat AS MuiGanNhat,
        
        DATEADD(YEAR, 1, MT.NgayTiemGanNhat) AS HanTiemLai,

        CASE 
            WHEN GETDATE() > DATEADD(YEAR, 1, MT.NgayTiemGanNhat) THEN N'Đã quá hạn - Cần tiêm gấp'
            WHEN GETDATE() > DATEADD(MONTH, 11, MT.NgayTiemGanNhat) THEN N'Sắp đến hạn'
            ELSE N'Đã được bảo vệ'
        END AS TrangThaiMienDich,

        CASE 
            WHEN TP_Detail.GoiTiem IS NOT NULL THEN N'Gói (Mũi ' + CAST(TP_Detail.GoiTiem AS NVARCHAR(5)) + ')'
            ELSE N'Tiêm lẻ'
        END AS HinhThuc

    FROM MuiTiemMoiNhat MT
    JOIN ThuCung TC ON MT.ID_ThuCung = TC.ID_ThuCung
    JOIN Loai_Vacxin VX ON MT.ID_LoaiVacxin = VX.ID_LoaiVacxin
    JOIN DichVu_TiemPhong TP_Detail 
        ON MT.ID_ThuCung = TP_Detail.ID_ThuCung 
        AND MT.ID_LoaiVacxin = TP_Detail.ID_LoaiVacxin 
        AND MT.NgayTiemGanNhat = TP_Detail.NgayTiem
    ORDER BY TC.TenThuCung, MT.NgayTiemGanNhat DESC;

END;
GO

CREATE PROCEDURE sp_ThongKeHieuSuatNhanVien
    @LoaiBaoCao VARCHAR(10),
    @NgayInput DATE = NULL,
    @Thang INT = NULL,
    @Quy INT = NULL,
    @Nam INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @LoaiBaoCao IN ('THANG', 'QUY', 'NAM') AND @Nam IS NULL
    BEGIN
        RAISERROR(N'Vui lòng nhập Năm cần xem hiệu suất.', 16, 1);
        RETURN;
    END;

    -- Sử dụng CTE để tính toán riêng lẻ từng loại công việc
    
    -- 1. KPI Bán hàng (Dựa trên Hóa Đơn)
    ;WITH KPI_BanHang AS (
        SELECT 
            ID_NhanVien,
            COUNT(ID_HoaDon) AS SoDonHang,
            SUM(TongTien) AS DoanhThuMangVe
        FROM HoaDon
        WHERE 
            (@LoaiBaoCao = 'NGAY' AND CAST(NgayLap AS DATE) = @NgayInput) OR
            (@LoaiBaoCao = 'THANG' AND MONTH(NgayLap) = @Thang AND YEAR(NgayLap) = @Nam) OR
            (@LoaiBaoCao = 'QUY' AND DATEPART(QUARTER, NgayLap) = @Quy AND YEAR(NgayLap) = @Nam) OR
            (@LoaiBaoCao = 'NAM' AND YEAR(NgayLap) = @Nam)
        GROUP BY ID_NhanVien
    ),

    -- 2. KPI Khám chữa bệnh (Dựa trên Kết quả khám - Dành cho Bác sĩ)
    KPI_KhamBenh AS (
        SELECT 
            KQ.ID_BacSi AS ID_NhanVien,
            COUNT(KQ.ID_KetQua) AS SoCaKham
        FROM KetQuaKham KQ
        JOIN PhieuKham PK ON KQ.ID_PhieuKham = PK.ID_PhieuKham
        WHERE 
            (@LoaiBaoCao = 'NGAY' AND CAST(PK.NgayDangKy AS DATE) = @NgayInput) OR
            (@LoaiBaoCao = 'THANG' AND MONTH(PK.NgayDangKy) = @Thang AND YEAR(PK.NgayDangKy) = @Nam) OR
            (@LoaiBaoCao = 'QUY' AND DATEPART(QUARTER, PK.NgayDangKy) = @Quy AND YEAR(PK.NgayDangKy) = @Nam) OR
            (@LoaiBaoCao = 'NAM' AND YEAR(PK.NgayDangKy) = @Nam)
        GROUP BY KQ.ID_BacSi
    ),

    -- 3. KPI Tiêm phòng (Dựa trên Dịch vụ tiêm - Dành cho nhân viên y tế)
    KPI_TiemPhong AS (
        SELECT 
            ID_NhanVien,
            COUNT(*) AS SoMuiTiem
        FROM DichVu_TiemPhong
        WHERE 
            (@LoaiBaoCao = 'NGAY' AND NgayTiem = @NgayInput) OR
            (@LoaiBaoCao = 'THANG' AND MONTH(NgayTiem) = @Thang AND YEAR(NgayTiem) = @Nam) OR
            (@LoaiBaoCao = 'QUY' AND DATEPART(QUARTER, NgayTiem) = @Quy AND YEAR(NgayTiem) = @Nam) OR
            (@LoaiBaoCao = 'NAM' AND YEAR(NgayTiem) = @Nam)
        GROUP BY ID_NhanVien
    )

    -- Tổng hợp kết quả
    SELECT 
        NV.ID_NhanVien,
        NV.HoTen,
        CV.TenChucVu,
        CN.Ten_ChiNhanh,
        
        -- Số liệu Bán hàng
        ISNULL(BH.SoDonHang, 0) AS DonHangDaLap,
        ISNULL(BH.DoanhThuMangVe, 0) AS DoanhThuTaoRa,

        -- Số liệu Chuyên môn (Khám + Tiêm)
        ISNULL(KB.SoCaKham, 0) AS SoCaKhamBenh,
        ISNULL(TP.SoMuiTiem, 0) AS SoMuiTiem,

        -- Tổng khối lượng công việc (Đơn hàng + Khám + Tiêm)
        (ISNULL(BH.SoDonHang, 0) + ISNULL(KB.SoCaKham, 0) + ISNULL(TP.SoMuiTiem, 0)) AS TongTacVuXuLy

    FROM NhanVien NV
    JOIN ChucVu CV ON NV.ID_ChucVu = CV.ID_ChucVu
    JOIN ChiNhanh CN ON NV.ID_ChiNhanh = CN.ID_ChiNhanh
    LEFT JOIN KPI_BanHang BH ON NV.ID_NhanVien = BH.ID_NhanVien
    LEFT JOIN KPI_KhamBenh KB ON NV.ID_NhanVien = KB.ID_NhanVien
    LEFT JOIN KPI_TiemPhong TP ON NV.ID_NhanVien = TP.ID_NhanVien

    ORDER BY TongTacVuXuLy DESC;
END;
GO

CREATE PROCEDURE sp_ThongKeKhachHang
    @ID_ChiNhanh CHAR(10) = NULL,
    @SoThangChuaQuayLai INT = 3
AS
BEGIN
    SET NOCOUNT ON;

    -- BƯỚC 1: CHUẨN BỊ DỮ LIỆU (Lần cuối khách ghé là ở đâu, khi nào?)
    -- Sử dụng (CTE) để tìm giao dịch mới nhất của từng khách
    WITH LanGheThamCuoiCung AS (
        SELECT 
            HD.ID_TaiKhoan,
            KH.HoTen,
            KH.Phone,
            CN.ID_ChiNhanh,
            CN.Ten_ChiNhanh,
            HD.NgayLap,
            -- Xếp hạng ngày lập giảm dần theo từng khách hàng
            ROW_NUMBER() OVER(PARTITION BY HD.ID_TaiKhoan ORDER BY HD.NgayLap DESC) as Rn
        FROM HoaDon HD
        JOIN NhanVien NV ON HD.ID_NhanVien = NV.ID_NhanVien
        JOIN ChiNhanh CN ON NV.ID_ChiNhanh = CN.ID_ChiNhanh
        JOIN TaiKhoanThanhVien KH ON HD.ID_TaiKhoan = KH.ID_TaiKhoan
    )

    , DanhSachKhachHang AS (
        SELECT * FROM LanGheThamCuoiCung WHERE Rn = 1
    )

    -- KẾT QUẢ 1: THỐNG KÊ SỐ LƯỢNG KHÁCH HÀNG THEO CHI NHÁNH
    SELECT 
        DS.ID_ChiNhanh,
        DS.Ten_ChiNhanh,
        COUNT(DS.ID_TaiKhoan) AS TongKhachHangPhuTrach,
        
        SUM(CASE 
            WHEN DATEDIFF(MONTH, DS.NgayLap, GETDATE()) >= @SoThangChuaQuayLai THEN 1 
            ELSE 0 
        END) AS SoKhachLauChuaQuayLai,

        FORMAT(CAST(SUM(CASE 
            WHEN DATEDIFF(MONTH, DS.NgayLap, GETDATE()) >= @SoThangChuaQuayLai THEN 1.0 
            ELSE 0.0 
        END) / COUNT(DS.ID_TaiKhoan) AS DECIMAL(5,2)), 'P') AS TiLeRuiRo

    FROM DanhSachKhachHang DS
    WHERE (@ID_ChiNhanh IS NULL OR DS.ID_ChiNhanh = @ID_ChiNhanh)
    GROUP BY DS.ID_ChiNhanh, DS.Ten_ChiNhanh;

    -- KẾT QUẢ 2: DANH SÁCH CHI TIẾT KHÁCH HÀNG CẦN CHĂM SÓC (CHURN LIST)
    PRINT N'--- DANH SÁCH KHÁCH HÀNG LÂU CHƯA QUAY LẠI (> ' + CAST(@SoThangChuaQuayLai AS NVARCHAR(5)) + N' THÁNG) ---';
    
    WITH LanGheThamCuoiCung AS (
        SELECT 
            HD.ID_TaiKhoan,
            KH.HoTen,
            KH.Phone,
            CN.ID_ChiNhanh,
            CN.Ten_ChiNhanh,
            HD.NgayLap,
            -- Xếp hạng ngày lập giảm dần theo từng khách hàng
            ROW_NUMBER() OVER(PARTITION BY HD.ID_TaiKhoan ORDER BY HD.NgayLap DESC) as Rn
        FROM HoaDon HD
        JOIN NhanVien NV ON HD.ID_NhanVien = NV.ID_NhanVien
        JOIN ChiNhanh CN ON NV.ID_ChiNhanh = CN.ID_ChiNhanh
        JOIN TaiKhoanThanhVien KH ON HD.ID_TaiKhoan = KH.ID_TaiKhoan
    )

    , DanhSachKhachHang AS (
        SELECT * FROM LanGheThamCuoiCung WHERE Rn = 1
    )

    SELECT 
        DS.Ten_ChiNhanh AS ChiNhanhGanNhat,
        DS.HoTen AS TenKhachHang,
        DS.Phone AS SoDienThoai,
        DS.NgayLap AS NgayGheCuoi,
        DATEDIFF(DAY, DS.NgayLap, GETDATE()) AS SoNgayVangBong
    FROM DanhSachKhachHang DS
    WHERE 
        (@ID_ChiNhanh IS NULL OR DS.ID_ChiNhanh = @ID_ChiNhanh)
        AND DATEDIFF(MONTH, DS.NgayLap, GETDATE()) >= @SoThangChuaQuayLai
    ORDER BY SoNgayVangBong DESC; -- Ưu tiên người bỏ đi lâu nhất lên đầu

END;
GO

CREATE PROCEDURE sp_TraCuuNhanVien
    @TuKhoa NVARCHAR(50) = NULL,
    @ID_ChiNhanh CHAR(10) = NULL,
    @ID_ChucVu CHAR(10) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        NV.ID_NhanVien,
        NV.HoTen,
        NV.NgaySinh,
        NV.GioiTinh,
        CN.Ten_ChiNhanh,
        CV.TenChucVu,
        NV.NgayVaoLam,
        FORMAT(NV.LuongCoBan, '#,##0') AS LuongCoBan
    FROM NhanVien NV
    JOIN ChiNhanh CN ON NV.ID_ChiNhanh = CN.ID_ChiNhanh
    JOIN ChucVu CV ON NV.ID_ChucVu = CV.ID_ChucVu
    WHERE 
        (@TuKhoa IS NULL OR NV.HoTen LIKE N'%' + @TuKhoa + N'%' OR NV.ID_NhanVien LIKE N'%' + @TuKhoa + N'%')
        AND (@ID_ChiNhanh IS NULL OR NV.ID_ChiNhanh = @ID_ChiNhanh)
        AND (@ID_ChucVu IS NULL OR NV.ID_ChucVu = @ID_ChucVu)
    ORDER BY NV.ID_ChiNhanh, NV.ID_ChucVu;
END;
GO

CREATE PROCEDURE sp_ThemNhanVien
    @HoTen NVARCHAR(50),
    @NgaySinh DATE,
    @GioiTinh NCHAR(3),
    @NgayVaoLam DATE,
    @ID_ChucVu CHAR(10),
    @ID_ChiNhanh CHAR(10),
    @LuongCoBan FLOAT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM ChucVu WHERE ID_ChucVu = @ID_ChucVu)
    BEGIN
        RAISERROR(N'Chức vụ không tồn tại.', 16, 1); RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM ChiNhanh WHERE ID_ChiNhanh = @ID_ChiNhanh)
    BEGIN
        RAISERROR(N'Chi nhánh không tồn tại.', 16, 1); RETURN;
    END

    IF @NgayVaoLam < @NgaySinh
    BEGIN
        RAISERROR(N'Ngày vào làm không hợp lý (nhỏ hơn ngày sinh).', 16, 1); RETURN;
    END

    INSERT INTO NhanVien(ID_NhanVien, HoTen, NgaySinh, GioiTinh, NgayVaoLam, ID_ChucVu, ID_ChiNhanh, LuongCoBan)
    VALUES (dbo.TaoIDNhanVien(), @HoTen, @NgaySinh, @GioiTinh, @NgayVaoLam, @ID_ChucVu, @ID_ChiNhanh, @LuongCoBan);

    PRINT N'Thêm nhân viên thành công.';
END;
GO

CREATE PROCEDURE sp_CapNhatNhanVien
    @ID_NhanVien CHAR(10),
    @HoTen NVARCHAR(50) = NULL,
    @NgaySinh DATE = NULL,
    @GioiTinh NCHAR(3) = NULL,
    @ID_ChucVu CHAR(10) = NULL,
    @LuongCoBan FLOAT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM NhanVien WHERE ID_NhanVien = @ID_NhanVien)
    BEGIN
        RAISERROR(N'Nhân viên không tồn tại.', 16, 1); RETURN;
    END

    UPDATE NhanVien
    SET 
        HoTen = COALESCE(@HoTen, HoTen),
        NgaySinh = COALESCE(@NgaySinh, NgaySinh),
        GioiTinh = COALESCE(@GioiTinh, GioiTinh),
        ID_ChucVu = COALESCE(@ID_ChucVu, ID_ChucVu),
        LuongCoBan = COALESCE(@LuongCoBan, LuongCoBan)
    WHERE ID_NhanVien = @ID_NhanVien;

    PRINT N'Cập nhật thông tin thành công.';
END;
GO

CREATE PROCEDURE sp_XoaNhanVien
    @ID_NhanVien CHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM NhanVien WHERE ID_NhanVien = @ID_NhanVien)
    BEGIN
        RAISERROR(N'Nhân viên không tồn tại.', 16, 1); RETURN;
    END

    -- Kiểm tra ràng buộc dữ liệu (Đã từng làm việc gì chưa?)
    IF EXISTS (SELECT 1 FROM HoaDon WHERE ID_NhanVien = @ID_NhanVien)
    OR EXISTS (SELECT 1 FROM KetQuaKham WHERE ID_BacSi = @ID_NhanVien)
    OR EXISTS (SELECT 1 FROM DichVu_TiemPhong WHERE ID_NhanVien = @ID_NhanVien)
    BEGIN
        RAISERROR(N'Không thể xóa: Nhân viên này đã có dữ liệu lịch sử làm việc (Hóa đơn/Khám/Tiêm).', 16, 1);
        RETURN;
    END

    DELETE FROM NhanVien WHERE ID_NhanVien = @ID_NhanVien;
    
    PRINT N'Đã xóa hồ sơ nhân viên thành công.';
END;
GO

-- 5. TRIGGERS
CREATE TRIGGER trg_CapNhanKhuyenMai_GoiTiem
ON DichVu_TiemPhong
AFTER UPDATE
AS
BEGIN 
	SET NOCOUNT ON;
	IF UPDATE(GoiTiem)
	BEGIN
		UPDATE DVT
		SET DVT.KhuyenMai = CASE
				WHEN i.GoiTiem >= 12 THEN 15
				WHEN i.GoiTiem >= 6 THEN 5
				ELSE 0
			END
		FROM DichVu_TiemPhong DVT JOIN inserted i 
		ON DVT.ID_HoaDon = i.ID_HoaDon AND DVT.ID_DichVu = i.ID_DichVu 
		AND DVT.ID_ThuCung = i.ID_ThuCung AND DVT.ID_LoaiVacxin = i.ID_LoaiVacxin;
	END;
END;
GO

CREATE TRIGGER trg_CapNhatTrangThaiKham
ON KetQuaKham
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE PhieuKham
    SET TrangThai = N'Đã khám'
    FROM PhieuKham pk
    JOIN inserted i ON pk.ID_PhieuKham = i.ID_PhieuKham;
END;
GO

CREATE TRIGGER trg_PhieuKham_UpdateTongTien 
ON PhieuKham 
AFTER INSERT, UPDATE, DELETE 
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @ID CHAR(10);
    
    DECLARE cur CURSOR FOR 
        SELECT ID_HoaDon FROM inserted 
        UNION 
        SELECT ID_HoaDon FROM deleted;
        
    OPEN cur;
    FETCH NEXT FROM cur INTO @ID;
    WHILE @@FETCH_STATUS = 0
    BEGIN
        EXEC sp_TinhLaiTongTien @ID;
        FETCH NEXT FROM cur INTO @ID;
    END;
    CLOSE cur; DEALLOCATE cur;
END;
GO

CREATE TRIGGER trg_Tiem_UpdateTongTien ON DichVu_TiemPhong AFTER INSERT, UPDATE, DELETE AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @ID CHAR(10);
    DECLARE cur CURSOR FOR 
        SELECT ID_HoaDon FROM inserted UNION SELECT ID_HoaDon FROM deleted;
    OPEN cur;
    FETCH NEXT FROM cur INTO @ID;
    WHILE @@FETCH_STATUS = 0
    BEGIN
        EXEC sp_TinhLaiTongTien @ID;
        FETCH NEXT FROM cur INTO @ID;
    END;
    CLOSE cur; DEALLOCATE cur;
END;
GO

CREATE TRIGGER trg_MuaHang_UpdateTongTien ON DichVu_MuaHang AFTER INSERT, UPDATE, DELETE AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @ID CHAR(10);
    DECLARE cur CURSOR FOR 
        SELECT ID_HoaDon FROM inserted UNION SELECT ID_HoaDon FROM deleted;
    OPEN cur;
    FETCH NEXT FROM cur INTO @ID;
    WHILE @@FETCH_STATUS = 0
    BEGIN
        EXEC sp_TinhLaiTongTien @ID;
        FETCH NEXT FROM cur INTO @ID;
    END;
    CLOSE cur; DEALLOCATE cur;
END;
GO


CREATE TRIGGER trg_Kho_GiamHangKhiBan
ON DichVu_MuaHang
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE SanPham
    SET SoLuongTonKho = SanPham.SoLuongTonKho - i.SoLuong
    FROM SanPham SP
    JOIN inserted i ON SP.ID_SanPham = i.ID_SanPham;
END;
GO


CREATE TRIGGER trg_Kho_TraHangKhiHuy
ON DichVu_MuaHang
AFTER DELETE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE SanPham
    SET SoLuongTonKho = SanPham.SoLuongTonKho + d.SoLuong
    FROM SanPham SP
    JOIN deleted d ON SP.ID_SanPham = d.ID_SanPham;
END;
GO


CREATE TRIGGER trg_Kho_CapNhatKhiSua
ON DichVu_MuaHang
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF UPDATE(SoLuong)
    BEGIN

        UPDATE SanPham
        SET SoLuongTonKho = SanPham.SoLuongTonKho + d.SoLuong
        FROM SanPham SP JOIN deleted d ON SP.ID_SanPham = d.ID_SanPham;


        UPDATE SanPham
        SET SoLuongTonKho = SanPham.SoLuongTonKho - i.SoLuong
        FROM SanPham SP JOIN inserted i ON SP.ID_SanPham = i.ID_SanPham;
    END
END;
GO

CREATE TRIGGER trg_CapNhatDiem_Va_HangThanhVien
ON HoaDon
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF UPDATE(TongTien)
    BEGIN
        DECLARE @ID_TaiKhoan char(10);
        DECLARE @TongTienMoi float;
        DECLARE @TienCu float;
        DECLARE @NamHienTai int = YEAR(GETDATE());


        SELECT @ID_TaiKhoan = ID_TaiKhoan, @TongTienMoi = ISNULL(TongTien, 0) FROM inserted;
        SELECT @TienCu = ISNULL(TongTien, 0) FROM deleted;

        IF @ID_TaiKhoan IS NOT NULL
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM TongChiTieuNam WHERE ID_TaiKhoan = @ID_TaiKhoan AND Nam = @NamHienTai)
            BEGIN
                INSERT INTO TongChiTieuNam(ID_TaiKhoan, Nam, TongTienNamTruoc, TongTienNamNay)
                VALUES (@ID_TaiKhoan, @NamHienTai, 0, 0);
            END

            UPDATE TongChiTieuNam
            SET TongTienNamNay = TongTienNamNay + (@TongTienMoi - @TienCu)
            WHERE ID_TaiKhoan = @ID_TaiKhoan AND Nam = @NamHienTai;

            DECLARE @DiemThayDoi int;
            SET @DiemThayDoi = CAST((@TongTienMoi - @TienCu) / 50000 AS int);

            DECLARE @TongChiTieuHienTai float;
            SELECT @TongChiTieuHienTai = TongTienNamNay 
            FROM TongChiTieuNam WHERE ID_TaiKhoan = @ID_TaiKhoan AND Nam = @NamHienTai;

            DECLARE @TenHangMoi nvarchar(30);
            SET @TenHangMoi = dbo.XacDinhHang(@TongChiTieuHienTai, @ID_TaiKhoan);

            DECLARE @ID_CapDoMoi char(10);
            SELECT @ID_CapDoMoi = ID_CapDo FROM CapDoThanhVien WHERE TenCapDo = @TenHangMoi;

            UPDATE TaiKhoanThanhVien
            SET SoDiem = SoDiem + @DiemThayDoi,
                ID_CapDo = @ID_CapDoMoi
            WHERE ID_TaiKhoan = @ID_TaiKhoan;
        END
    END
END;
GO



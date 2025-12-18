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

CREATE PROCEDURE sp_TinhLaiTongTien
    @ID_HoaDon CHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @TongTienMoi FLOAT = 0;

    SELECT @TongTienMoi = ISNULL(SUM(ThanhTien), 0)
    FROM (

        SELECT CD.Gia_DichVu AS ThanhTien
        FROM PhieuKham PK
        JOIN ChiNhanh_DichVu CD ON PK.ID_DichVu = CD.ID_DichVuDuocDung
        WHERE PK.ID_HoaDon = @ID_HoaDon

        UNION ALL

        SELECT CD.Gia_DichVu AS ThanhTien
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
    SET TongTien = @TongTienMoi 
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

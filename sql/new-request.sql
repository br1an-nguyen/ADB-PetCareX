--Yêu cầu tối thiểu của cô


--Them moi theo yeu cau cua co
CREATE PROCEDURE sp_QuanLy_DoanhThuChiNhanh
    @TuNgay date,
    @DenNgay date
AS
BEGIN
    SELECT 
        CN.ID_ChiNhanh,
        CN.Ten_ChiNhanh,
        COUNT(HD.ID_HoaDon) AS TongSoHoaDon,
        ISNULL(SUM(HD.TongTien), 0) AS TongDoanhThu,
        -- Tính doanh thu trung bình mỗi hóa đơn
        CASE WHEN COUNT(HD.ID_HoaDon) > 0 
             THEN ISNULL(SUM(HD.TongTien), 0) / COUNT(HD.ID_HoaDon) 
             ELSE 0 
        END AS TrungBinhHoaDon
    FROM ChiNhanh CN
    LEFT JOIN NhanVien NV ON CN.ID_ChiNhanh = NV.ID_ChiNhanh
    LEFT JOIN HoaDon HD ON NV.ID_NhanVien = HD.ID_NhanVien
    WHERE (HD.NgayLap BETWEEN @TuNgay AND @DenNgay) OR (HD.ID_HoaDon IS NULL)
    GROUP BY CN.ID_ChiNhanh, CN.Ten_ChiNhanh
    ORDER BY TongDoanhThu DESC;
END;
GO

CREATE PROCEDURE sp_BacSi_XemLichTrinh
    @ID_BacSi char(10),
    @NgayXem date = NULL -- Mặc định là hôm nay nếu để NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF @NgayXem IS NULL SET @NgayXem = CAST(GETDATE() AS DATE);

    -- Phần 1: Xem hôm nay trực ở chi nhánh nào
    PRINT N'--- ĐỊA ĐIỂM LÀM VIỆC ---';
    SELECT 
        NV.HoTen, 
        CN.Ten_ChiNhanh, 
        LSDD.NgayBatDau AS BatDauTaiChiNhanh
    FROM NhanVien NV
    JOIN LichSuDieuDong LSDD ON NV.ID_NhanVien = LSDD.ID_NhanVien
    JOIN ChiNhanh CN ON LSDD.ID_ChiNhanh = CN.ID_ChiNhanh
    WHERE NV.ID_NhanVien = @ID_BacSi
      AND LSDD.NgayBatDau <= @NgayXem
      AND (LSDD.NgayKetThuc IS NULL OR LSDD.NgayKetThuc >= @NgayXem);

    -- Phần 2: Xem danh sách bệnh nhân có hẹn tái khám hôm nay (do bác sĩ này dặn)
    PRINT N'--- DANH SÁCH HẸN TÁI KHÁM ---';
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
    WHERE KQ.ID_BacSi = @ID_BacSi 
      AND KQ.NgayHenTaiKham = @NgayXem;
END;
GO

CREATE PROCEDURE sp_KhachHang_DatLichOnline
    @ID_TaiKhoan char(10),
    @ID_ThuCung char(10),
    @ID_ChiNhanh char(10),
    @ID_DichVuGoc char(10),
    @NgayHen datetime
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        -- 1. Validate ngày hẹn
        IF @NgayHen <= GETDATE()
        BEGIN
            RAISERROR(N'Ngày hẹn phải lớn hơn thời điểm hiện tại.', 16, 1);
            ROLLBACK TRANSACTION; RETURN;
        END

        -- 2. Tìm ID Dịch vụ chi nhánh
        DECLARE @ID_DichVuChiNhanh char(10);
        SELECT @ID_DichVuChiNhanh = ID_DichVuDuocDung 
        FROM ChiNhanh_DichVu 
        WHERE ID_ChiNhanh = @ID_ChiNhanh AND ID_DichVu = @ID_DichVuGoc;

        IF @ID_DichVuChiNhanh IS NULL
        BEGIN
            RAISERROR(N'Chi nhánh này không cung cấp dịch vụ bạn chọn.', 16, 1);
            ROLLBACK TRANSACTION; RETURN;
        END

        -- 3. Tạo Hóa đơn tạm
        DECLARE @ID_HoaDonMoi char(10) = dbo.TaoIDHoaDon();
        
        -- [TỐI ƯU]: Thay vì lấy random nhân viên, ta lấy ID Quản lý của chi nhánh đó
        -- Hoặc nếu database có nhân viên mã 'NV_ONLINE' thì gán cứng vào.
        DECLARE @ID_NhanVienDaiDien char(10);
        
        -- Ưu tiên lấy Quản lý
        SELECT TOP 1 @ID_NhanVienDaiDien = NV.ID_NhanVien 
        FROM NhanVien NV JOIN ChucVu CV ON NV.ID_ChucVu = CV.ID_ChucVu
        WHERE NV.ID_ChiNhanh = @ID_ChiNhanh AND CV.TenChucVu = N'Quản lý';

        -- Nếu không có quản lý, mới lấy nhân viên bất kỳ
        IF @ID_NhanVienDaiDien IS NULL
        BEGIN
             SELECT TOP 1 @ID_NhanVienDaiDien = ID_NhanVien 
             FROM NhanVien WHERE ID_ChiNhanh = @ID_ChiNhanh;
        END

        INSERT INTO HoaDon(ID_HoaDon, NgayLap, TongTien, ID_NhanVien, ID_TaiKhoan, ID_HinhThucTT)
        VALUES (@ID_HoaDonMoi, GETDATE(), 0, @ID_NhanVienDaiDien, @ID_TaiKhoan, 'TT001');

        -- 4. Tạo Phiếu khám (Trạng thái: Đã đặt lịch)
        -- Lưu ý: NgayDangKy dùng @NgayHen (Tương lai), khác với GETDATE() của hóa đơn
        INSERT INTO PhieuKham(ID_PhieuKham, ID_HoaDon, ID_DichVu, ID_ThuCung, TrangThai, NgayDangKy)
        VALUES (dbo.TaoIDPhieuKham(), @ID_HoaDonMoi, @ID_DichVuChiNhanh, @ID_ThuCung, N'Đã đặt lịch', @NgayHen);

        COMMIT TRANSACTION;
        PRINT N'Đặt lịch thành công! Mã phiếu: ' + @ID_HoaDonMoi;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        DECLARE @Msg nvarchar(4000) = ERROR_MESSAGE();
        RAISERROR(@Msg, 16, 1);
    END CATCH
END;
GO

-- a. Tìm kiếm sản phẩm (Bộ lọc theo tên, loại, khoảng giá)
CREATE PROCEDURE sp_KhachHang_TimKiemSanPham
    @TuKhoa nvarchar(50) = NULL,
    @ID_LoaiSP char(10) = NULL,
    @GiaMin float = 0,
    @GiaMax float = 100000000
AS
BEGIN
    SELECT 
        SP.TenSanPham, 
        LSP.TenLoaiSP, 
        SP.GiaBan, 
        SP.SoLuongTonKho
    FROM SanPham SP
    JOIN Loai_SanPham LSP ON SP.ID_LoaiSP = LSP.ID_LoaiSP
    WHERE (@TuKhoa IS NULL OR SP.TenSanPham LIKE N'%' + @TuKhoa + N'%')
      AND (@ID_LoaiSP IS NULL OR SP.ID_LoaiSP = @ID_LoaiSP)
      AND (SP.GiaBan BETWEEN @GiaMin AND @GiaMax)
      AND SP.SoLuongTonKho > 0; -- Chỉ hiện sản phẩm còn hàng
END;
GO

-- b. Xem lịch sử khám/sử dụng dịch vụ của Thú cưng
CREATE PROCEDURE sp_KhachHang_XemLichSuKham
    @ID_ThuCung char(10)
AS
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
    WHERE PK.ID_ThuCung = @ID_ThuCung
    ORDER BY PK.NgayDangKy DESC;
END;
GO

-- c. Tra cứu lịch bác sĩ (Xem bác sĩ nào khám nhiều nhất/có lịch trong ngày)
-- Lưu ý: Hệ thống hiện tại chưa có bảng Lịch Làm Việc, ta sẽ suy ra từ lịch sử khám
CREATE FUNCTION fn_TraCuuBacSiHoatDong(@NgayTraCuu DATE)
RETURNS TABLE
AS
RETURN
(
    SELECT DISTINCT NV.HoTen, CV.TenChucVu, CN.Ten_ChiNhanh
    FROM NhanVien NV
    JOIN ChucVu CV ON NV.ID_ChucVu = CV.ID_ChucVu
    JOIN ChiNhanh CN ON NV.ID_ChiNhanh = CN.ID_ChiNhanh
    -- Giả định bác sĩ có mặt nếu không có lịch sử điều động đi nơi khác vào ngày đó
    WHERE CV.TenChucVu = N'Bác sĩ thú y'
);
GO


-- a. Tra cứu toàn bộ hồ sơ bệnh án của Thú cưng (Góc nhìn chuyên môn)
CREATE PROCEDURE sp_BacSi_TraCuuHoSoBenhAn
    @ID_ThuCung char(10)
AS
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
    WHERE PK.ID_ThuCung = @ID_ThuCung
    ORDER BY PK.NgayDangKy DESC;
END;
GO

-- b. Tra cứu Thuốc (Chỉ tìm loại sản phẩm là Thuốc để kê đơn)
CREATE PROCEDURE sp_BacSi_TraCuuThuoc
    @TenThuoc nvarchar(50)
AS
BEGIN
    SELECT SP.ID_SanPham, SP.TenSanPham, SP.SoLuongTonKho, SP.GiaBan
    FROM SanPham SP
    JOIN Loai_SanPham LSP ON SP.ID_LoaiSP = LSP.ID_LoaiSP
    WHERE LSP.TenLoaiSP = N'Thuốc'
      AND SP.TenSanPham LIKE N'%' + @TenThuoc + N'%'
      AND SP.SoLuongTonKho > 0;
END;
GO

-- a. Tra cứu thông tin khách hàng và thú cưng (Bằng SĐT hoặc Tên)
-- Giúp xác định khách cũ hay mới nhanh chóng
CREATE PROCEDURE sp_NhanVien_TraCuuKhachHang
    @ThongTinTraCuu nvarchar(50) -- Có thể là SĐT hoặc Tên
AS
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
    WHERE KH.Phone LIKE '%' + @ThongTinTraCuu + '%' 
       OR KH.HoTen LIKE N'%' + @ThongTinTraCuu + '%';
END;
GO

-- b. TRIGGER: Ngăn chặn xếp hàng trùng lặp (Logic nghiệp vụ)
-- Nếu thú cưng đang ở trạng thái "Chờ khám", không được tạo thêm phiếu khám mới
CREATE TRIGGER trg_NhanVien_ChanSpamLichKham
ON PhieuKham
FOR INSERT
AS
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM PhieuKham PK
        JOIN inserted I ON PK.ID_ThuCung = I.ID_ThuCung
        WHERE PK.TrangThai = N'Chờ khám' 
          AND PK.ID_PhieuKham <> I.ID_PhieuKham -- Khác phiếu vừa tạo
          AND CAST(PK.NgayDangKy AS DATE) = CAST(GETDATE() AS DATE)
    )
    BEGIN
        RAISERROR(N'Thú cưng này đang có phiếu chờ khám chưa hoàn thành.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO


-- a. Thống kê tổng quan Doanh thu & Số lượt khám (Theo khoảng thời gian)
CREATE PROCEDURE sp_QuanLy_ThongKeTongHop
    @NgayBatDau DATE,
    @NgayKetThuc DATE,
    @ID_ChiNhanh char(10) = NULL -- Nếu NULL thì tính tất cả chi nhánh
AS
BEGIN
    SELECT 
        CN.Ten_ChiNhanh,
        COUNT(DISTINCT PK.ID_PhieuKham) AS SoLuotKham,
        SUM(ISNULL(HD.TongTien, 0)) AS TongDoanhThu
    FROM HoaDon HD
    JOIN NhanVien NV ON HD.ID_NhanVien = NV.ID_NhanVien
    JOIN ChiNhanh CN ON NV.ID_ChiNhanh = CN.ID_ChiNhanh
    LEFT JOIN PhieuKham PK ON HD.ID_HoaDon = PK.ID_HoaDon
    WHERE HD.NgayLap BETWEEN @NgayBatDau AND @NgayKetThuc
      AND (@ID_ChiNhanh IS NULL OR CN.ID_ChiNhanh = @ID_ChiNhanh)
    GROUP BY CN.Ten_ChiNhanh;
END;
GO

-- b. Thống kê hiệu suất Bác sĩ (Doanh thu tạo ra + Số ca khám)
CREATE PROCEDURE sp_QuanLy_HieuSuatBacSi
    @Thang int,
    @Nam int
AS
BEGIN
    SELECT 
        NV.ID_NhanVien,
        NV.HoTen,
        CN.Ten_ChiNhanh,
        COUNT(KQ.ID_KetQua) AS SoCaKham,
        -- Tính doanh thu dịch vụ khám mà bác sĩ này thực hiện
        SUM(CNDV.Gia_DichVu) AS DoanhThuKhamBenh
    FROM NhanVien NV
    JOIN KetQuaKham KQ ON NV.ID_NhanVien = KQ.ID_BacSi
    JOIN PhieuKham PK ON KQ.ID_PhieuKham = PK.ID_PhieuKham
    JOIN ChiNhanh_DichVu CNDV ON PK.ID_DichVu = CNDV.ID_DichVuDuocDung
    JOIN ChiNhanh CN ON NV.ID_ChiNhanh = CN.ID_ChiNhanh
    WHERE MONTH(PK.NgayDangKy) = @Thang AND YEAR(PK.NgayDangKy) = @Nam
    GROUP BY NV.ID_NhanVien, NV.HoTen, CN.Ten_ChiNhanh
    ORDER BY DoanhThuKhamBenh DESC;
END;
GO

-- c. Thống kê Doanh thu Bán Sản Phẩm (Tách biệt với dịch vụ)
CREATE PROCEDURE sp_QuanLy_DoanhThuSanPham
    @NgayBatDau DATE,
    @NgayKetThuc DATE
AS
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
    WHERE HD.NgayLap BETWEEN @NgayBatDau AND @NgayKetThuc
    GROUP BY LSP.TenLoaiSP, SP.TenSanPham
    ORDER BY DoanhThu DESC;
END;
GO
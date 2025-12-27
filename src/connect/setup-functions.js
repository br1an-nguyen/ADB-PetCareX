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
    // --- XÓA CÁC FUNCTION CŨ ĐỂ TRÁNH LỖI TRÙNG LẶP ---
    "DROP FUNCTION IF EXISTS TaoIDPhieuKham",
    "DROP FUNCTION IF EXISTS TaoIDKetQua",
    "DROP FUNCTION IF EXISTS TaoIDTaiKhoan",
    "DROP FUNCTION IF EXISTS TaoIDGiong",
    "DROP FUNCTION IF EXISTS TaoIDLoai",
    "DROP FUNCTION IF EXISTS TaoIDThuCung",
    "DROP FUNCTION IF EXISTS TaoIDHoaDon",
    "DROP FUNCTION IF EXISTS TaoIDSanPham",
    "DROP FUNCTION IF EXISTS TaoIDNhanVien",
    "DROP FUNCTION IF EXISTS TinhDiemTichLuy",
    "DROP FUNCTION IF EXISTS XacDinhHang",
    "DROP FUNCTION IF EXISTS fn_DoanhThuChiNhanhThang",

    // =============================================
    // BẮT ĐẦU TẠO FUNCTIONS
    // =============================================

    // 1. TaoIDPhieuKham
    `CREATE FUNCTION TaoIDPhieuKham() RETURNS char(10)
    DETERMINISTIC
    BEGIN
        DECLARE v_ID char(10);
        SELECT MAX(ID_PhieuKham) INTO v_ID FROM PhieuKham;
        RETURN CONCAT('PK', LPAD(IFNULL(CAST(SUBSTRING(v_ID, 3) AS UNSIGNED), 0) + 1, 8, '0'));
    END`,

    // 2. TaoIDKetQua
    `CREATE FUNCTION TaoIDKetQua() RETURNS char(10)
    DETERMINISTIC
    BEGIN
        DECLARE v_ID char(10);
        SELECT MAX(ID_KetQua) INTO v_ID FROM KetQuaKham;
        RETURN CONCAT('KQ', LPAD(IFNULL(CAST(SUBSTRING(v_ID, 3) AS UNSIGNED), 0) + 1, 8, '0'));
    END`,

    // 3. TaoIDTaiKhoan
    `CREATE FUNCTION TaoIDTaiKhoan() RETURNS char(10)
    DETERMINISTIC
    BEGIN
        DECLARE v_ID_MoiNhat char(10);
        SELECT MAX(ID_TaiKhoan) INTO v_ID_MoiNhat FROM TaiKhoanThanhVien;
        IF v_ID_MoiNhat IS NULL THEN
            RETURN 'KH00000001';
        END IF;
        RETURN CONCAT('KH', LPAD(CAST(SUBSTRING(v_ID_MoiNhat, 3) AS UNSIGNED) + 1, 8, '0'));
    END`,

    // 4. TaoIDGiong
    `CREATE FUNCTION TaoIDGiong() RETURNS char(10)
    DETERMINISTIC
    BEGIN
        DECLARE v_ID_MoiNhat char(10);
        SELECT MAX(ID_Giong) INTO v_ID_MoiNhat FROM Giong;
        IF v_ID_MoiNhat IS NULL THEN
            RETURN 'GTC0000001';
        END IF;
        RETURN CONCAT('GTC', LPAD(CAST(SUBSTRING(v_ID_MoiNhat, 4) AS UNSIGNED) + 1, 7, '0'));
    END`,

    // 5. TaoIDLoai
    `CREATE FUNCTION TaoIDLoai() RETURNS char(10)
    DETERMINISTIC
    BEGIN
        DECLARE v_ID_MoiNhat char(10);
        SELECT MAX(ID_Loai) INTO v_ID_MoiNhat FROM Loai;
        IF v_ID_MoiNhat IS NULL THEN
            RETURN 'LTC0000001';
        END IF;
        RETURN CONCAT('LTC', LPAD(CAST(SUBSTRING(v_ID_MoiNhat, 4) AS UNSIGNED) + 1, 7, '0'));
    END`,

    // 6. TaoIDThuCung
    `CREATE FUNCTION TaoIDThuCung() RETURNS char(10)
    DETERMINISTIC
    BEGIN
        DECLARE v_ID_MoiNhat char(10);
        SELECT MAX(ID_ThuCung) INTO v_ID_MoiNhat FROM ThuCung;
        IF v_ID_MoiNhat IS NULL THEN
            RETURN 'TC00000001';
        END IF;
        RETURN CONCAT('TC', LPAD(CAST(SUBSTRING(v_ID_MoiNhat, 3) AS UNSIGNED) + 1, 8, '0'));
    END`,

    // 7. TaoIDHoaDon
    `CREATE FUNCTION TaoIDHoaDon() RETURNS char(10)
    DETERMINISTIC
    BEGIN
        DECLARE v_ID_MoiNhat char(10);
        SELECT MAX(ID_HoaDon) INTO v_ID_MoiNhat FROM HoaDon;
        IF v_ID_MoiNhat IS NULL THEN
            RETURN 'HD00000001';
        END IF;
        RETURN CONCAT('HD', LPAD(CAST(SUBSTRING(v_ID_MoiNhat, 3) AS UNSIGNED) + 1, 8, '0'));
    END`,

    // 8. TaoIDSanPham
    `CREATE FUNCTION TaoIDSanPham() RETURNS char(10)
    DETERMINISTIC
    BEGIN
        DECLARE v_ID_MoiNhat char(10);
        SELECT MAX(ID_SanPham) INTO v_ID_MoiNhat FROM SanPham;
        IF v_ID_MoiNhat IS NULL THEN
            RETURN 'SP00000001';
        END IF;
        RETURN CONCAT('SP', LPAD(CAST(SUBSTRING(v_ID_MoiNhat, 3) AS UNSIGNED) + 1, 8, '0'));
    END`,

    // 9. TaoIDNhanVien
    `CREATE FUNCTION TaoIDNhanVien() RETURNS char(10)
    DETERMINISTIC
    BEGIN
        DECLARE v_ID_MoiNhat char(10);
        SELECT MAX(ID_NhanVien) INTO v_ID_MoiNhat FROM NhanVien;
        IF v_ID_MoiNhat IS NULL THEN
            RETURN 'NV00000001';
        END IF;
        RETURN CONCAT('NV', LPAD(CAST(SUBSTRING(v_ID_MoiNhat, 3) AS UNSIGNED) + 1, 8, '0'));
    END`,

    // 10. TinhDiemTichLuy
    `CREATE FUNCTION TinhDiemTichLuy(p_TongHoaDon float) RETURNS int
    DETERMINISTIC
    BEGIN
        RETURN CAST(p_TongHoaDon / 50000 AS SIGNED);
    END`,

    // 11. XacDinhHang
    `CREATE FUNCTION XacDinhHang(p_TongChiTieuNamNay float, p_ID_TaiKhoan char(10))
    RETURNS varchar(30)
    DETERMINISTIC
    BEGIN
        DECLARE v_CapDoHienTai varchar(30);
        
        SELECT CD.TenCapDo INTO v_CapDoHienTai
        FROM TaiKhoanThanhVien TK 
        LEFT JOIN CapDoThanhVien CD ON TK.ID_CapDo = CD.ID_CapDo
        WHERE TK.ID_TaiKhoan = p_ID_TaiKhoan;

        SET v_CapDoHienTai = IFNULL(v_CapDoHienTai, 'Cơ bản');

        IF p_TongChiTieuNamNay >= 12000000 THEN
            RETURN 'VIP';
        END IF;
        
        IF v_CapDoHienTai = 'VIP' AND p_TongChiTieuNamNay >= 8000000 THEN
            RETURN 'VIP';
        END IF;

        IF p_TongChiTieuNamNay >= 5000000 THEN
            RETURN 'Thân thiết';
        END IF;

        IF (v_CapDoHienTai = 'Thân thiết' OR v_CapDoHienTai = 'VIP') AND p_TongChiTieuNamNay >= 3000000 THEN
            RETURN 'Thân thiết';
        END IF;

        RETURN 'Cơ bản';
    END`,

    // 12. fn_DoanhThuChiNhanhThang
    `CREATE FUNCTION fn_DoanhThuChiNhanhThang(p_ID_ChiNhanh char(10), p_Thang int, p_Nam int)
    RETURNS float
    DETERMINISTIC
    BEGIN
        DECLARE v_DoanhThu float;

        SELECT IFNULL(SUM(HD.TongTien), 0) INTO v_DoanhThu
        FROM HoaDon HD
        JOIN NhanVien NV ON HD.ID_NhanVien = NV.ID_NhanVien
        WHERE NV.ID_ChiNhanh = p_ID_ChiNhanh
          AND MONTH(HD.NgayLap) = p_Thang
          AND YEAR(HD.NgayLap) = p_Nam;

        RETURN v_DoanhThu;
    END`
];

async function runCommands() {
    console.log("⏳ Đang cài đặt TOÀN BỘ Functions...");
    const promiseDb = db.promise();

    for (const [index, cmd] of sqlCommands.entries()) {
        try {
            await promiseDb.query(cmd);
            console.log(`✅ [${index + 1}/${sqlCommands.length}] Thành công.`);
        } catch (err) {
            console.error(`❌ Lỗi tại lệnh số ${index + 1}:`, err.message);
        }
    }
    console.log("🎉 Hoàn tất cài đặt Functions!");
    db.end();
}

runCommands();

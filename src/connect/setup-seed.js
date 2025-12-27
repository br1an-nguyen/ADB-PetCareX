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

// 1. Cấu hình kết nối (Từ .env)
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
});

// 2. Dữ liệu mồi (Đã được bọc trong dấu huyền ` ` để không bị lỗi dòng)
const sql = `
    -- Tắt kiểm tra khóa ngoại để tránh lỗi thứ tự (An toàn nhất)
    SET FOREIGN_KEY_CHECKS = 0;

    -- Xóa sạch dữ liệu cũ để tránh trùng lặp
    DELETE FROM ChiNhanh_DichVu;
    DELETE FROM ChiNhanh;
    DELETE FROM DichVu;
    DELETE FROM Giong;
    DELETE FROM Loai;
    DELETE FROM Loai_Vacxin;
    DELETE FROM Loai_SanPham;
    DELETE FROM HinhThucThanhToan;
    DELETE FROM ChucVu;
    DELETE FROM CapDoThanhVien;

    -- 1. Cấp Độ
    INSERT INTO CapDoThanhVien (ID_CapDo, TenCapDo, MucChiTieuToiThieu, MucChiTieuGiuHang) VALUES 
    ('CD001', 'Cơ bản', 0, 0),
    ('CD002', 'Thân thiết', 5000000, 3000000),
    ('CD003', 'VIP', 12000000, 8000000);

    -- 2. Chức Vụ
    INSERT INTO ChucVu (ID_ChucVu, TenChucVu) VALUES 
    ('CV001', 'Bác sĩ thú y'),
    ('CV002', 'Nhân viên bán hàng'),
    ('CV003', 'Lễ tân'),
    ('CV004', 'Quản lý');

    -- 3. Hình Thức Thanh Toán
    INSERT INTO HinhThucThanhToan (ID_HinhThuc, TenHinhThuc) VALUES 
    ('TT001', 'Tiền mặt'),
    ('TT002', 'Chuyển khoản'),
    ('TT003', 'Thẻ tín dụng');

    -- 4. Loại Sản Phẩm
    INSERT INTO Loai_SanPham (ID_LoaiSP, TenLoaiSP) VALUES 
    ('LSP001', 'Thức ăn'),
    ('LSP002', 'Phụ kiện'),
    ('LSP003', 'Thuốc');

    -- 5. Loại Vắc Xin
    INSERT INTO Loai_Vacxin (ID_LoaiVacxin, Ten_LoaiVacxin) VALUES 
    ('VX001', 'Dại (Rabies)'),
    ('VX002', 'Đa giá (5 bệnh)');

    -- 6. Loài Vật
    INSERT INTO Loai (ID_Loai, TenLoai, MoTa) VALUES 
    ('LTC0000001', 'Chó', 'Loài chó'),
    ('LTC0000002', 'Mèo', 'Loài mèo');

    -- 7. Giống (Phải chạy sau Loài)
    INSERT INTO Giong (ID_Giong, ID_Loai, TenGiong, DacDiem) VALUES 
    ('GTC0000001', 'LTC0000001', 'Poodle', 'Lông xoăn, nhỏ'),
    ('GTC0000002', 'LTC0000001', 'Husky', 'Ngáo, lông dày'),
    ('GTC0000003', 'LTC0000002', 'Mướp', 'Mèo ta, lông vằn'),
    ('GTC0000004', 'LTC0000002', 'Anh Lông Ngắn', 'Mặt nọng, lông ngắn');

    -- 8. Dịch Vụ
    INSERT INTO DichVu (ID_DichVu, Ten_DichVu, Loai_DichVu, MoTa) VALUES 
    ('DV001', 'Khám Lâm Sàng', 'KHAM', 'Khám tổng quát cho thú cưng'),
    ('DV002', 'Tiêm Phòng Dại', 'TIEM', 'Tiêm vắc xin dại'),
    ('DV003', 'Spa - Cắt tỉa', 'SPA', 'Cắt tỉa lông');

    -- 9. Chi Nhánh
    INSERT INTO ChiNhanh (ID_ChiNhanh, Ten_ChiNhanh, SDT, DiaChi_ChiNhanh, GioMoCua, GioDongCua) VALUES
    ('CN001', 'PetCarX Quận 1', '0909000001', '135B Trần Hưng Đạo, Q1', '07:30', '21:00');

    -- 10. Chi Nhánh - Dịch Vụ (Phải chạy sau Chi Nhánh và Dịch Vụ)
    INSERT INTO ChiNhanh_DichVu (ID_DichVuDuocDung, ID_ChiNhanh, ID_DichVu, Gia_DichVu) VALUES
    ('CNDV001', 'CN001', 'DV001', 150000), 
    ('CNDV002', 'CN001', 'DV002', 200000), 
    ('CNDV003', 'CN001', 'DV003', 300000);

    -- Bật lại kiểm tra khóa ngoại
    SET FOREIGN_KEY_CHECKS = 1;
`;

console.log('⏳ Đang nạp dữ liệu danh mục (Seed Data)...');

db.query(sql, (err, results) => {
    if (err) {
        console.error('❌ Lỗi:', err.message);
    } else {
        console.log('✅ Đã nạp thành công toàn bộ dữ liệu mẫu!');
    }
    db.end();
});
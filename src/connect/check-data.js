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

// Cấu hình kết nối Aiven (Từ .env)
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

console.log('🔍 Đang kiểm tra dữ liệu trên Aiven...');

// Kiểm tra thử bảng ChucVu (Dữ liệu mồi)
db.query('SELECT count(*) FROM ChiNhanh_DichVu', (err, results) => {
    if (err) {
        console.error('❌ Lỗi:', err.message);
    } else {
        console.log('\n✅ Bảng chi nhánh dich vu (Dữ liệu mồi):');
        console.table(results); // In ra dạng bảng đẹp mắt
    }
});

// Kiểm tra thử bảng Giong (Xem có bao nhiêu dòng rồi)
db.query('SELECT COUNT(*) AS TongSoDong FROM Giong', (err, results) => {
    if (!err) {
        console.log('\n✅ Tổng số dòng trong bảng Giong:');
        console.log(`👉 ${results[0].TongSoDong} dòng`);
    }
    db.end();
});
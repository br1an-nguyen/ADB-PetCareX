const mysql = require('mysql2');
require('dotenv').config();

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
db.query('SELECT * FROM ThuCung', (err, results) => {
    if (err) {
        console.error('❌ Lỗi:', err.message);
    } else {
        console.log('\n✅ Bảng thu cung (Dữ liệu mồi):');
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
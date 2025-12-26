const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
});

// ... Phần còn lại của code giữ nguyên ...
console.log('⏳ Đang thử kết nối tới Aiven...');

// 2. Thử kết nối
db.connect((err) => {
    if (err) {
        console.error('❌ KẾT NỐI THẤT BẠI!');
        console.error('Lỗi chi tiết:', err.message);
        if (err.code === 'HANDSHAKE_SSL_ERROR') {
            console.error('👉 Gợi ý: Kiểm tra lại file ca.pem hoặc Host name.');
        }
        return;
    }
    console.log('✅ KẾT NỐI THÀNH CÔNG! (SSL Handshake OK)');
});

// 3. Thử chạy một câu lệnh đơn giản
db.query('SELECT VERSION() AS version, NOW() as time', (err, results) => {
    if (err) {
        console.error('❌ Lỗi khi chạy lệnh SQL:', err.message);
    } else {
        console.log('------------------------------------------------');
        console.log('🎉 Database Aiven đang hoạt động tốt!');
        console.log('📦 Phiên bản MySQL:', results[0].version);
        console.log('🕒 Thời gian Server:', results[0].time);
        console.log('------------------------------------------------');
    }
    
    // 4. Đóng kết nối
    db.end();
});
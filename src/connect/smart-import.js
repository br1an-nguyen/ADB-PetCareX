const readline = require('readline');
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
const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
    connectionLimit: 5
});

async function importThongMinh() {
    const duongDanFile = 'data.sql'; // Tên file SQL của bạn

    console.log(`C:\Users\Acer\source\repos\Nam3_ki1\ADB\test`);

    const fileStream = fs.createReadStream(duongDanFile);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let count = 0;
    let skipped = 0;
    let sqlBuffer = ''; // Biến để gom các dòng lại
    const promiseDb = db.promise();

    console.log("🚀 Bắt đầu nạp dữ liệu (Chế độ gom dòng)...");

    for await (let line of rl) {
        let cleanLine = line.trim();

        // Bỏ qua dòng trống hoặc comment
        if (!cleanLine || cleanLine.startsWith('--')) continue;

        // Cộng dồn dòng hiện tại vào bộ đệm (thêm dấu cách để không bị dính chữ)
        sqlBuffer += line + ' ';

        // KIỂM TRA: Nếu dòng kết thúc bằng dấu chấm phẩy ; nghĩa là hết câu lệnh
        if (cleanLine.endsWith(';')) {
            
            // Lọc bỏ các lệnh không mong muốn (DROP, CREATE, USE, GO...)
            const upperSql = sqlBuffer.trim().toUpperCase();
            if (upperSql.startsWith('USE') || 
                upperSql.startsWith('GO') || 
                upperSql.startsWith('DROP') || 
                upperSql.startsWith('CREATE') || 
                upperSql.startsWith('SET')) {
                
                skipped++;
                sqlBuffer = ''; // Xóa bộ đệm để sang câu mới
                continue;
            }

            try {
                // Xử lý chữ N' trước khi chạy
                const finalQuery = sqlBuffer.replace(/N'/g, "'");

                // Chạy lệnh hoàn chỉnh
                await promiseDb.query(finalQuery);
                
                count++;
                if (count % 1000 === 0) console.log(`✅ Đã nạp ${count} dòng...`);

            } catch (err) {
                console.error(`❌ Lỗi ở câu lệnh (đã cắt gọn): ${sqlBuffer.substring(0, 100)}...`);
                console.error(`=> Chi tiết: ${err.message}`);
            }

            // Quan trọng: Reset bộ đệm về rỗng để chứa câu lệnh tiếp theo
            sqlBuffer = '';
        }
    }

    console.log(`\n🎉 HOÀN TẤT!`);
    console.log(`- Đã nạp thành công: ${count} câu lệnh.`);
    console.log(`- Đã bỏ qua: ${skipped} câu lệnh.`);
    db.end();
}

importThongMinh();
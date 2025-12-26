const readline = require('readline');
const mysql = require('mysql2');
require('dotenv').config();

// 1. Cấu hình kết nối (Từ .env)
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
});

async function importBatTu() {
    const duongDanFile = 'data.sql'; 

    console.log(`C:\Users\Acer\source\repos\Nam3_ki1\ADB\test`);
    console.log(`🛡️ Chế độ: Tự động BỎ QUA dữ liệu trùng lặp...`);

    const promiseDb = db.promise();
    // Tắt kiểm tra khóa ngoại để tránh lỗi cha-con
    await promiseDb.query("SET FOREIGN_KEY_CHECKS = 0;");

    const fileStream = fs.createReadStream(duongDanFile);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let count = 0;
    let duplicateCount = 0;
    let sqlBuffer = ''; 

    console.log("🚀 Bắt đầu nạp...");

    for await (let line of rl) {
        let cleanLine = line.trim();
        if (!cleanLine || cleanLine.startsWith('--')) continue;

        sqlBuffer += line + ' ';

        if (cleanLine.endsWith(';')) {
            try {
                // Xử lý chữ N' -> '
                const finalQuery = sqlBuffer.replace(/N'/g, "'");

                await promiseDb.query(finalQuery);
                
                count++;
                if (count % 1000 === 0) console.log(`✅ Đã thêm mới ${count} dòng...`);

            } catch (err) {
                // 🔥 ĐÂY LÀ CHỖ QUAN TRỌNG NHẤT
                if (err.code === 'ER_DUP_ENTRY') {
                    // Nếu lỗi là do trùng lặp -> Chỉ cần đếm và bỏ qua
                    duplicateCount++;
                    // Không in lỗi ra màn hình để đỡ rối
                } else {
                    // Nếu là lỗi khác (sai cú pháp...) thì mới báo
                    console.error(`❌ Lỗi lạ: ${err.message}`);
                    console.error(`   Tại lệnh: ${sqlBuffer.substring(0, 50)}...`);
                }
            }
            sqlBuffer = ''; 
        }
    }

    await promiseDb.query("SET FOREIGN_KEY_CHECKS = 1;");
    console.log(`\n🎉 HOÀN TẤT!`);
    console.log(`- ✅ Thêm mới thành công: ${count} dòng.`);
    console.log(`- ⚠️ Đã có sẵn (Bỏ qua): ${duplicateCount} dòng.`);
    db.end();
}

importBatTu();
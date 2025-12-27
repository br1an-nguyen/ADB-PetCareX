// Unified import script combining features of import-data.js, smart-import.js, and fix.js
// Modes via CLI flags (all optional):
//   --file <path>      : path to SQL file (default: data.sql)
//   --skip-ddl         : skip DDL/utility statements (USE, GO, DROP, CREATE, SET, ALTER)
//   --ignore-dup       : ignore duplicate key errors (ER_DUP_ENTRY)
//   --fk-off           : temporarily disable foreign key checks during import (default: on)
//   --fk-on            : force leave foreign key checks on (overrides --fk-off)
// Env selection:
//   ENV_FILE (absolute or relative) has priority over ENV_PROFILE (index|non-index); else default .env

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const mysql = require('mysql2');
const dotenv = require('dotenv');

// -------- Parse CLI args (simple) --------
const argv = process.argv.slice(2);
const getFlag = (name) => argv.includes(`--${name}`);
const getValue = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  if (i !== -1 && i + 1 < argv.length) return argv[i + 1];
  return def;
};

const sqlFile = getValue('file', 'data.sql');
const skipDDL = getFlag('skip-ddl');
const ignoreDup = getFlag('ignore-dup');
// default: fk-off true unless --fk-on provided
const fkOnExplicit = getFlag('fk-on');
const fkOffExplicit = getFlag('fk-off');
const fkOff = fkOnExplicit ? false : (fkOffExplicit ? true : true);

// -------- Env selection (ENV_FILE > ENV_PROFILE > default) --------
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

// Identify env + DB target
const selectedBy = EXPLICIT_ENV && EXPLICIT_ENV.length > 0
  ? `ENV_FILE (${EXPLICIT_ENV})`
  : (ENV_PROFILE ? `ENV_PROFILE (${ENV_PROFILE})` : 'default .env');
console.log(`🔧 Env source: ${selectedBy}`);
console.log(`📄 Env path  : ${envPath}`);
console.log(`🗄️  DB target : ${process.env.DB_USER}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
console.log(`⚙️  Options   : file='${sqlFile}', skipDDL=${skipDDL}, ignoreDup=${ignoreDup}, fkOff=${fkOff}`);

// -------- MySQL connection (pool) --------
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true,
  connectionLimit: 5,
});
const db = pool.promise();

// Utility: check file exist
function ensureFileExists(p) {
  if (!fs.existsSync(p)) {
    throw new Error(`Không tìm thấy file SQL: ${p}`);
  }
}

// Determine if a statement is DDL/utility we want to skip in --skip-ddl mode
function isDDL(stmt) {
  const s = stmt.trim().toUpperCase();
  return (
    s.startsWith('USE ') ||
    s.startsWith('GO') ||
    s.startsWith('DROP ') ||
    s.startsWith('CREATE ') ||
    s.startsWith('SET ') ||
    s.startsWith('ALTER ')
  );
}

async function run() {
  try {
    const filePath = path.isAbsolute(sqlFile) ? sqlFile : path.join(__dirname, sqlFile);
    ensureFileExists(filePath);

    // FK OFF if chosen
    if (fkOff) {
      try {
        await db.query('SET FOREIGN_KEY_CHECKS = 0;');
      } catch (e) {
        console.warn(`⚠️  Không thể SET FOREIGN_KEY_CHECKS = 0: ${e.message}`);
      }
    }

    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let executed = 0;
    let skipped = 0;
    let duplicates = 0;
    let errors = 0;
    let sqlBuffer = '';

    console.log('🚀 Bắt đầu import...');

    for await (const rawLine of rl) {
      const line = rawLine.trim();
      if (!line || line.startsWith('--')) continue; // skip empty/comment

      sqlBuffer += rawLine + ' ';

      if (line.endsWith(';')) {
        let stmt = sqlBuffer.trim();

        // Optional: skip DDL
        if (skipDDL && isDDL(stmt)) {
          skipped++;
          sqlBuffer = '';
          continue;
        }

        // Replace N' with '
        const finalQuery = stmt.replace(/N'/g, "'");

        try {
          await db.query(finalQuery);
          executed++;
          if (executed % 1000 === 0) console.log(`✅ Đã thực thi ${executed} câu lệnh...`);
        } catch (err) {
          if (ignoreDup && err && err.code === 'ER_DUP_ENTRY') {
            duplicates++;
          } else {
            errors++;
            console.error(`❌ Lỗi: ${err.message}`);
            console.error(`   Câu lệnh (rút gọn): ${finalQuery.substring(0, 120)}...`);
          }
        }
        sqlBuffer = '';
      }
    }

    // FK ON back
    if (fkOff) {
      try {
        await db.query('SET FOREIGN_KEY_CHECKS = 1;');
      } catch (e) {
        console.warn(`⚠️  Không thể SET FOREIGN_KEY_CHECKS = 1: ${e.message}`);
      }
    }

    console.log('\n🎉 HOÀN TẤT!');
    console.log(`- ✅ Thực thi thành công : ${executed}`);
    console.log(`- ⚠️  Bỏ qua (DDL)       : ${skipped}`);
    console.log(`- 🟡 Trùng (bỏ qua)      : ${duplicates}`);
    console.log(`- ❌ Lỗi khác            : ${errors}`);
  } catch (e) {
    console.error(`❌ Dừng import: ${e.message}`);
  } finally {
    pool.end();
  }
}

run();

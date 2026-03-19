const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
    console.log('Running migration...');
    const connection = await mysql.createConnection(process.env.DATABASE_URL);

    try {
        const sql = fs.readFileSync(path.join(__dirname, '../database/migrations/002_add_video_url.sql'), 'utf8');
        await connection.query(sql);
        console.log('Migration successful: 002_add_video_url.sql');
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Column already exists, skipping.');
        } else {
            console.error('Migration failed:', error);
        }
    } finally {
        await connection.end();
    }
}

runMigration();

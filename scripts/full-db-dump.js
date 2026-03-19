const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: '.env.local' });

async function dumpDatabase() {
    console.log("📦 Starting full database dump...");

    if (!process.env.DATABASE_URL) {
        console.error("❌ DATABASE_URL is not defined in .env.local");
        process.exit(1);
    }

    const connection = await mysql.createConnection(process.env.DATABASE_URL);

    try {
        const [tables] = await connection.query("SHOW TABLES");
        const tableNames = tables.map(t => Object.values(t)[0]);

        let dumpContent = `-- Alexco Database Full Dump\n`;
        dumpContent += `-- Generated: ${new Date().toISOString()}\n`;
        dumpContent += `-- Database: ${process.env.DB_NAME}\n\n`;
        dumpContent += `SET FOREIGN_KEY_CHECKS=0;\n\n`;

        for (const tableName of tableNames) {
            console.log(`Processing table: ${tableName}`);

            // 1. Drop table
            dumpContent += `-- Table structure for table \`${tableName}\`\n`;
            dumpContent += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;

            // 2. Create table
            const [createRows] = await connection.query(`SHOW CREATE TABLE \`${tableName}\``);
            const createTableSql = createRows[0]['Create Table'];
            dumpContent += `${createTableSql};\n\n`;

            // 3. Dump data
            const [rows] = await connection.query(`SELECT * FROM \`${tableName}\``);

            if (rows.length > 0) {
                dumpContent += `-- Dumping data for table \`${tableName}\`\n`;

                // Batch inserts to avoid huge query packets
                const BATCH_SIZE = 100;
                for (let i = 0; i < rows.length; i += BATCH_SIZE) {
                    const batch = rows.slice(i, i + BATCH_SIZE);
                    const values = batch.map(row => {
                        return `(${Object.values(row).map(val => connection.escape(val)).join(', ')})`;
                    }).join(',\n');

                    dumpContent += `INSERT INTO \`${tableName}\` VALUES \n${values};\n`;
                }
                dumpContent += `\n`;
            } else {
                dumpContent += `-- No data for table \`${tableName}\`\n\n`;
            }
        }

        dumpContent += `SET FOREIGN_KEY_CHECKS=1;\n`;

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `full_dump_${timestamp}.sql`;
        const outputPath = path.join(process.cwd(), 'database', filename);

        fs.writeFileSync(outputPath, dumpContent);

        console.log(`\n✅ Database dump completed successfully!`);
        console.log(`📁 File saved to: ${outputPath}`);
        console.log(`\n👉 NEXT STEP: Upload this file to Hostinger via phpMyAdmin.`);

    } catch (error) {
        console.error("❌ Database dump failed:", error);
    } finally {
        await connection.end();
    }
}

dumpDatabase();

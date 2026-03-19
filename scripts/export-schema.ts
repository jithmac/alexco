import { query } from "@/lib/db";
import fs from 'fs';
import path from 'path';

async function exportSchema() {
    console.log("📦 Exporting database schema...");

    try {
        // Get all tables
        const tables = await query("SHOW TABLES") as any[];
        const tableNames = tables.map(t => Object.values(t)[0]);

        let sql = "-- Alexco Database Schema\n";
        sql += `-- Generated: ${new Date().toISOString()}\n\n`;

        for (const tableName of tableNames) {
            const [createRow] = await query(`SHOW CREATE TABLE \`${tableName}\``) as any[];
            if (createRow && createRow['Create Table']) {
                sql += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
                sql += `${createRow['Create Table']};\n\n`;
            }
        }

        const outputPath = path.join(process.cwd(), 'database', 'full_schema.sql');
        fs.writeFileSync(outputPath, sql);

        console.log(`✅ Schema exported to: ${outputPath}`);
        console.log("   (Note: This file contains DROP TABLE statements. Use with caution on production!)");

    } catch (error) {
        console.error("❌ Export failed:", error);
    }
}

exportSchema();

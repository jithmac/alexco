/**
 * Schema Compare Tool
 * 
 * Compares the live database against schema.sql and generates
 * a numbered migration file with the differences.
 * 
 * Usage: npm run db:diff
 */

import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const DB_URL = process.env.DATABASE_URL;
const SCHEMA_FILE = path.join(__dirname, '..', 'database', 'schema.sql');
const MIGRATIONS_DIR = path.join(__dirname, '..', 'database', 'migrations');

// ─── Parse schema.sql to extract table definitions ───

interface ColumnDef {
    name: string;
    definition: string; // full column SQL without trailing comma
}

interface TableDef {
    name: string;
    columns: ColumnDef[];
    fullSQL: string;
}

function parseSchemaFile(filePath: string): TableDef[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const tables: TableDef[] = [];

    // Match CREATE TABLE blocks
    const tableRegex = /CREATE TABLE IF NOT EXISTS (\w+)\s*\(([\s\S]*?)\);/gi;
    let match;

    while ((match = tableRegex.exec(content)) !== null) {
        const tableName = match[1];
        const body = match[2];
        const columns: ColumnDef[] = [];

        // Split by lines and parse columns (skip constraints like FOREIGN KEY, INDEX, etc.)
        const lines = body.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        for (const line of lines) {
            const cleanLine = line.replace(/,\s*$/, '').trim();
            if (!cleanLine) continue;

            // Skip non-column definitions
            if (/^(PRIMARY KEY|FOREIGN KEY|INDEX|UNIQUE KEY|UNIQUE INDEX|KEY |CONSTRAINT)/i.test(cleanLine)) continue;
            if (/^--/.test(cleanLine)) continue;

            // Extract column name (first word)
            const colNameMatch = cleanLine.match(/^(\w+)\s+/);
            if (colNameMatch) {
                // Strip inline SQL comments (e.g., "-- Which branch/site")
                // and trailing commas from schema.sql column lists
                const defWithoutComment = cleanLine
                    .replace(/\s*--.*$/, '')  // remove inline comments
                    .replace(/,\s*$/, '')     // remove trailing commas
                    .trim();
                columns.push({
                    name: colNameMatch[1].toLowerCase(),
                    definition: defWithoutComment
                });
            }
        }

        tables.push({
            name: tableName.toLowerCase(),
            columns,
            fullSQL: match[0]
        });
    }

    return tables;
}

// ─── Read live database schema ───

interface LiveColumn {
    name: string;
    type: string;
    nullable: string;
    defaultValue: any;
    extra: string;
}

interface LiveTable {
    name: string;
    columns: LiveColumn[];
}

async function getLiveSchema(connection: mysql.Connection, dbName: string): Promise<LiveTable[]> {
    const [tables] = await connection.execute(
        `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'`,
        [dbName]
    ) as any[];

    const liveTables: LiveTable[] = [];

    for (const row of tables) {
        const tableName = row.TABLE_NAME;
        const [columns] = await connection.execute(
            `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA 
             FROM information_schema.COLUMNS 
             WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
             ORDER BY ORDINAL_POSITION`,
            [dbName, tableName]
        ) as any[];

        liveTables.push({
            name: tableName.toLowerCase(),
            columns: columns.map((c: any) => ({
                name: c.COLUMN_NAME.toLowerCase(),
                type: c.COLUMN_TYPE,
                nullable: c.IS_NULLABLE,
                defaultValue: c.COLUMN_DEFAULT,
                extra: c.EXTRA
            }))
        });
    }

    return liveTables;
}

// ─── Compare and generate migration ───

function generateMigration(schemaTables: TableDef[], liveTables: LiveTable[]): string[] {
    const statements: string[] = [];
    const liveTableMap = new Map(liveTables.map(t => [t.name, t]));

    for (const schemaDef of schemaTables) {
        const liveTable = liveTableMap.get(schemaDef.name);

        if (!liveTable) {
            // ✅ Whole table is missing — use the CREATE TABLE from schema.sql
            statements.push(`-- NEW TABLE: ${schemaDef.name}`);
            statements.push(schemaDef.fullSQL);
            statements.push('');
            continue;
        }

        // Table exists — check for missing columns
        const liveColNames = new Set(liveTable.columns.map(c => c.name));

        for (const col of schemaDef.columns) {
            if (!liveColNames.has(col.name)) {
                // Column missing — generate safe ADD COLUMN
                statements.push(`-- ADD COLUMN: ${schemaDef.name}.${col.name}`);
                statements.push(
                    `SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = '${schemaDef.name}' AND column_name = '${col.name}');`
                );
                statements.push(
                    `SET @sql := IF(@exist = 0, 'ALTER TABLE ${schemaDef.name} ADD COLUMN ${col.definition.replace(/'/g, "\\'")}', 'SELECT 1');`
                );
                statements.push(`PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;`);
                statements.push('');
            }
        }
    }

    return statements;
}

// ─── Get next migration number ───

function getNextMigrationNumber(): string {
    if (!fs.existsSync(MIGRATIONS_DIR)) {
        fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
    }

    const files = fs.readdirSync(MIGRATIONS_DIR).filter(f => /^\d{3}_/.test(f));
    if (files.length === 0) return '001';

    const numbers = files.map(f => parseInt(f.substring(0, 3), 10));
    const next = Math.max(...numbers) + 1;
    return next.toString().padStart(3, '0');
}

// ─── Main ───

async function main() {
    if (!DB_URL) {
        console.error('❌ DATABASE_URL is not set in .env');
        process.exit(1);
    }

    console.log('📋 Reading schema.sql...');
    const schemaTables = parseSchemaFile(SCHEMA_FILE);
    console.log(`   Found ${schemaTables.length} tables in schema.sql`);

    console.log('🔌 Connecting to database...');
    const connection = await mysql.createConnection(DB_URL);

    // Extract DB name from connection
    const [dbResult] = await connection.execute('SELECT DATABASE() as db_name') as any[];
    const dbName = dbResult[0].db_name;
    console.log(`   Connected to: ${dbName}`);

    console.log('🔍 Reading live schema...');
    const liveTables = await getLiveSchema(connection, dbName);
    console.log(`   Found ${liveTables.length} tables in database`);

    console.log('⚡ Comparing...');
    const statements = generateMigration(schemaTables, liveTables);

    await connection.end();

    if (statements.length === 0) {
        console.log('\n✅ Database is in sync with schema.sql — no migration needed!');
        return;
    }

    // Generate migration file
    const migrationNumber = getNextMigrationNumber();
    const today = new Date().toISOString().split('T')[0];
    const filename = `${migrationNumber}_auto_sync_${today.replace(/-/g, '')}.sql`;
    const filepath = path.join(MIGRATIONS_DIR, filename);

    const content = [
        `-- Auto-generated migration`,
        `-- Generated: ${new Date().toISOString()}`,
        `-- Sync schema.sql → live database`,
        ``,
        ...statements
    ].join('\n');

    fs.writeFileSync(filepath, content, 'utf-8');

    console.log(`\n✅ Migration generated: database/migrations/${filename}`);
    console.log(`   ${statements.filter(s => s.startsWith('-- NEW TABLE')).length} new table(s)`);
    console.log(`   ${statements.filter(s => s.startsWith('-- ADD COLUMN')).length} new column(s)`);
    console.log(`\n📝 Next steps:`);
    console.log(`   1. Review the file: database/migrations/${filename}`);
    console.log(`   2. Run locally to test`);
    console.log(`   3. git push → git pull on server → run in phpMyAdmin`);
}

main().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});

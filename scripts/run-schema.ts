// Run database schema using Node.js
// Usage: npx tsx scripts/run-schema.ts

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

async function runSchema() {
    // Dynamic import after dotenv is loaded
    const { query } = await import('../lib/db');

    console.log('📊 Running database schema...\n');

    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Split by CREATE TABLE statements and run each
    const statements = schema
        .split(/(?=CREATE TABLE)/gi)
        .map(s => s.trim())
        .filter(s => s.startsWith('CREATE TABLE'));

    for (const statement of statements) {
        // Extract table name for logging
        const match = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/i);
        const tableName = match ? match[1] : 'unknown';

        try {
            await query(statement);
            console.log(`✅ Created table: ${tableName}`);
        } catch (error: any) {
            if (error.code === 'ER_TABLE_EXISTS_ERROR') {
                console.log(`⏭️  Table exists: ${tableName}`);
            } else {
                console.error(`❌ Error creating ${tableName}:`, error.message);
            }
        }
    }

    console.log('\n✅ Schema execution complete!');
    console.log('\nNext step: Run `npx tsx scripts/seed-super-user.ts` to create the Super User.');

    process.exit(0);
}

runSchema().catch(err => {
    console.error('❌ Schema execution failed:', err.message);
    process.exit(1);
});

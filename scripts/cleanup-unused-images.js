const mysql = require('mysql2/promise');
const fs = require('fs/promises');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const UPLOAD_DIRS = [
    "public/uploads/products",
    "public/uploads/hr",
    "public/uploads/expenses",
    "public/uploads/applicants"
];

const DB_IMAGE_REFERENCES = [
    { table: 'products', columns: ['image', 'gallery'] },
    { table: 'employee_documents', columns: ['file_path'] },
    { table: 'expense_claims', columns: ['receipt_path'] },
    { table: 'certifications', columns: ['document_path'] },
    { table: 'job_applicants', columns: ['resume_path'] }
];

async function getAllReferencedFiles(connection) {
    const referencedFiles = new Set();

    for (const ref of DB_IMAGE_REFERENCES) {
        try {
            console.log(`Checking table ${ref.table}...`);
            const [rows] = await connection.execute(`SELECT ${ref.columns.join(', ')} FROM ${ref.table}`);

            for (const row of rows) {
                for (const col of ref.columns) {
                    const value = row[col];
                    if (!value) continue;

                    if (col === 'gallery') {
                        try {
                            const gallery = typeof value === 'string' ? JSON.parse(value) : value;
                            if (Array.isArray(gallery)) {
                                gallery.forEach(img => referencedFiles.add(img));
                            }
                        } catch (e) {
                            // Ignore parse errors
                        }
                    } else {
                        referencedFiles.add(value);
                    }
                }
            }
        } catch (err) {
            console.warn(`Could not check table ${ref.table}: ${err.message}`);
        }
    }

    return referencedFiles;
}

async function getFilesRecursively(dir) {
    const files = [];
    try {
        const items = await fs.readdir(dir);
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const s = await fs.stat(fullPath);
            if (s.isDirectory()) {
                files.push(...await getFilesRecursively(fullPath));
            } else {
                const relPath = path.relative(path.join(process.cwd(), 'public'), fullPath).replace(/\\/g, '/');
                files.push('/' + relPath);
            }
        }
    } catch (e) {
        if (e.code !== 'ENOENT') console.error(`Error reading directory ${dir}: ${e.message}`);
    }
    return files;
}

async function cleanup(dryRun = true) {
    // These fallbacks are tuned for your VPS environment
    const config = {
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'alexco_user',
        password: process.env.DB_PASSWORD || 'Ican123ZXC++',
        database: process.env.DB_NAME || 'alexco_db',
        port: Number(process.env.DB_PORT) || 3306
    };

    console.log(`Connecting to database ${config.user}@${config.host}...`);
    const connection = await mysql.createConnection(config);

    console.log(`Starting cleanup (${dryRun ? 'DRY RUN' : 'ACTUAL DELETE'})...`);

    const referencedFiles = await getAllReferencedFiles(connection);
    console.log(`Found ${referencedFiles.size} referenced files in DB.`);

    let totalDeleted = 0;
    let totalSize = 0;

    for (const uploadDir of UPLOAD_DIRS) {
        const fullUploadDir = path.join(process.cwd(), uploadDir);
        const existingFiles = await getFilesRecursively(fullUploadDir);

        for (const fileUrl of existingFiles) {
            if (!referencedFiles.has(fileUrl)) {
                const fullPath = path.join(process.cwd(), 'public', fileUrl);
                try {
                    const s = await fs.stat(fullPath);
                    totalSize += s.size;

                    if (dryRun) {
                        console.log(`[DRY RUN] Would delete: ${fileUrl} (${(s.size / 1024).toFixed(2)} KB)`);
                    } else {
                        await fs.unlink(fullPath);
                        console.log(`[DELETED] ${fileUrl}`);
                    }
                    totalDeleted++;
                } catch (e) {
                    console.error(`Error processing file ${fileUrl}: ${e.message}`);
                }
            }
        }
    }

    await connection.end();

    console.log(`\nCleanup summary:`);
    console.log(`Total orphaned files found: ${totalDeleted}`);
    console.log(`Total space ${dryRun ? 'to be reclaimed' : 'reclaimed'}: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);

    if (totalDeleted > 0 && dryRun) {
        console.log(`\nRun with --force to actually delete these files.`);
    }
}

const isForce = process.argv.includes('--force');
cleanup(!isForce).catch(console.error);

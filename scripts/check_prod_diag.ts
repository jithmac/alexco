import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), '.env') });

async function checkProducts() {
    const connectionString = process.env.DATABASE_URL;
    let output = '';

    if (!connectionString) {
        output = 'DATABASE_URL not found';
        fs.writeFileSync('prod_diag_output.txt', output);
        return;
    }

    try {
        const connection = await mysql.createConnection(connectionString);
        output += 'Connected to database\n';

        const [columns] = await connection.query('DESCRIBE products');
        output += 'Columns in "products":\n' + JSON.stringify(columns, null, 2) + '\n';

        await connection.end();
    } catch (error: any) {
        output += 'Error: ' + error.message + '\n' + error.stack;
    }

    fs.writeFileSync('prod_diag_output.txt', output);
}

checkProducts();

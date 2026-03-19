
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function debugAuthQuery() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL);
        const username = 'EMP-0008';

        console.log(`Testing Auth Query for: ${username}`);

        // This MUST match the query in server-actions/auth.ts exactly
        const query = `
            SELECT u.id, u.username, u.password_hash, u.full_name, u.email, u.is_active,
                   COALESCE(r.slug, u.role) as role,
                   u.role_id, r.slug as role_slug, u.role as legacy_role
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE u.username = ?
        `;

        const [rows] = await connection.execute(query, [username]);

        console.log('Query Result:', JSON.stringify(rows[0], null, 2));

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

debugAuthQuery();

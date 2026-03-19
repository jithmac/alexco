
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function debugUser() {
    const { query, pool } = await import('../lib/db');
    const bcrypt = await import('bcryptjs');

    const username = 'kamal.tech';
    const password = 'password123';

    console.log(`Checking user: ${username}`);

    const rows = await query(
        `SELECT id, username, password_hash, full_name, email, role, is_active 
         FROM users WHERE username = ?`,
        [username]
    ) as any[];

    if (rows.length === 0) {
        console.log('❌ User not found in database.');
    } else {
        const user = rows[0];
        console.log('✅ User found:', user);

        const isValid = await bcrypt.compare(password, user.password_hash);
        console.log(`🔑 Password '${password}' matches hash: ${isValid}`);
    }

    process.exit(0);
}

debugUser().catch(console.error);

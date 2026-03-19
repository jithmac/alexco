
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function fixUser() {
    const { query } = await import('../lib/db');
    const username = 'kamal.tech';

    console.log(`Checking active status for: ${username}`);

    const rows = await query(
        `SELECT id, is_active FROM users WHERE username = ?`,
        [username]
    ) as any[];

    if (rows.length > 0) {
        const user = rows[0];
        console.log(`Current is_active: ${user.is_active}`);

        if (!user.is_active) {
            console.log('User is inactive. Activating now...');
            await query(`UPDATE users SET is_active = TRUE WHERE id = ?`, [user.id]);
            console.log('✅ User activated.');
        } else {
            console.log('✅ User is already active.');
        }
    } else {
        console.log('❌ User not found.');
    }
    process.exit(0);
}

fixUser().catch(console.error);

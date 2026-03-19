// Seed script for initial Super User
// Run with: npx tsx scripts/seed-super-user.ts

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function seedSuperUser() {
    // Dynamic import to ensure dotenv is loaded first
    const { query } = await import('../lib/db');
    const bcrypt = await import('bcryptjs');

    const SUPER_USER = {
        id: crypto.randomUUID(),
        username: 'superadmin',
        password: 'Admin@123', // Change this in production!
        fullName: 'System Administrator',
        email: 'admin@alexco.lk',
        role: 'super_user'
    };

    console.log('🔐 Seeding Super User...');

    try {
        // Check if super user already exists
        const existing = await query(
            `SELECT id FROM users WHERE username = ? OR role = 'super_user'`,
            [SUPER_USER.username]
        ) as any[];

        if (existing.length > 0) {
            console.log('⚠️  Super User already exists. Skipping...');
            console.log('   Username: superadmin');
            console.log('   Use existing credentials to login.');
            process.exit(0);
        }

        // Hash password
        const passwordHash = await bcrypt.hash(SUPER_USER.password, 12);

        // Insert super user
        await query(
            `INSERT INTO users (id, username, password_hash, full_name, email, role) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [SUPER_USER.id, SUPER_USER.username, passwordHash, SUPER_USER.fullName, SUPER_USER.email, SUPER_USER.role]
        );

        console.log('✅ Super User created successfully!');
        console.log('');
        console.log('   📋 Login Credentials:');
        console.log('   ─────────────────────');
        console.log(`   Username: ${SUPER_USER.username}`);
        console.log(`   Password: ${SUPER_USER.password}`);
        console.log('');
        console.log('   ⚠️  IMPORTANT: Change this password after first login!');
        console.log('');

    } catch (error: any) {
        if (error.code === 'ER_NO_SUCH_TABLE') {
            console.error('❌ Error: users table does not exist.');
            console.error('   Run the schema.sql first to create the users table.');
            console.error('');
            console.error('   In MySQL, run:');
            console.error('   mysql -u root -p alexco_db < database/schema.sql');
        } else {
            console.error('❌ Error seeding super user:', error.message);
        }
        process.exit(1);
    }

    process.exit(0);
}

seedSuperUser();

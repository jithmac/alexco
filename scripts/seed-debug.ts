
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function seedMocks() {
    const { query, pool } = await import('../lib/db');
    const bcrypt = await import('bcryptjs');

    console.log('🌱 Seeding HR Mock Data (Minimal)...');
    const passwordHash = await bcrypt.hash('password123', 10);

    const mocks = [
        {
            empId: 'emp-sarah-hr',
            userId: 'user-sarah',
            name: 'Sarah Silva',
            username: 'sarah.hr',
            role: 'hr_staff',
            dept: 'hr',
            designation: 'HR Manager',
            empNo: 'EMP-100',
            email: 'sarah.hr@alexco.lk'
        }
    ];

    for (const m of mocks) {
        // Attempt 1: Just ID and Full Name
        try {
            await query(`INSERT IGNORE INTO employees (id, full_name, email) VALUES (?, ?, ?)`, [m.empId, m.name, m.email]);
            console.log('✅ Base insert ok');
        } catch (e: any) { console.error('Base:', e.sqlMessage); }

        // Attempt 2: Update with Employee Number
        try {
            await query(`UPDATE employees SET employee_number = ? WHERE id = ?`, [m.empNo, m.empId]);
            console.log('✅ EmpNo update ok');
        } catch (e: any) { console.error('EmpNo:', e.sqlMessage); }

        // Attempt 3: Update others
        try {
            await query(`UPDATE employees SET department=?, designation=?, role=?, phone_mobile=?, address_line1=?, status='active', joined_date='2023-01-15' WHERE id=?`,
                [m.dept, m.designation, m.role, '077123', 'addr', m.empId]);
            console.log('✅ Details + Status/Date update ok');
        } catch (e: any) { console.error('Details:', e.sqlMessage); }

        // User
        try {
            await query(`INSERT IGNORE INTO users (id, username, password_hash, full_name, email, role, employee_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [m.userId, m.username, passwordHash, m.name, m.email, m.role, m.empId]);
            console.log(`✅ User ok`);
        } catch (e: any) {
            console.error('User:', e.sqlMessage);
        }
    }

    await pool.end();
}
seedMocks();

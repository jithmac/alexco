
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function seedFinal() {
    const { query, pool } = await import('../lib/db');
    const bcrypt = await import('bcryptjs');

    const fs = await import('fs');

    const logError = (context: string, err: any) => {
        const msg = `[${context}] ${err.message}\nSQL: ${err.sqlMessage}\n`;
        fs.appendFileSync('logs/seed_final_error.txt', msg);
        console.error(`❌ ${context} failed. See logs.`);
    };

    if (!fs.existsSync('logs')) fs.mkdirSync('logs');
    fs.writeFileSync('logs/seed_final_error.txt', '--- SEED FINAL ERRORS ---\n');

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
        },
        {
            empId: 'emp-kamal-tech',
            userId: 'user-kamal',
            name: 'Kamal Perera',
            username: 'kamal.tech',
            role: 'technician',
            dept: 'solar',
            designation: 'Senior Technician',
            empNo: 'EMP-101',
            email: 'kamal.tech@alexco.lk'
        },
        {
            empId: 'emp-nimali-pos',
            userId: 'user-nimali',
            name: 'Nimali Fernando',
            username: 'nimali.pos',
            role: 'cashier',
            dept: 'retail',
            designation: 'Sales Assistant',
            empNo: 'EMP-102',
            email: 'nimali.pos@alexco.lk'
        }
    ];

    for (const m of mocks) {
        console.log(`Processing ${m.name}...`);

        // 1. Base Insert (INSERT IGNORE to handle existing)
        await query(`INSERT IGNORE INTO employees (id, full_name, email) VALUES (?, ?, ?)`, [m.empId, m.name, m.email]);

        // 2. Update Details (Ensures consistent state even if row existed)
        try {
            await query(`
                UPDATE employees 
                SET employee_number=?, department=?, designation=?, role=?, 
                    phone_mobile='0771234567', address_line1='123 Mock Street', 
                    status='active', joined_date='2023-01-15', full_name=?, email=?
                WHERE id=?
            `, [m.empNo, m.dept, m.designation, m.role, m.name, m.email, m.empId]);
        } catch (e: any) {
            logError(`Employee ${m.name}`, e);
        }

        // 3. User Account
        try {
            await query(`
                INSERT IGNORE INTO users (id, username, password_hash, full_name, email, role, employee_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [m.userId, m.username, passwordHash, m.name, m.email, m.role, m.empId]);
        } catch (e: any) {
            logError(`User ${m.username}`, e);
        }

        // 4. Leave Balances
        const leaveTypes = ['Annual', 'Casual', 'Medical'];
        for (const typeName of leaveTypes) {
            // Ensure Type Exists
            let typeId: string;
            const [existing] = await query("SELECT id FROM leave_types WHERE name = ?", [typeName]) as any[];
            if (!existing) {
                typeId = crypto.randomUUID();
                await query("INSERT IGNORE INTO leave_types (id, name, code) VALUES (?, ?, ?)", [typeId, typeName, typeName.substring(0, 3).toUpperCase()]);
            } else { typeId = existing.id; }

            // Ensure Balance Exists
            await query(`INSERT IGNORE INTO leave_balances (id, employee_id, leave_type_id, year, entitled_days, taken_days) VALUES (UUID(), ?, ?, 2025, 14, 0)`, [m.empId, typeId]);
        }
    }

    // 5. Leave Request for Kamal
    try {
        const [casualLeave] = await query("SELECT id FROM leave_types WHERE name = 'Casual'") as any[];
        await query(`INSERT IGNORE INTO leave_requests (id, employee_id, leave_type_id, start_date, end_date, days_requested, reason, status, created_at) VALUES (UUID(), ?, ?, '2025-02-10', '2025-02-12', 3, 'Personal Trip for Seeding', 'pending', NOW())`, [mocks[1].empId, casualLeave.id]);
        console.log("✅ Created mock pending request");
    } catch (e) { }

    await pool.end();
    console.log('\n✨ All seeds completed successfully.');
    console.log('Credentials:');
    mocks.forEach(m => console.log(`   ${m.username} / password123 (${m.designation})`));
}

seedFinal().catch(console.error);

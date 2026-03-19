
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function seedMocks() {
    const { query, pool } = await import('../lib/db');
    const bcrypt = await import('bcryptjs');

    console.log('🌱 Seeding HR Mock Data...');

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
        // 1. Create Employee
        try {
            await query(`
                INSERT INTO employees (
                    id, 
                    employee_number, 
                    full_name, 
                    department, 
                    designation, 
                    role, 
                    status, 
                    joined_date, 
                    email, 
                    phone_mobile, 
                    address_line1
                )
                VALUES (?, ?, ?, ?, ?, ?, 'active', '2023-01-15', ?, '0771234567', '123 Mock Street')
            `, [m.empId, m.empNo, m.name, m.dept, m.designation, m.role, m.email]);
            console.log(`✅ Employee: ${m.name}`);
        } catch (e: any) {
            // 1062 = Duplicate entry
            if (e.errno === 1062) {
                console.log(`⏭️  Employee exists: ${m.name}`);
            } else {
                console.log(`⚠️  Employee failed: ${m.name}`);
                console.error(e); // Object log
            }
        }

        // 2. Create User
        try {
            await query(`
                INSERT INTO users (id, username, password_hash, full_name, email, role, employee_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [m.userId, m.username, passwordHash, m.name, m.email, m.role, m.empId]);
            console.log(`✅ User: ${m.username}`);
        } catch (e: any) {
            if (e.errno === 1062) {
                console.log(`⏭️  User exists: ${m.username}`);
            } else {
                console.log(`⚠️  User failed: ${m.username}`);
                console.error(e);
            }
        }

        // 3. Seed Leave Balances
        const leaveTypes = ['Annual', 'Casual', 'Medical'];
        for (const typeName of leaveTypes) {
            let typeId: string;
            const [existing] = await query("SELECT id FROM leave_types WHERE name = ?", [typeName]) as any[];

            if (!existing) {
                typeId = crypto.randomUUID();
                await query("INSERT INTO leave_types (id, name, code, default_days) VALUES (?, ?, ?, 14)", [typeId, typeName, typeName.substring(0, 3).toUpperCase()]);
            } else {
                typeId = existing.id;
            }

            try {
                await query(`
                    INSERT INTO leave_balances (id, employee_id, leave_type_id, year, entitled_days, taken_days)
                    VALUES (UUID(), ?, ?, 2025, 14, 0)
               `, [m.empId, typeId]);
            } catch (e: any) {
                if (e.errno !== 1062) console.warn("Balance error", e.message);
            }
        }
    }

    // 4. Create a Pending Leave Request for Kamal
    try {
        const [casualLeave] = await query("SELECT id FROM leave_types WHERE name = 'Casual'") as any[];
        if (casualLeave) {
            await query(`
                INSERT INTO leave_requests (id, employee_id, leave_type_id, start_date, end_date, days_requested, reason, status, created_at)
                VALUES (UUID(), ?, ?, '2025-02-10', '2025-02-12', 3, 'Personal Trip', 'pending', NOW())
            `, [mocks[1].empId, casualLeave.id]);
        }
    } catch (e: any) {
        // Ignore duplicate or error for request
    }

    await pool.end();
    console.log('\n✅ MOCK DATA SEEDED SUCCESSFULLY.');
    console.log('Password for all users: password123');
}

seedMocks().catch(console.error);

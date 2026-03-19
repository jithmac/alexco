
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';

// Load Env
dotenv.config({ path: '.env.local' });

// Mock Data Sets
const USERS_TO_CREATE = [
    { username: 'admin', role: 'admin', name: 'System Admin' },
    { username: 'manager', role: 'manager', name: 'Saman Perera' },
    { username: 'cashier1', role: 'cashier', name: 'Nimali Silva' },
    { username: 'tech1', role: 'technician', name: 'Kamal Gunaratne' },
    { username: 'tech2', role: 'technician', name: 'Ruwan Dissanayake' },
    { username: 'hr_manager', role: 'hr_staff', name: 'Dilani Fernando' },
];

const PRODUCTS = [
    // Solar Panels
    { sku: 'SOL-PNL-450W', name: 'Jinko Solar Tiger Neo 450W', cat: 'Solar/Panels', price: 45000, desc: 'High efficiency N-type mono module.' },
    { sku: 'SOL-PNL-550W', name: 'Jinko Solar Tiger Pro 550W', cat: 'Solar/Panels', price: 52000, desc: 'Ultra-high power for large installations.' },
    { sku: 'SOL-PNL-CAN-550', name: 'Canadian Solar HiKu6 550W', cat: 'Solar/Panels', price: 51000, desc: 'High power mono PERC module.' },
    { sku: 'SOL-PNL-JA-545', name: 'JA Solar DeepBlue 3.0 545W', cat: 'Solar/Panels', price: 50500, desc: 'High performance module with 11BB technology.' },

    // Inverters
    { sku: 'INV-HUA-5K', name: 'Huawei SUN2000-5KTL-L1', cat: 'Solar/Inverters', price: 285000, desc: 'Smart Energy Center, Single Phase.' },
    { sku: 'INV-HUA-10K', name: 'Huawei SUN2000-10KTL-M1', cat: 'Solar/Inverters', price: 420000, desc: 'High current hybrid inverter, Three Phase.' },
    { sku: 'INV-GROW-5K', name: 'Growatt 5000ES Hybrid', cat: 'Solar/Inverters', price: 230000, desc: 'Cost-effective off-grid/hybrid inverter.' },
    { sku: 'INV-SMA-5K', name: 'SMA Sunny Boy 5.0', cat: 'Solar/Inverters', price: 350000, desc: 'German engineered reliable solar inverter.' },

    // Batteries
    { sku: 'BAT-LFP-5K', name: 'Huawei LUNA2000-5-E0 (5kWh)', cat: 'Solar/Batteries', price: 650000, desc: 'Smart String Energy Storage System.' },
    { sku: 'BAT-LFP-10K', name: 'Huawei LUNA2000-10-E0 (10kWh)', cat: 'Solar/Batteries', price: 1200000, desc: '10kWh Smart Energy Storage System.' },
    { sku: 'BAT-PYLON-3K', name: 'Pylontech US3000C 3.5kWh', cat: 'Solar/Batteries', price: 420000, desc: 'Reliable LiFePO4 battery for hybrid systems.' },

    // Electrical
    { sku: 'CABLE-PV-4MM', name: 'PV Cable 4mm (Red)', cat: 'Electrical/Cables', price: 350, desc: 'UV resistant solar cable, per meter.' },
    { sku: 'CABLE-PV-4MM-B', name: 'PV Cable 4mm (Black)', cat: 'Electrical/Cables', price: 350, desc: 'UV resistant solar cable, per meter.' },
    { sku: 'CABLE-AC-6MM', name: 'ACL 6mm 2-Core Cable', cat: 'Electrical/Cables', price: 850, desc: 'Armored AC cable for main connections.' },
    { sku: 'MC4-CONN', name: 'MC4 Connector Pair', cat: 'Electrical/Accessories', price: 450, desc: 'IP67 Waterproof connectors.' },
    { sku: 'DC-BREAKER-20A', name: 'DC Breaker 20A 500V', cat: 'Electrical/Protection', price: 2500, desc: 'Circuit breaker for PV strings.' },
    { sku: 'SPD-DC-1000V', name: 'DC Surge Protector 1000V', cat: 'Electrical/Protection', price: 6500, desc: 'Lightning protection for solar arrays.' },

    // Smart Home
    { sku: 'SMART-SW-1G', name: 'Tuya Smart Switch 1-Gang', cat: 'Smart Home/Switches', price: 4500, desc: 'WiFi + Bluetooth, No Neutral required.' },
    { sku: 'SMART-SW-2G', name: 'Tuya Smart Switch 2-Gang', cat: 'Smart Home/Switches', price: 5500, desc: 'WiFi + Bluetooth, 2-Gang touch switch.' },
    { sku: 'SMART-SW-3G', name: 'Tuya Smart Switch 3-Gang', cat: 'Smart Home/Switches', price: 6500, desc: 'WiFi + Bluetooth, 3-Gang touch switch.' },
    { sku: 'SMART-PLUG-13A', name: 'Tuya Smart Plug 13A', cat: 'Smart Home/Plugs', price: 3200, desc: 'Energy monitoring smart plug.' },
    { sku: 'SMART-BULB-RGB', name: 'Smart WiFi LED Bulb RGB', cat: 'Smart Home/Lighting', price: 2800, desc: 'Color changing smart bulb E27.' },
    { sku: 'SMART-CAM-OUT', name: 'Outdoor WiFi Camera 1080p', cat: 'Smart Home/Security', price: 12500, desc: 'Weatherproof security camera with night vision.' },

    // Services
    { sku: 'SVC-INSTALL-5KW', name: 'Solar Installation (5kW)', cat: 'Services/Labor', price: 75000, desc: 'Complete installation and commissioning.' },
    { sku: 'SVC-SERVICE-GEN', name: 'General Service Visit', cat: 'Services/Labor', price: 5000, desc: 'Inspection and cleaning.' },
];

const CUSTOMERS = [
    { name: 'Walk-in Customer', phone: '0000000000' },
    { name: 'Hotel Galadari', phone: '0112345678' },
    { name: 'Mr. Perera (Res)', phone: '0771234567' },
    { name: 'ABC Industries', phone: '0112987654' },
];

async function seed() {
    console.log('🚀 Starting Comprehensive Seed...');

    // Dynamic import to ensure env is loaded
    const { pool, query } = await import('../lib/db');
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // ---------------------------------------------------------
        // 1. LOCATIONS
        // ---------------------------------------------------------
        console.log('📍 Seeding Locations...');
        let mainStoreId, warehouseId;

        const [locs] = await connection.query("SELECT id, name FROM locations");
        const locMap = new Map((locs as any[]).map(l => [l.name, l.id]));

        if (!locMap.has('Main Store')) {
            mainStoreId = uuidv4();
            await connection.query("INSERT INTO locations VALUES (?, 'Main Store', 'Store')", [mainStoreId]);
        } else mainStoreId = locMap.get('Main Store');

        if (!locMap.has('Central Warehouse')) {
            warehouseId = uuidv4();
            await connection.query("INSERT INTO locations VALUES (?, 'Central Warehouse', 'Warehouse')", [warehouseId]);
        } else warehouseId = locMap.get('Central Warehouse');


        // ---------------------------------------------------------
        // 2. USERS & EMPLOYEES & HR
        // ---------------------------------------------------------
        console.log('👥 Seeding Users & Employees...');
        const passwordHash = await bcrypt.hash('password123', 10);
        const employeeIds: string[] = [];

        for (const u of USERS_TO_CREATE) {
            let userId;
            const [uRows] = await connection.query("SELECT id FROM users WHERE username = ?", [u.username]);

            if ((uRows as any[]).length === 0) {
                userId = uuidv4();
                await connection.query(
                    `INSERT INTO users (id, username, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)`,
                    [userId, u.username, passwordHash, u.name, u.role]
                );
            } else {
                userId = (uRows as any[])[0].id;
            }

            // Create linked Employee Record if not exists
            const [eRows] = await connection.query("SELECT id FROM employees WHERE user_id = ?", [userId]);
            let empId;

            if ((eRows as any[]).length === 0) {
                empId = uuidv4();
                employeeIds.push(empId);
                const empNum = `EMP-${Math.floor(Math.random() * 1000)}`;
                const nic = `${Math.floor(Math.random() * 1000000000)}V`;

                await connection.query(
                    `INSERT INTO employees (
                        id, employee_number, full_name, nic_number, email, 
                        department, role, user_id, basic_salary, joined_date, is_active
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
                    [
                        empId, empNum, u.name, nic, `${u.username}@alexco.lk`,
                        u.role === 'technician' ? 'solar' : u.role === 'cashier' ? 'retail' : 'admin',
                        u.role, userId, 65000 + Math.random() * 50000, '2023-01-15'
                    ]
                );

                // Add Leave Balances for 2025
                await connection.query(`
                    INSERT INTO leave_balances (id, employee_id, leave_type_id, year, entitled_days)
                    SELECT UUID(), ?, id, 2025, default_days_per_year FROM leave_types
                `, [empId]);

            } else {
                empId = (eRows as any[])[0].id;
                employeeIds.push(empId);
            }
        }


        // ---------------------------------------------------------
        // 3. PRODUCTS & INVENTORY
        // ---------------------------------------------------------
        console.log('📦 Seeding Products & Inventory...');
        const productIds: string[] = [];

        for (const p of PRODUCTS) {
            let pId;
            const [pRows] = await connection.query("SELECT id FROM products WHERE sku = ?", [p.sku]);

            if ((pRows as any[]).length === 0) {
                pId = uuidv4();
                console.log(`   + Inserting ${p.sku}...`);
                await connection.query(
                    `INSERT INTO products (id, sku, name, category_path, price_retail, tax_code, description, specifications)
                     VALUES (?, ?, ?, ?, ?, 'VAT_18', ?, ?)`,
                    [pId, p.sku, p.name, p.cat, p.price, p.desc, JSON.stringify({})]
                );

                // Initial Stock
                await connection.query(
                    `INSERT INTO inventory_ledger (transaction_id, product_id, location_id, delta, reason_code)
                     VALUES (UUID(), ?, ?, ?, 'INITIAL_STOCK')`,
                    [pId, mainStoreId, Math.floor(Math.random() * 100) + 10]
                );
            } else {
                pId = (pRows as any[])[0].id;
                console.log(`   . Skipping ${p.sku} (Exists)`);
            }
            productIds.push(pId);
        }


        // ---------------------------------------------------------
        // 4. SALES DATA (Past 30 Days)
        // ---------------------------------------------------------
        console.log('💰 Seeding Sales History...');
        const TODAY = new Date();

        for (let i = 0; i < 30; i++) {
            // Random number of orders per day (0-5)
            const numOrders = Math.floor(Math.random() * 5);

            for (let j = 0; j < numOrders; j++) {
                const orderId = uuidv4();
                const uId = uuidv4(); // Customer ID (optional/mock)
                const date = new Date(TODAY);
                date.setDate(date.getDate() - i); // Go back i days

                // Random items in order
                const numItems = Math.floor(Math.random() * 3) + 1;
                let total = 0;

                // Create Order Shell
                await connection.query(
                    `INSERT INTO sales_orders (id, order_number, total_amount, status, payment_method, location_id, created_at)
                     VALUES (?, ?, 0, 'COMPLETED', ?, ?, ?)`,
                    [orderId, `ORD-${date.getTime()}-${j}`, ['CASH', 'CARD', 'ONLINE'][Math.floor(Math.random() * 3)], mainStoreId, date]
                );

                for (let k = 0; k < numItems; k++) {
                    const pIndex = Math.floor(Math.random() * productIds.length);
                    const [prod] = await connection.query("SELECT price_retail FROM products WHERE id = ?", [productIds[pIndex]]) as any[];
                    const qty = Math.floor(Math.random() * 5) + 1;
                    const linesum = Number(prod[0].price_retail) * qty;
                    total += linesum;

                    await connection.query(
                        `INSERT INTO sales_items (id, order_id, product_id, quantity, unit_price, line_total)
                         VALUES (UUID(), ?, ?, ?, ?, ?)`,
                        [orderId, productIds[pIndex], qty, prod[0].price_retail, linesum]
                    );

                    // Reduce Stock
                    await connection.query(
                        `INSERT INTO inventory_ledger (transaction_id, product_id, location_id, delta, reason_code, reference_doc, created_at)
                         VALUES (UUID(), ?, ?, ?, 'SALE_POS', ?, ?)`,
                        [productIds[pIndex], mainStoreId, -qty, orderId, date]
                    );
                }

                // Update Total
                await connection.query("UPDATE sales_orders SET total_amount = ? WHERE id = ?", [total, orderId]);
            }
        }


        // ---------------------------------------------------------
        // 5. TICKETS
        // ---------------------------------------------------------
        console.log('🎫 Seeding Service Tickets...');
        const STATUSES = ['INTAKE', 'DIAGNOSIS', 'PENDING_PARTS', 'READY', 'CLOSED'];

        for (let i = 0; i < 15; i++) {
            const ticketId = uuidv4();
            const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
            const date = new Date(TODAY);
            date.setDate(date.getDate() - Math.floor(Math.random() * 20));

            // Assign to a random technician (if available) - Assuming technician user ID logic or just picking one
            // We'll skip specific tech assignment logic for brevity unless we query them, 
            // but we can leave it null or assign if we fetched techs earlier.

            await connection.query(
                `INSERT INTO tickets (id, ticket_number, customer_name, customer_phone, device_model, issue_description, status, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    ticketId, `JOB-2026-${1000 + i}`,
                    CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)].name,
                    '0777123456',
                    'Solar Inverter 5kW',
                    'Not powering on, red light blinking.',
                    status,
                    date
                ]
            );
        }

        // ---------------------------------------------------------
        // 6. ATTENDANCE & LEAVES
        // ---------------------------------------------------------
        console.log('📅 Seeding HR Data...');
        // Attendance for last 7 days for all employees
        for (const empId of employeeIds) {
            for (let i = 0; i < 7; i++) {
                const date = new Date(TODAY);
                date.setDate(date.getDate() - i);
                const day = date.getDay();

                if (day === 0) continue; // Skip Sunday

                // Random Clock In/Out
                const inTime = new Date(date);
                inTime.setHours(8, Math.floor(Math.random() * 30), 0);

                const outTime = new Date(date);
                outTime.setHours(17, Math.floor(Math.random() * 30), 0);

                await connection.query(
                    `INSERT IGNORE INTO attendance_logs (id, employee_id, date, check_in, check_out, check_in_source)
                     VALUES (UUID(), ?, ?, ?, ?, 'fingerprint')`,
                    [empId, date, inTime, outTime]
                );
            }
        }

        await connection.commit();
        console.log('✅ Comprehensive Seeding Complete!');

    } catch (e) {
        await connection.rollback();
        console.error('❌ Seeding Failed:', e);
        throw e;
    } finally {
        connection.end(); // close pool
        process.exit(0);
    }
}

seed();

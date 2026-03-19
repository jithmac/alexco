"use server";

import { query } from "@/lib/db";
import { getCurrentUser, requirePermission } from "@/lib/auth";

// Get all employees with search/filter
export async function getEmployees(search?: string, department?: string, status?: string) {
    try {
        await requirePermission('hr.view');
    } catch (e) {
        return [];
    }
    let sql = `
        SELECT id, employee_number, full_name, nic_number, department, designation, role,
               phone_mobile, email, joined_date, is_active, basic_salary
        FROM employees
        WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
        sql += ` AND (full_name LIKE ? OR nic_number LIKE ? OR employee_number LIKE ?)`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
    }

    if (department && department !== 'all') {
        sql += ` AND department = ?`;
        params.push(department);
    }

    if (status === 'active') {
        sql += ` AND is_active = TRUE`;
    } else if (status === 'inactive') {
        sql += ` AND is_active = FALSE`;
    }

    sql += ` ORDER BY full_name`;

    const rows = await query(sql, params);
    return rows as any[];
}

// Get single employee with full details
export async function getEmployee(id: string) {
    const rows = await query(`SELECT * FROM employees WHERE id = ?`, [id]) as any[];
    return rows[0] || null;
}

// Create new employee
export async function createEmployee(data: any) {
    let currentUser;
    try {
        currentUser = await requirePermission('hr.manage');
    } catch (e) {
        return { error: 'Unauthorized' };
    }

    const id = crypto.randomUUID();

    // Generate employee number
    const countResult = await query(`SELECT COUNT(*) as count FROM employees`) as any[];
    const count = countResult[0].count + 1;
    const employeeNumber = `EMP-${String(count).padStart(4, '0')}`;

    try {
        await query(`
            INSERT INTO employees (
                id, employee_number, full_name, name_with_initials, nic_number,
                date_of_birth, gender, marital_status,
                address_line1, address_line2, city, district, postal_code,
                phone_mobile, phone_home, email,
                emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
                department, designation, role, employment_type, joined_date,
                basic_salary, fixed_allowances,
                bank_name, bank_branch, bank_account_number, bank_account_name,
                epf_number, etf_number,
                epf_employee_rate, epf_employer_rate, etf_employer_rate
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id, employeeNumber, data.full_name || null, data.name_with_initials || null, data.nic_number || null,
            data.date_of_birth || null, data.gender || null, data.marital_status || null,
            data.address_line1 || null, data.address_line2 || null, data.city || null, data.district || null, data.postal_code || null,
            data.phone_mobile || null, data.phone_home || null, data.email || null,
            data.emergency_contact_name || null, data.emergency_contact_phone || null, data.emergency_contact_relation || null,
            data.department || null, data.designation || null, data.role || 'staff', data.employment_type || 'permanent', data.joined_date || null,
            data.basic_salary || 0, data.fixed_allowances || 0,
            data.bank_name || null, data.bank_branch || null, data.bank_account_number || null, data.bank_account_name || null,
            data.epf_number || null, data.etf_number || null,
            data.epf_employee_rate || 0.08, data.epf_employer_rate || 0.12, data.etf_employer_rate || 0.03
        ]);
    } catch (err: any) {
        if (err?.message?.includes('Duplicate entry') && err?.message?.includes('nic_number')) {
            return { error: 'An employee with this NIC number already exists.' };
        }
        if (err?.message?.includes('Duplicate entry')) {
            return { error: 'A duplicate record was found. Please check the details and try again.' };
        }
        return { error: 'Failed to create employee. Please try again.' };
    }

    return { success: true, id, employeeNumber };
}

// Update employee
export async function updateEmployee(id: string, data: any) {
    try {
        await requirePermission('hr.manage');
    } catch (e) {
        return { error: 'Unauthorized' };
    }

    const fields: string[] = [];
    const values: any[] = [];

    const allowedFields = [
        'full_name', 'name_with_initials', 'nic_number', 'date_of_birth', 'gender', 'marital_status',
        'address_line1', 'address_line2', 'city', 'district', 'postal_code',
        'phone_mobile', 'phone_home', 'email',
        'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relation',
        'department', 'designation', 'role', 'employment_type', 'joined_date', 'confirmation_date', 'resignation_date',
        'basic_salary', 'fixed_allowances',
        'bank_name', 'bank_branch', 'bank_account_number', 'bank_account_name',
        'epf_number', 'etf_number', 'is_active',
        'epf_employee_rate', 'epf_employer_rate', 'etf_employer_rate'
    ];

    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            fields.push(`${field} = ? `);
            values.push(data[field] === '' ? null : data[field]);
        }
    }

    if (fields.length === 0) return { error: 'No fields to update' };

    values.push(id);
    await query(`UPDATE employees SET ${fields.join(', ')} WHERE id = ? `, values);

    // Sync role to linked user if role was updated
    if (data.role) {
        // Get linked user_id from employee
        const employees = await query(`SELECT user_id FROM employees WHERE id = ?`, [id]) as any[];
        const employee = employees[0];

        if (employee?.user_id) {
            // Get role_id from roles table by slug (case insensitive and trimmed)
            const roleSlug = data.role.toLowerCase().trim();
            const rolesData = await query(`SELECT id FROM roles WHERE slug = ?`, [roleSlug]) as any[];
            const roleObj = rolesData[0];

            if (roleObj) {
                // Update user's role_id and role slug
                await query(`UPDATE users SET role_id = ?, role = ? WHERE id = ?`, [roleObj.id, roleSlug, employee.user_id]);
            }
        }
    }

    return { success: true };
}

// Get employees who do not have a user account
export async function getEmployeesWithoutUsers() {
    const rows = await query(`
        SELECT id, full_name, employee_number, email, designation, role 
        FROM employees 
        WHERE user_id IS NULL 
        ORDER BY full_name
    `) as any[];
    return rows;
}

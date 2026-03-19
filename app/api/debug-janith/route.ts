import { NextResponse } from 'next/server';
import { checkJaniths } from '@/server-actions/debug/check-janiths';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const employees = await query(`SELECT id, full_name, email, job_title FROM employees WHERE full_name LIKE '%Janith%'`) as any[];
        const users = await query(`SELECT id, username, full_name, employee_id FROM users WHERE full_name LIKE '%Janith%'`) as any[];

        return NextResponse.json({
            employees,
            users
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

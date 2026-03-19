import { query } from '@/lib/db';

export async function checkJaniths() {
    const employees = await query(`SELECT id, full_name, email, job_title FROM employees WHERE full_name LIKE '%Janith%'`) as any[];
    console.log('--- Employees named Janith ---');
    console.table(employees);

    // Also check the current user to see who they are logged in as
    // We can't easily get the session user here without a request context, 
    // but the issue is about the target data.
}

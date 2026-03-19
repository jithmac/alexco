"use server";

// EPF/ETF and Bank Transfer Report Generation Logic
import { query } from "@/lib/db";

// C-Form Data Structure (Monthly EPF Return)
interface CFormRecord {
    epfNumber: string;
    nicNumber: string;
    memberStatus: string; // M/F
    initials: string;
    surname: string;
    totalEarnings: number;
    epfEmployee: number; // 8%
    epfEmployer: number; // 12%
    totalContribution: number; // 20%
}

// Generate C-Form Data
export async function generateCFormData(month: number, year: number) {
    // Determine the date range for payroll
    // Assuming payroll runs from 1st to end of month
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    const sql = `
        SELECT 
            e.epf_number, e.nic_number, e.gender, e.name_with_initials, e.full_name,
            pr.basic_earnings, pr.allowances, pr.epf_employee, pr.epf_employer
        FROM payroll_runs pr
        JOIN employees e ON pr.employee_id = e.id
        WHERE pr.period_start >= ? AND pr.period_end <= ?
        AND e.epf_number IS NOT NULL
        ORDER BY CAST(e.epf_number AS UNSIGNED)
    `;

    const records = await query(sql, [startDate, endDate]) as any[];

    // Format for C-Form
    const cFormData: CFormRecord[] = records.map(r => {
        // Parse name for Initials and Surname
        // Assuming name_with_initials is like "A.B. Perera"
        // If not available, fallback to full_name logic
        let initials = '';
        let surname = '';

        if (r.name_with_initials) {
            const parts = r.name_with_initials.split(' ');
            surname = parts.pop() || '';
            initials = parts.join(' ');
        } else {
            const parts = r.full_name.split(' ');
            surname = parts.pop() || '';
            initials = parts.map((p: string) => p[0]).join('.');
        }

        return {
            epfNumber: r.epf_number,
            nicNumber: r.nic_number || '',
            memberStatus: r.gender === 'female' ? 'F' : 'M',
            initials: initials.replace(/\./g, '').substring(0, 15), // Limited length in C-Form usually
            surname: surname.substring(0, 20),
            totalEarnings: Number(r.basic_earnings) + Number(r.allowances), // Total Earnings for EPF
            epfEmployee: Number(r.epf_employee),
            epfEmployer: Number(r.epf_employer),
            totalContribution: Number(r.epf_employee) + Number(r.epf_employer)
        };
    });

    return cFormData;
}

// Generate Text File Content for C-Form (Standard Example Format)
// Real format depends on strict CBSL specs (fixed width or CSV)
// Implementing a standard CSV format here which is commonly accepted for upload
export async function generateCFormText(month: number, year: number) {
    const data = await generateCFormData(month, year);

    // Header
    const header = `C-FORM,${year},${month}`;

    // Body
    const lines = data.map(r =>
        `${r.epfNumber},${r.nicNumber},${r.surname},${r.initials},${r.totalEarnings.toFixed(2)},${r.epfEmployee.toFixed(2)},${r.epfEmployer.toFixed(2)},${r.totalContribution.toFixed(2)}`
    );

    return [header, ...lines].join('\n');
}

// Generate Bank Transfer Text File (Common SLIPS format logic)
// Format: AccountNo, Amount, Name, BankCode, BranchCode
export async function generateBankTransferFile(month: number, year: number, bankType: 'BOC' | 'SAMPATH' | 'COMMERCIAL') {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    const sql = `
        SELECT 
            e.bank_account_number, e.bank_account_name, e.bank_name,
            pr.net_salary
        FROM payroll_runs pr
        JOIN employees e ON pr.employee_id = e.id
        WHERE pr.period_start >= ? AND pr.period_end <= ?
        AND e.bank_account_number IS NOT NULL
        AND pr.net_salary > 0
    `;

    const records = await query(sql, [startDate, endDate]) as any[];

    // Format Logic (Simplified for demonstration - real banks have strict fixed-width specs)
    let content = '';

    if (bankType === 'BOC' || bankType === 'COMMERCIAL') {
        // CSV-like for bulk upload
        content = records.map(r =>
            `${r.bank_account_number},${Number(r.net_salary).toFixed(2)},${r.bank_account_name.substring(0, 20)}`
        ).join('\n');
    } else if (bankType === 'SAMPATH') {
        // Sampath Vishwa text format often uses specific delimiters
        content = records.map(r =>
            `${r.bank_account_number}|${Number(r.net_salary).toFixed(2)}|${r.bank_account_name}`
        ).join('\n');
    }

    return content;
}

// Get Payroll Summary for Reports
export async function getPayrollSummary(month: number, year: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    const [totals] = await query(`
        SELECT 
            SUM(basic_earnings) as total_basic,
            SUM(allowances) as total_allowances,
            SUM(ot_pay) as total_ot,
            SUM(epf_employee) as total_epf_emp,
            SUM(epf_employer) as total_epf_employer,
            SUM(etf_employer) as total_etf,
            SUM(apit_tax) as total_tax,
            SUM(net_salary) as total_net,
            COUNT(*) as employee_count
        FROM payroll_runs
        WHERE period_start >= ? AND period_end <= ?
    `, [startDate, endDate]) as any[];

    return totals;
}

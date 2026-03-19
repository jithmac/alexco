"use server";

// EPF/ETF and Bank Transfer Report Generation Logic
import { query } from "@/lib/db";
import { requirePermission } from "@/lib/auth";

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
    try {
        await requirePermission('payroll.manage');
    } catch (e) {
        throw new Error("Unauthorized: Missing payroll.manage permission");
    }

    // Determine the date range for payroll
    // Assuming payroll runs from 1st to end of month
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
    // ... (rest of the function as before)
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
    // Permission check is handled in generateCFormData
    return await (async () => {
        const data = await generateCFormData(month, year);

        // Header
        const header = `C-FORM,${year},${month}`;

        // Body
        const lines = data.map(r =>
            `${r.epfNumber},${r.nicNumber},${r.surname},${r.initials},${r.totalEarnings.toFixed(2)},${r.epfEmployee.toFixed(2)},${r.epfEmployer.toFixed(2)},${r.totalContribution.toFixed(2)}`
        );

        return [header, ...lines].join('\n');
    })();
}

// Generate Bank Transfer Text File (Common SLIPS format logic)
// Format: AccountNo, Amount, Name, BankCode, BranchCode
export async function generateBankTransferFile(month: number, year: number, bankType: 'BOC' | 'SAMPATH' | 'COMMERCIAL') {
    try {
        await requirePermission('payroll.manage');
    } catch (e) {
        throw new Error("Unauthorized: Missing payroll.manage permission");
    }

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
    try {
        await requirePermission('payroll.view');
    } catch (e) {
        throw new Error("Unauthorized: Missing payroll.view permission");
    }

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    try {
        const [totals] = await query(`
            SELECT 
                COALESCE(SUM(basic_earnings), 0) as total_basic,
                COALESCE(SUM(allowances), 0) as total_allowances,
                COALESCE(SUM(ot_pay), 0) as total_ot,
                COALESCE(SUM(epf_employee), 0) as total_epf_emp,
                COALESCE(SUM(epf_employer), 0) as total_epf_employer,
                COALESCE(SUM(etf_employer), 0) as total_etf,
                COALESCE(SUM(apit_tax), 0) as total_tax,
                COALESCE(SUM(net_salary), 0) as total_net,
                COUNT(*) as employee_count
            FROM payroll_runs
            WHERE period_start >= ? AND period_end <= ?
        `, [startDate, endDate]) as any[];

        return totals || {
            total_basic: 0,
            total_allowances: 0,
            total_ot: 0,
            total_epf_emp: 0,
            total_epf_employer: 0,
            total_etf: 0,
            total_tax: 0,
            total_net: 0,
            employee_count: 0
        };
    } catch (error: any) {
        // Table might not exist or other DB error
        console.error("Payroll Summary Error:", error.message);
        return {
            total_basic: 0,
            total_allowances: 0,
            total_ot: 0,
            total_epf_emp: 0,
            total_epf_employer: 0,
            total_etf: 0,
            total_tax: 0,
            total_net: 0,
            employee_count: 0,
            error: "Payroll data not available. Run payroll first."
        };
    }
}

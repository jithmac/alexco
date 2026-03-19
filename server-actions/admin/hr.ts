"use server";

import { calculatePayroll } from "@/lib/hr/payrollEngine";
import { query } from "@/lib/db";
import { requirePermission } from "@/lib/auth";

export async function getEmployeesAndPayroll() {
    try {
        await requirePermission('payroll.view');
    } catch (e) {
        throw new Error("Unauthorized: Missing payroll.view permission");
    }

    try {
        let employees: any[] = [];
        try {
            // Try fetching with custom rate columns first
            employees = await query(`
                SELECT id, full_name as name, basic_salary as basic, fixed_allowances as allowances, designation as role,
                       epf_employee_rate, epf_employer_rate, etf_employer_rate
                FROM employees
                WHERE is_active = TRUE
                ORDER BY full_name
            `) as any[];
        } catch (e: any) {
            console.warn("Custom payroll columns or is_active missing, trying fallback...");
            try {
                // Fallback 1: basic columns with is_active
                employees = await query(`
                    SELECT id, full_name as name, basic_salary as basic, fixed_allowances as allowances, designation as role
                    FROM employees
                    WHERE is_active = TRUE
                    ORDER BY full_name
                `) as any[];
            } catch (e2: any) {
                console.warn("is_active column missing, showing all employees...");
                // Fallback 2: absolute basic (no is_active filter)
                employees = await query(`
                    SELECT id, full_name as name, basic_salary as basic, fixed_allowances as allowances, designation as role
                    FROM employees
                    ORDER BY full_name
                `) as any[];
            }
        }

        if (employees.length === 0) {
            return [];
        }

        // Calculate payroll for each employee
        return employees.map(emp => {
            const result = calculatePayroll({
                basicSalary: Number(emp.basic) || 0,
                fixedAllowances: Number(emp.allowances) || 0,
                otHours: 0,
                epfEmployeeRate: emp.epf_employee_rate ? Number(emp.epf_employee_rate) : undefined,
                epfEmployerRate: emp.epf_employer_rate ? Number(emp.epf_employer_rate) : undefined,
                etfEmployerRate: emp.etf_employer_rate ? Number(emp.etf_employer_rate) : undefined
            });
            return {
                id: emp.id,
                name: emp.name,
                basic: Number(emp.basic) || 0,
                allowances: Number(emp.allowances) || 0,
                role: emp.role,
                ...result
            };
        });
    } catch (error: any) {
        console.error("Get Employees And Payroll Final Error:", error.message);
        return [];
    }
}

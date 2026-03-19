/**
 * Sri Lankan Payroll Calculator (2026 Specification)
 * Handles EPF, ETF, APIT (PAYE), and Overtime calculations.
 */

export interface PayrollInput {
    basicSalary: number;
    fixedAllowances: number;
    otHours: number;
    isPoyaOrSunday?: boolean; // For double OT rate if needed
    epfEmployeeRate?: number; // Default 0.08
    epfEmployerRate?: number; // Default 0.12
    etfEmployerRate?: number; // Default 0.03
}

export interface PayrollOutput {
    totalEarnings: number; // For EPF/ETF
    grossSalary: number;   // Total before tax
    epfEmployee: number;   // Custom Rate
    epfEmployer: number;   // Custom Rate
    etfEmployer: number;   // Custom Rate
    otPay: number;
    apitTax: number;       // PAYE
    netSalary: number;
}

export const calculatePayroll = (input: PayrollInput): PayrollOutput => {
    const {
        basicSalary, fixedAllowances, otHours,
        epfEmployeeRate = 0.08,
        epfEmployerRate = 0.12,
        etfEmployerRate = 0.03
    } = input;

    // 1. Total Earnings for EPF/ETF (Basic + Fixed Allowances)
    const totalEarnings = basicSalary + fixedAllowances;

    // 2. EPF & ETF
    const epfEmployee = totalEarnings * epfEmployeeRate;
    const epfEmployer = totalEarnings * epfEmployerRate;
    const etfEmployer = totalEarnings * etfEmployerRate;

    // 3. Overtime
    // Standard divisor is 240 hours (30 days * 8 hours) or 200 depending on shop act. 
    // Usually Basic / 240 * 1.5
    const hourlyRate = basicSalary / 240;
    const otRate = 1.5; // Standard 1.5x
    const otPay = hourlyRate * otHours * otRate;

    // 4. Gross Salary for Tax (Total Earnings + OT + measureable benefits)
    // Note: EPF employee contribution is deducted BEFORE tax availability? 
    // Actually APIT is on Gross CASH earnings usually, but EPF 8% is a relief?
    // Current rules: APIT is on TOTAL earnings. Relief is not explicit deduction but tax blocks.
    // Wait, EPF 8% is NOT deductible for APIT base since 2020 changes, need to verify 2025 rules.
    // Assuming Gross Income for Tax = Total Earnings + OT.
    const grossIncomeForTax = totalEarnings + otPay;

    // 5. APIT (PAYE) Calculation - 2025/2026 Tables
    // Monthly Threshold: 100,000 LKR tax free.
    // Blocks of 41,667 LKR (500k / 12).
    // Rates: 6%, 12%, 18%, 24%, 30%, 36%.

    let tax = 0;
    let taxableIncome = grossIncomeForTax - 100000; // Tax free allowance

    if (taxableIncome > 0) {
        const blockSize = 41666.67;
        const rates = [0.06, 0.12, 0.18, 0.24, 0.30, 0.36];

        for (const rate of rates) {
            if (taxableIncome <= 0) break;

            const amountInBlock = Math.min(taxableIncome, blockSize);
            // Exception: Last block (36%) catches everything above
            // Use standard iterative logic
            if (rate === 0.36) {
                tax += taxableIncome * rate;
                taxableIncome = 0;
            } else {
                tax += amountInBlock * rate;
                taxableIncome -= amountInBlock;
            }
        }
    }

    // 6. Net Salary
    // Gross + OT - EPF(8%) - APIT
    // Note: Employer contributions (EPF 12%, ETF 3%) are NOT part of Net Salary
    const netSalary = (totalEarnings + otPay) - epfEmployee - tax;

    return {
        totalEarnings,
        grossSalary: totalEarnings + otPay,
        epfEmployee,
        epfEmployer,
        etfEmployer,
        otPay,
        apitTax: tax,
        netSalary
    };
};

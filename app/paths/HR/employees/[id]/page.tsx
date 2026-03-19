"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { getEmployee, updateEmployee } from "@/server-actions/hr/employees";
import { getEmployeeAssets, assignAsset } from "@/server-actions/hr/assets";
import { getDisciplinaryRecords, addDisciplinaryRecord } from "@/server-actions/hr/disciplinary";
import { getEmployeeDocuments, uploadEmployeeDocument } from "@/server-actions/hr/documents";
import { createEmployeeUserAccount, getEmployeeUser } from "@/server-actions/hr/user-access";
import { getEmployeeLeaveHistory } from "@/server-actions/hr/leave";
import { getRoles } from "@/server-actions/roles";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { EmployeeDetailsTab } from "@/components/hr/employees/EmployeeDetailsTab";
import { EmployeeAssetsTab } from "@/components/hr/employees/EmployeeAssetsTab";
import { EmployeeDisciplinaryTab } from "@/components/hr/employees/EmployeeDisciplinaryTab";
import { EmployeeDocumentsTab } from "@/components/hr/employees/EmployeeDocumentsTab";
import { EmployeeLeaveTab } from "@/components/hr/employees/EmployeeLeaveTab";
import { EmployeeAccessTab } from "@/components/hr/employees/EmployeeAccessTab";
import { EmployeePayrollTab } from "@/components/hr/employees/EmployeePayrollTab";
import { PayslipModal } from "@/components/hr/PayslipModal";
import { calculatePayroll } from "@/lib/hr/payrollEngine";

const TABS = ['details', 'payroll', 'documents', 'assets', 'disciplinary', 'leave', 'access'];

export default function EmployeeProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [employee, setEmployee] = useState<any>(null);
    const [assets, setAssets] = useState<any[]>([]);
    const [disciplinary, setDisciplinary] = useState<any[]>([]);
    const [documents, setDocuments] = useState<any[]>([]);
    const [userAccount, setUserAccount] = useState<any>(null);
    const [leaveHistory, setLeaveHistory] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('details');
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [selectedPayslipEmployee, setSelectedPayslipEmployee] = useState<any>(null);
    const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);

    async function loadData() {
        const emp = await getEmployee(id);
        setEmployee(emp);
        setFormData(emp || {});
        const assetData = await getEmployeeAssets(id);
        setAssets(assetData);
        const discData = await getDisciplinaryRecords(id);
        setDisciplinary(discData);
        const docData = await getEmployeeDocuments(id);
        setDocuments(docData);
        const userData = await getEmployeeUser(id);
        setUserAccount(userData);
        const leaveData = await getEmployeeLeaveHistory(id);
        setLeaveHistory(leaveData);
        const rolesData = await getRoles();
        setRoles(rolesData);
        setLoading(false);
    }

    useEffect(() => {
        loadData();
    }, [id]);

    function handleViewPayslip() {
        const result = calculatePayroll({
            basicSalary: Number(employee.basic_salary) || 0,
            fixedAllowances: Number(employee.fixed_allowances) || 0,
            otHours: 0,
            epfEmployeeRate: employee.epf_employee_rate ? Number(employee.epf_employee_rate) : 0.08,
            epfEmployerRate: employee.epf_employer_rate ? Number(employee.epf_employer_rate) : 0.12,
            etfEmployerRate: employee.etf_employer_rate ? Number(employee.etf_employer_rate) : 0.03
        });
        setSelectedPayslipEmployee({
            name: employee.full_name,
            role: employee.designation || employee.role,
            basic: Number(employee.basic_salary) || 0,
            allowances: Number(employee.fixed_allowances) || 0,
            ...result
        });
        setIsPayslipModalOpen(true);
    }

    async function handleSave() {
        await updateEmployee(id, formData);
        setEditing(false);
        loadData();
    }

    function handleChange(field: string, value: any) {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    }

    async function handleUpload(e: React.FormEvent) {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        formData.append('employee_id', id);
        await uploadEmployeeDocument(formData);
        form.reset();
        loadData();
    }

    async function handleAssignAsset(e: React.FormEvent) {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const data = Object.fromEntries(new FormData(form));
        await assignAsset(id, data);
        loadData();
    }

    async function handleAddDisciplinary(e: React.FormEvent) {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const data = Object.fromEntries(new FormData(form));
        await addDisciplinaryRecord(id, data);
        loadData();
    }

    async function handleCreateUser(e: React.FormEvent) {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const data = Object.fromEntries(new FormData(form));
        const res = await createEmployeeUserAccount(id, data);
        if (res.error) {
            alert(res.error);
        } else {
            loadData();
        }
    }

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!employee) return <div className="p-8 text-center">Employee not found</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/paths/HR/employees">
                        <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{employee.full_name}</h1>
                        <p className="text-slate-500">{employee.employee_number} • {employee.designation || employee.role}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {editing ? (
                        <>
                            <Button onClick={handleSave}><Save className="h-4 w-4 mr-2" /> Save Changes</Button>
                            <Button variant="outline" onClick={() => { setEditing(false); setFormData(employee); }}>Cancel</Button>
                        </>
                    ) : (
                        <Button onClick={() => setEditing(true)}>Edit Profile</Button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b">
                {TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'details' && (
                <EmployeeDetailsTab formData={formData} editing={editing} handleChange={handleChange} roles={roles} />
            )}

            {activeTab === 'payroll' && (
                <EmployeePayrollTab employee={employee} onViewPayslip={handleViewPayslip} />
            )}

            {activeTab === 'documents' && (
                <EmployeeDocumentsTab documents={documents} handleUpload={handleUpload} />
            )}

            {activeTab === 'assets' && (
                <EmployeeAssetsTab assets={assets} handleAssignAsset={handleAssignAsset} />
            )}

            {activeTab === 'disciplinary' && (
                <EmployeeDisciplinaryTab disciplinary={disciplinary} handleAddDisciplinary={handleAddDisciplinary} />
            )}

            {activeTab === 'leave' && (
                <EmployeeLeaveTab leaveHistory={leaveHistory} />
            )}

            {activeTab === 'access' && (
                <EmployeeAccessTab userAccount={userAccount} employee={employee} handleCreateUser={handleCreateUser} />
            )}

            <PayslipModal
                isOpen={isPayslipModalOpen}
                onClose={() => setIsPayslipModalOpen(false)}
                employee={selectedPayslipEmployee}
            />
        </div>
    );
}

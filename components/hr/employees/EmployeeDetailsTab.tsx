import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, FileText, Building, Wallet } from "lucide-react";
import { Field } from "@/components/hr/shared/Field";
import { formatDate } from "@/lib/utils";

interface EmployeeDetailsTabProps {
    formData: any;
    editing: boolean;
    handleChange: (field: string, value: any) => void;
    roles?: { id: string; name: string; slug: string }[];
}

export function EmployeeDetailsTab({ formData, editing, handleChange, roles = [] }: EmployeeDetailsTabProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Info */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2"><User className="h-5 w-5" /> Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Full Name" field="full_name" value={formData.full_name} onChange={handleChange} editing={editing} />
                        <Field label="Name with Initials" field="name_with_initials" value={formData.name_with_initials} onChange={handleChange} editing={editing} />
                        <Field label="NIC Number" field="nic_number" value={formData.nic_number} onChange={handleChange} editing={editing} />
                        <Field label="Date of Birth" field="date_of_birth" value={formatDate(formData.date_of_birth)} onChange={handleChange} editing={editing} type="date" />
                        <Field label="Gender" field="gender" value={formData.gender} onChange={handleChange} editing={editing} type="select" options={['male', 'female', 'other']} />
                        <Field label="Marital Status" field="marital_status" value={formData.marital_status} onChange={handleChange} editing={editing} type="select" options={['single', 'married', 'divorced', 'widowed']} />
                    </div>
                </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5" /> Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Field label="Mobile Phone" field="phone_mobile" value={formData.phone_mobile} onChange={handleChange} editing={editing} />
                    <Field label="Home Phone" field="phone_home" value={formData.phone_home} onChange={handleChange} editing={editing} />
                    <Field label="Email" field="email" value={formData.email} onChange={handleChange} editing={editing} type="email" />
                    <Field label="Address Line 1" field="address_line1" value={formData.address_line1} onChange={handleChange} editing={editing} />
                    <Field label="City" field="city" value={formData.city} onChange={handleChange} editing={editing} />
                    <Field label="District" field="district" value={formData.district} onChange={handleChange} editing={editing} />
                </CardContent>
            </Card>

            {/* Employment */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2"><Building className="h-5 w-5" /> Employment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Department" field="department" value={formData.department} onChange={handleChange} editing={editing} type="select" options={['retail', 'solar', 'repair', 'admin', 'hr', 'accounts']} />
                        <Field label="Designation" field="designation" value={formData.designation} onChange={handleChange} editing={editing} />
                        <Field label="System Role" field="role" value={formData.role} onChange={handleChange} editing={editing} type="select" options={roles.length > 0 ? roles.map(r => r.slug) : ['technician', 'cashier', 'hr_staff', 'manager', 'admin']} />
                        <Field label="Employment Type" field="employment_type" value={formData.employment_type} onChange={handleChange} editing={editing} type="select" options={['permanent', 'contract', 'probation', 'intern']} />
                        <Field label="Joined Date" field="joined_date" value={formatDate(formData.joined_date)} onChange={handleChange} editing={editing} type="date" />
                        <Field label="EPF Number" field="epf_number" value={formData.epf_number} onChange={handleChange} editing={editing} />
                        <Field label="ETF Number" field="etf_number" value={formData.etf_number} onChange={handleChange} editing={editing} />
                    </div>
                </CardContent>
            </Card>

            {/* Bank & Salary */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2"><Wallet className="h-5 w-5" /> Salary & Bank Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Basic Salary (LKR)" field="basic_salary" value={formData.basic_salary} onChange={handleChange} editing={editing} type="number" />
                        <Field label="Fixed Allowances" field="fixed_allowances" value={formData.fixed_allowances} onChange={handleChange} editing={editing} type="number" />
                        <Field label="EPF Employee Rate (0.08 = 8%)" field="epf_employee_rate" value={formData.epf_employee_rate} onChange={handleChange} editing={editing} type="number" />
                        <Field label="EPF Employer Rate (0.12 = 12%)" field="epf_employer_rate" value={formData.epf_employer_rate} onChange={handleChange} editing={editing} type="number" />
                        <Field label="ETF Employer Rate (0.03 = 3%)" field="etf_employer_rate" value={formData.etf_employer_rate} onChange={handleChange} editing={editing} type="number" />
                        <div className="hidden md:block" />
                        <Field label="Bank Name" field="bank_name" value={formData.bank_name} onChange={handleChange} editing={editing} />
                        <Field label="Branch" field="bank_branch" value={formData.bank_branch} onChange={handleChange} editing={editing} />
                        <Field label="Account Number" field="bank_account_number" value={formData.bank_account_number} onChange={handleChange} editing={editing} />
                        <Field label="Account Name" field="bank_account_name" value={formData.bank_account_name} onChange={handleChange} editing={editing} />
                    </div>
                </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card className="md:col-span-2">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Emergency Contact</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                        <Field label="Contact Name" field="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} editing={editing} />
                        <Field label="Phone" field="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={handleChange} editing={editing} />
                        <Field label="Relationship" field="emergency_contact_relation" value={formData.emergency_contact_relation} onChange={handleChange} editing={editing} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

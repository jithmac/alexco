"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEmployees, createEmployee } from "@/server-actions/hr/employees";
import { getRoles } from "@/server-actions/roles";
import { Plus, Search, Users, Building, UserCheck, UserX } from "lucide-react";

const DEPARTMENTS = ['retail', 'solar', 'repair', 'admin', 'hr', 'accounts'];

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [department, setDepartment] = useState('all');
    const [status, setStatus] = useState('active');
    const [showForm, setShowForm] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    async function loadData() {
        setLoading(true);
        const [empData, rolesData] = await Promise.all([
            getEmployees(search, department, status),
            getRoles()
        ]);
        setEmployees(empData);
        setRoles(rolesData);
        setLoading(false);
    }

    useEffect(() => {
        loadData();
    }, [search, department, status]);

    async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setFormError(null);
        const formData = new FormData(e.currentTarget);
        const data: any = {};
        formData.forEach((value, key) => { data[key] = value; });

        const result = await createEmployee(data);
        if (result.error) {
            setFormError(result.error);
        } else {
            setShowForm(false);
            loadData();
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Employees</h1>
                <Button onClick={() => setShowForm(!showForm)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Employee
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{employees.length}</div>
                            <div className="text-sm text-slate-500">Total Staff</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-green-100 p-3 rounded-full">
                            <UserCheck className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{employees.filter(e => e.is_active).length}</div>
                            <div className="text-sm text-slate-500">Active</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-amber-100 p-3 rounded-full">
                            <Building className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{employees.filter(e => e.department === 'solar').length}</div>
                            <div className="text-sm text-slate-500">Solar Team</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-purple-100 p-3 rounded-full">
                            <UserX className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{employees.filter(e => e.department === 'retail').length}</div>
                            <div className="text-sm text-slate-500">Retail Staff</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Add Employee Form */}
            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Add New Employee</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {formError && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">{formError}</div>
                        )}
                        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Full Name *</label>
                                <input name="full_name" required className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">NIC Number *</label>
                                <input name="nic_number" required className="w-full px-3 py-2 border rounded-lg" placeholder="123456789V" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Mobile Phone</label>
                                <input name="phone_mobile" className="w-full px-3 py-2 border rounded-lg" placeholder="+94 77 123 4567" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input name="email" type="email" className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Department *</label>
                                <select name="department" required className="w-full px-3 py-2 border rounded-lg">
                                    <option value="">Select</option>
                                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Role *</label>
                                <select name="role" required className="w-full px-3 py-2 border rounded-lg">
                                    <option value="">Select</option>
                                    {roles.map(r => <option key={r.id} value={r.slug}>{r.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Designation</label>
                                <input name="designation" className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. Senior Technician" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Joined Date</label>
                                <input name="joined_date" type="date" className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Basic Salary (LKR)</label>
                                <input name="basic_salary" type="number" className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                            <div className="md:col-span-3 flex gap-2">
                                <Button type="submit">Create Employee</Button>
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Filters */}
            <div className="flex gap-4 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name, NIC, or employee number..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg"
                    />
                </div>
                <select value={department} onChange={(e) => setDepartment(e.target.value)} className="px-4 py-2 border rounded-lg">
                    <option value="all">All Departments</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                </select>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-4 py-2 border rounded-lg">
                    <option value="all">All Status</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                </select>
            </div>

            {/* Employee Table */}
            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-8 text-center text-slate-400">Loading employees...</div>
                    ) : employees.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">No employees found. Add your first employee above.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Employee</th>
                                        <th className="px-4 py-3 text-left">Department</th>
                                        <th className="px-4 py-3 text-left">Role</th>
                                        <th className="px-4 py-3 text-left">Contact</th>
                                        <th className="px-4 py-3 text-left">Joined</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map((emp) => (
                                        <tr key={emp.id} className="border-b hover:bg-slate-50">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-900">{emp.full_name}</div>
                                                <div className="text-xs text-slate-400">{emp.employee_number} • {emp.nic_number}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs capitalize">
                                                    {emp.department || '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">{emp.designation || emp.role}</td>
                                            <td className="px-4 py-3">
                                                <div className="text-slate-600">{emp.phone_mobile || '-'}</div>
                                                <div className="text-xs text-slate-400">{emp.email || ''}</div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-500">
                                                {emp.joined_date ? new Date(emp.joined_date).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {emp.is_active ? (
                                                    <span className="text-green-600 text-xs">● Active</span>
                                                ) : (
                                                    <span className="text-red-500 text-xs">● Inactive</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Link href={`/paths/HR/employees/${emp.id}`}>
                                                    <Button variant="outline" size="sm">View Profile</Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRoles, deleteRole, UserRoleData } from "@/server-actions/roles";
import { Plus, Settings, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RolesPage() {
    const [roles, setRoles] = useState<UserRoleData[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    async function loadRoles() {
        setLoading(true);
        const data = await getRoles();
        setRoles(data);
        setLoading(false);
    }

    useEffect(() => {
        loadRoles();
    }, []);

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this role? This action cannot be undone.")) return;

        try {
            await deleteRole(id);
            loadRoles();
        } catch (e: any) {
            alert(e.message);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Role Management</h1>
                    <p className="text-slate-500 mt-1">Manage system roles and their permissions</p>
                </div>
                <Link href="/paths/admin/users/roles/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" /> Create Role
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Roles ({roles.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-slate-400">Loading roles...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Role Name</th>
                                        <th className="px-4 py-3 text-left">Slug</th>
                                        <th className="px-4 py-3 text-left">Description</th>
                                        <th className="px-4 py-3 text-left">Permissions</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roles.map((role) => (
                                        <tr key={role.id} className="border-b hover:bg-slate-50">
                                            <td className="px-4 py-3 font-medium text-slate-900">{role.name}</td>
                                            <td className="px-4 py-3 text-slate-500">
                                                <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">{role.slug}</code>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">{role.description}</td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                                                    {role.permissions.length} Permissions
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <Link href={`/paths/admin/users/roles/${role.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    {!role.is_system && (
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleDelete(role.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
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

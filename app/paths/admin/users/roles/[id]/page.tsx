"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRole, createRole, updateRole, getAllPermissions, UserRoleData } from "@/server-actions/roles";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { cn } from "@/lib/utils";

export default function EditRolePage() {
    const params = useParams(); // params.id could be 'new' or UUID
    const router = useRouter();
    const isNew = params.id === 'new';

    const [role, setRole] = useState<Partial<UserRoleData>>({
        name: '',
        description: '',
        permissions: []
    });
    const [allPermissions, setAllPermissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const perms = await getAllPermissions();
            setAllPermissions(perms);

            if (!isNew && params.id) {
                const roleData = await getRole(params.id as string);
                if (roleData) {
                    setRole(roleData);
                }
            }
            setLoading(false);
        }
        loadData();
    }, [isNew, params.id]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);

        try {
            if (isNew) {
                await createRole(role as any);
            } else {
                await updateRole(params.id as string, role as any);
            }
            router.push('/paths/admin/users/roles');
            router.refresh();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setSaving(false);
        }
    }

    const togglePermission = (code: string) => {
        const current = role.permissions || [];
        if (current.includes(code)) {
            setRole({ ...role, permissions: current.filter(p => p !== code) });
        } else {
            setRole({ ...role, permissions: [...current, code] });
        }
    };

    // Group permissions by 'group_name'
    const groupedPermissions = allPermissions.reduce((acc, perm) => {
        if (!acc[perm.group_name]) acc[perm.group_name] = [];
        acc[perm.group_name].push(perm);
        return acc;
    }, {} as Record<string, any[]>);

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/paths/admin/users/roles">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-slate-900">
                    {isNew ? 'Create New Role' : `Edit Role: ${role.name}`}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Role Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Role Name *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border rounded-lg"
                                    value={role.name}
                                    onChange={(e) => setRole({ ...role, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-lg"
                                    value={role.description || ''}
                                    onChange={(e) => setRole({ ...role, description: e.target.value })}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Permissions</CardTitle>
                        <p className="text-sm text-slate-500">Select the privileges allowed for this role.</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {(Object.entries(groupedPermissions) as [string, any[]][]).map(([group, perms]) => (
                                <div key={group}>
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 pb-1 border-b">
                                        {group}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {perms.map(p => {
                                            const isSelected = role.permissions?.includes(p.code);
                                            return (
                                                <div
                                                    key={p.code}
                                                    onClick={() => togglePermission(p.code)}
                                                    className={cn(
                                                        "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                                                        isSelected ? "bg-blue-50 border-blue-200" : "bg-white hover:bg-slate-50 border-slate-200"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-4 h-4 rounded mt-0.5 border flex items-center justify-center flex-shrink-0 transition-colors",
                                                        isSelected ? "bg-blue-600 border-blue-600" : "border-slate-300"
                                                    )}>
                                                        {isSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-slate-900">{p.code}</div>
                                                        <div className="text-xs text-slate-500">{p.description}</div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-3 sticky bottom-6 bg-white/80 p-4 border rounded-lg shadow-lg backdrop-blur-sm">
                    <Link href="/paths/admin/users/roles">
                        <Button type="button" variant="outline">Cancel</Button>
                    </Link>
                    <Button type="submit" disabled={saving}>
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Role'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

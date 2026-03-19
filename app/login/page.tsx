"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/server-actions/auth/session";

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const result = await login(formData);
        console.log('Login result:', result);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else if (result.success) {
            // Permission-based redirection
            const permissions = result.permissions || [];
            let targetPath = '/';

            // Redirect to the first accessible page based on permissions
            if (permissions.includes('pos.access')) {
                targetPath = '/paths/POS';
            } else if (permissions.includes('tickets.manage')) {
                targetPath = '/paths/Ticket';
            } else if (permissions.includes('hr.view')) {
                targetPath = '/paths/HR';
            } else if (permissions.includes('inventory.view')) {
                targetPath = '/paths/admin/inventory';
            } else if (permissions.includes('admin.view')) {
                targetPath = '/paths/admin';
            }

            console.log('Login successful. Redirecting to:', targetPath);

            // Use window.location.href to force a full page reload.
            // This ensures cookies are properly sent to the server and middleware 
            // recognizes the new session immediately.
            window.location.href = targetPath;
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white">
                        Alex<span className="text-blue-500">co</span>
                    </h1>
                    <p className="text-slate-400 mt-2">Business Management System</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Sign In</h2>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                name="username"
                                required
                                autoComplete="username"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Enter your username"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                required
                                autoComplete="current-password"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Enter your password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-slate-500 text-sm mt-6">
                    © 2026 Alexco Technologies. All rights reserved.
                </p>
            </div>
        </div>
    );
}

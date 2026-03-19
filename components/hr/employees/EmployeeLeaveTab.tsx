import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface EmployeeLeaveTabProps {
    leaveHistory: any[];
}

export function EmployeeLeaveTab({ leaveHistory }: EmployeeLeaveTabProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Leave History</CardTitle>
            </CardHeader>
            <CardContent>
                {leaveHistory.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">No leave history found</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-2 text-left">Type</th>
                                <th className="px-4 py-2 text-left">Period</th>
                                <th className="px-4 py-2 text-left">Days</th>
                                <th className="px-4 py-2 text-left">Reason</th>
                                <th className="px-4 py-2 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaveHistory.map(l => (
                                <tr key={l.id} className="border-b">
                                    <td className="px-4 py-2 font-medium">{l.leave_type_name}</td>
                                    <td className="px-4 py-2 text-slate-500">
                                        {formatDate(l.start_date)} - {formatDate(l.end_date)}
                                    </td>
                                    <td className="px-4 py-2">{l.days_requested}</td>
                                    <td className="px-4 py-2 text-slate-500 truncate max-w-[200px]">{l.reason}</td>
                                    <td className="px-4 py-2">
                                        <span className={`px-2 py-1 rounded text-xs ${l.status === 'approved' ? 'bg-green-100 text-green-700' :
                                            l.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                            {l.status.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                <div className="mt-4 pt-4 border-t text-center">
                    <Link href="/paths/HR/leave">
                        <Button variant="outline" className="w-full sm:w-auto">Go to Leave Management Dashboard</Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}

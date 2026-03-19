import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface AllLeaveRecordsTableProps {
    requests: any[];
}

export function AllLeaveRecordsTable({ requests }: AllLeaveRecordsTableProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>All Leave Records</CardTitle>
                <CardDescription>Comprehensive history of all leave requests.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Employee</th>
                                <th className="px-4 py-3 text-left font-medium">Type</th>
                                <th className="px-4 py-3 text-left font-medium">Dates</th>
                                <th className="px-4 py-3 text-left font-medium">Days</th>
                                <th className="px-4 py-3 text-left font-medium">Reason</th>
                                <th className="px-4 py-3 text-left font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(req => (
                                <tr key={req.id} className="border-t hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium">{req.employee_name}</td>
                                    <td className="px-4 py-3">{req.leave_type}</td>
                                    <td className="px-4 py-3 text-slate-500">
                                        {new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">{req.days_requested}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${req.status === 'approved' ? 'bg-green-100 text-green-700' :
                                            req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                            {req.status.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {requests.length === 0 && <p className="text-center py-8 text-muted-foreground">No records found.</p>}
                </div>
            </CardContent>
        </Card>
    );
}

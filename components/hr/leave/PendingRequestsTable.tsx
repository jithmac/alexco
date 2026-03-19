import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface PendingRequestsTableProps {
    requests: any[];
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
}

export function PendingRequestsTable({ requests, onApprove, onReject }: PendingRequestsTableProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Pending Requests</CardTitle>
                <CardDescription>Review and approve employee leave.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {requests.map(req => (
                        <div key={req.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <div className="font-semibold">{req.employee_name}</div>
                                <div className="text-sm text-slate-500">
                                    {req.leave_type} • {new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()} ({req.days_requested} days)
                                </div>
                                <div className="text-sm mt-1">"{req.reason}"</div>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => onReject(req.id)}>
                                    <X className="w-4 h-4 mr-1" /> Reject
                                </Button>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => onApprove(req.id)}>
                                    <Check className="w-4 h-4 mr-1" /> Approve
                                </Button>
                            </div>
                        </div>
                    ))}
                    {requests.length === 0 && <p className="text-center py-8 text-muted-foreground">No pending requests.</p>}
                </div>
            </CardContent>
        </Card>
    );
}

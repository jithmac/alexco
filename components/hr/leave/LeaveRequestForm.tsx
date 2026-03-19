import { Button } from "@/components/ui/button";
import { submitLeaveRequest } from "@/server-actions/hr/leave";

interface LeaveRequestFormProps {
    leaveTypes: any[];
    employeeId: string;
    onSuccess: () => void;
}

export function LeaveRequestForm({ leaveTypes, employeeId, onSuccess }: LeaveRequestFormProps) {
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const diffTime = Math.abs(new Date(formData.get('end_date') as string).getTime() - new Date(formData.get('start_date') as string).getTime());
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        await submitLeaveRequest({
            employee_id: employeeId,
            leave_type_id: formData.get('leave_type'),
            start_date: formData.get('start_date'),
            end_date: formData.get('end_date'),
            days_requested: days,
            reason: formData.get('reason')
        });

        onSuccess();
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Leave Type</label>
                <select name="leave_type" required className="w-full px-3 py-2 border rounded-md">
                    <option value="">Select type</option>
                    {leaveTypes.map(lt => (
                        <option key={lt.id} value={lt.id}>{lt.name}</option>
                    ))}
                </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Start Date</label>
                    <input type="date" name="start_date" required className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">End Date</label>
                    <input type="date" name="end_date" required className="w-full px-3 py-2 border rounded-md" />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Reason</label>
                <input name="reason" placeholder="e.g. Family vacation" required className="w-full px-3 py-2 border rounded-md" />
            </div>
            <Button type="submit" className="w-full">Submit Request</Button>
        </form>
    );
}

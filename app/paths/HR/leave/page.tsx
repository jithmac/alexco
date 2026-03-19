"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { getLeaveBalances, getPendingRequests, updateLeaveStatus, getLeaveTypes, getAllLeaveRequests } from "@/server-actions/hr/leave";
import { Plus } from "lucide-react";
import { BalanceCard } from "@/components/hr/leave/BalanceCard";
import { PendingRequestsTable } from "@/components/hr/leave/PendingRequestsTable";
import { AllLeaveRecordsTable } from "@/components/hr/leave/AllLeaveRecordsTable";
import { LeaveRequestForm } from "@/components/hr/leave/LeaveRequestForm";

export default function LeavePage() {
    const [balances, setBalances] = useState<any[]>([]);
    const [pending, setPending] = useState<any[]>([]);
    const [allRequests, setAllRequests] = useState<any[]>([]);
    const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('balances');

    // Real user context
    const [currentUserId, setCurrentUserId] = useState<string>("");

    useEffect(() => {
        // Fetch session user on mount
        import("@/server-actions/auth/session").then(mod => {
            mod.getSessionUser().then(user => {
                if (user) {
                    setCurrentUserId(user.id);
                    if (user.employee_id && !targetEmployeeId) {
                        setTargetEmployeeId(user.employee_id);
                    }
                }
            });
        });
    }, []);

    // For demo purposes, we'll fetch balances for a specific test employee ID or let user input it
    const [targetEmployeeId, setTargetEmployeeId] = useState("");

    useEffect(() => {
        loadData();
    }, [targetEmployeeId]);

    async function loadData() {
        if (targetEmployeeId) {
            const bals = await getLeaveBalances(targetEmployeeId, 2025);
            setBalances(bals);
        }

        const reqs = await getPendingRequests();
        setPending(reqs);

        const all = await getAllLeaveRequests();
        setAllRequests(all);

        const types = await getLeaveTypes();
        setLeaveTypes(types);
    }

    async function handleApprove(id: string) {
        await updateLeaveStatus(id, 'approved', currentUserId);
        loadData();
    }

    async function handleReject(id: string) {
        await updateLeaveStatus(id, 'rejected', currentUserId);
        loadData();
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Leave Management</h1>
                <div className="flex gap-2">
                    <input
                        placeholder="Enter Employee ID to Test"
                        value={targetEmployeeId}
                        onChange={e => setTargetEmployeeId(e.target.value)}
                        className="px-3 py-2 border rounded-md text-sm w-[200px]"
                    />
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button><Plus className="h-4 w-4 mr-2" /> Request Leave</Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>New Leave Request</SheetTitle>
                            </SheetHeader>
                            <LeaveRequestForm
                                leaveTypes={leaveTypes}
                                employeeId={targetEmployeeId}
                                onSuccess={() => {
                                    setIsOpen(false);
                                    loadData();
                                }}
                            />
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {/* Custom Tabs */}
            <div className="flex gap-2 border-b">
                <button
                    onClick={() => setActiveTab('balances')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'balances' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    My Balances
                </button>
                <button
                    onClick={() => setActiveTab('approvals')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'approvals' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Approvals ({pending.length})
                </button>
                <button
                    onClick={() => setActiveTab('all_records')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'all_records' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    All Records
                </button>
            </div>

            <div className="pt-4">
                {activeTab === 'balances' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {balances.map((b, i) => (
                                <BalanceCard key={i} type={b.name} balance={b.entitled_days} taken={b.taken_days} />
                            ))}
                        </div>
                        {balances.length === 0 && <p className="text-muted-foreground p-4 bg-slate-50 rounded text-center">Enter an Employee ID above to view balances.</p>}
                    </div>
                )}

                {activeTab === 'approvals' && (
                    <PendingRequestsTable requests={pending} onApprove={handleApprove} onReject={handleReject} />
                )}

                {activeTab === 'all_records' && (
                    <AllLeaveRecordsTable requests={allRequests} />
                )}
            </div>
        </div>
    );
}

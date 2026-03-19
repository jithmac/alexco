"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { updateTicketMetadata } from "@/server-actions/admin/tickets";
import { useToast } from "@/hooks/use-toast";

export function StageActionPanel({ ticket, onUpdate }: { ticket: any, onUpdate: () => void }) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // Local state for form inputs
    const [notes, setNotes] = useState("");
    const [cost, setCost] = useState("");

    // Reset/Sync state when stage/ticket changes
    useEffect(() => {
        setCost(ticket.estimated_cost || "");

        switch (ticket.status) {
            case 'INSPECTION':
                setNotes(ticket.inspection_notes || "");
                break;
            case 'DIAGNOSIS':
                setNotes(ticket.diagnosis_notes || "");
                break;
            case 'IN_REPAIR':
                setNotes(ticket.repair_notes || "");
                break;
            default:
                setNotes("");
        }
    }, [ticket.status, ticket.id, ticket]);

    const handleUpdate = async (fields: any) => {
        setLoading(true);
        const res = await updateTicketMetadata(ticket.id, fields);
        if (res.success) {
            toast({ title: "Updated successfully" });
            onUpdate();
        } else {
            toast({ title: "Update failed", variant: "destructive" });
        }
        setLoading(false);
    };

    const advanceStage = async (nextStage: string) => {
        await handleUpdate({ status: nextStage });
    };

    // Render different UI based on stage
    switch (ticket.status) {
        case 'RECEIVED':
            return (
                <div className="space-y-4 border p-4 rounded-md bg-slate-50">
                    <h3 className="font-semibold">Step 1: Reception</h3>
                    <p className="text-sm text-slate-500">Verify device physical condition and accessories.</p>

                    <div className="flex items-center gap-2 max-w-sm">
                        <span className="text-sm whitespace-nowrap">Service Est. (Opt):</span>
                        <Input
                            type="number"
                            placeholder="Amount"
                            value={cost}
                            onChange={(e) => setCost(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={() => handleUpdate({ status: 'INSPECTION', estimated_cost: cost })}>
                            Save & Start Inspection
                        </Button>
                    </div>
                </div>
            );

        case 'INSPECTION':
            return (
                <div className="space-y-4 border p-4 rounded-md bg-slate-50">
                    <h3 className="font-semibold">Step 2: Initial Inspection</h3>
                    <Textarea
                        placeholder="Enter inspection notes (scratches, dents, etc.)..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                    <div className="flex gap-2">
                        <Button onClick={() => handleUpdate({ inspection_notes: notes, status: 'DIAGNOSIS' })} disabled={loading}>
                            Save & Start Diagnosis
                        </Button>
                    </div>
                </div>
            );

        case 'DIAGNOSIS':
            return (
                <div className="space-y-4 border p-4 rounded-md bg-slate-50">
                    <h3 className="font-semibold">Step 3: Diagnosis & Estimate</h3>
                    <Textarea
                        placeholder="Diagnosis details..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                    <div className="flex items-center gap-2">
                        <span>Service Cost (LKR):</span>
                        <Input
                            type="number"
                            className="w-32"
                            placeholder="Labor only"
                            value={cost}
                            onChange={(e) => setCost(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => handleUpdate({ diagnosis_notes: notes, estimated_cost: cost, status: 'WAITING_APPROVAL' })} disabled={loading}>
                            Send for Approval
                        </Button>
                    </div>
                </div>
            );

        case 'WAITING_APPROVAL':
            return (
                <div className="space-y-4 border p-4 rounded-md bg-blue-50">
                    <h3 className="font-semibold text-blue-900">Step 4: Customer Approval needed</h3>
                    <div className="text-sm">Estimated Cost: <strong>LKR {ticket.estimated_cost}</strong></div>
                    <div className="flex gap-2">
                        <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleUpdate({ approval_status: 'APPROVED', status: 'IN_REPAIR' })}>
                            Customer Approved
                        </Button>
                        <Button variant="destructive" onClick={() => handleUpdate({ approval_status: 'REJECTED', status: 'CLOSED' })}>
                            Rejected
                        </Button>
                    </div>
                </div>
            );

        case 'IN_REPAIR':
            return (
                <div className="space-y-4 border p-4 rounded-md bg-amber-50">
                    <h3 className="font-semibold text-amber-900">Step 5: Repair in Progress</h3>
                    <p className="text-sm text-slate-600">Technician is working on the device. Add parts using the Parts Manager below.</p>
                    <Textarea
                        placeholder="Repair notes (work done)..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                    <div className="flex gap-2">
                        <Button onClick={() => handleUpdate({ repair_notes: notes, status: 'TESTING' })} disabled={loading}>
                            Complete Repair
                        </Button>
                    </div>
                </div>
            );

        case 'TESTING':
            return (
                <div className="space-y-4 border p-4 rounded-md bg-slate-50">
                    <h3 className="font-semibold">Step 6: QA Testing</h3>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Checkbox id="qa1" /> <label htmlFor="qa1">Power On Test</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox id="qa2" /> <label htmlFor="qa2">Touch/Display Test</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox id="qa3" /> <label htmlFor="qa3">Audio/Mic Test</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox id="qa4" /> <label htmlFor="qa4">Charging Test</label>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <Button onClick={() => handleUpdate({ status: 'CLEANING' })} disabled={loading}>
                            QA Passed
                        </Button>
                        <Button variant="outline" onClick={() => handleUpdate({ status: 'IN_REPAIR' })} disabled={loading}>
                            QA Failed (Rework)
                        </Button>
                    </div>
                </div>
            );

        case 'CLEANING':
            return (
                <div className="space-y-4 border p-4 rounded-md bg-slate-50">
                    <h3 className="font-semibold">Step 7: Final Cleaning</h3>
                    <div className="flex items-center gap-2">
                        <Checkbox id="clean" /> <label htmlFor="clean">Device cleaned and sanitized</label>
                    </div>
                    <Button onClick={() => handleUpdate({ final_cleaning_done: true, status: 'BILLING' })}>
                        Ready for Billing
                    </Button>
                </div>
            );

        case 'BILLING':
            return (
                <div className="space-y-4 border p-4 rounded-md bg-green-50">
                    <h3 className="font-semibold text-green-900">Step 8: Ready for Billing</h3>
                    <p className="text-sm">Generate invoice and collect payment.</p>
                    <Button onClick={() => handleUpdate({ status: 'DELIVERED' })}>
                        Payment Received & Deliver
                    </Button>
                </div>
            );

        case 'DELIVERED':
            return (
                <div className="space-y-4 border p-4 rounded-md bg-slate-100">
                    <h3 className="font-semibold">Step 9: Delivered</h3>
                    <p className="text-sm">Device has been handed over to the customer.</p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleUpdate({ status: 'CLOSED' })}>
                            Archive Ticket
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleUpdate({ status: 'INSPECTION' })}>
                            Reopen (Returned)
                        </Button>
                    </div>
                </div>
            );

        case 'CLOSED':
            return (
                <div className="space-y-4 border p-4 rounded-md bg-slate-100">
                    <h3 className="font-semibold">Ticket Closed</h3>
                    <p className="text-sm">This ticket is archived.</p>
                    <Button variant="outline" size="sm" onClick={() => handleUpdate({ status: 'INSPECTION' })}>
                        Reopen Ticket
                    </Button>
                </div>
            );

        default:
            return <div className="p-4 border rounded bg-slate-50">Ticket Status: {ticket.status}</div>;
    }
}

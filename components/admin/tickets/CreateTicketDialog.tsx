"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createJobTicket, TicketData } from "@/server-actions/ticketing/tickets";
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function CreateTicketDialog({ onTicketCreated }: { onTicketCreated: () => void }) {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState<TicketData>({
        customerName: "",
        customerPhone: "",
        deviceModel: "",
        deviceSerial: "",
        issueDescription: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await createJobTicket(formData);
            if (res.success) {
                toast({
                    title: "Ticket Created",
                    description: `Job ID: ${res.ticketNumber}`,
                    action: (
                        <Button size="sm" variant="outline" onClick={() => window.open(`/paths/Ticket/print/${res.ticketId}?type=job-card&print=true`, '_blank', 'width=800,height=600')}>
                            Print Job Card
                        </Button>
                    ),
                    duration: 10000 // Show for longer
                });
                setOpen(false);
                setFormData({ customerName: "", customerPhone: "", deviceModel: "", deviceSerial: "", issueDescription: "", estimatedCost: undefined });
                onTicketCreated();
            } else {
                toast({ title: "Error", description: "Failed to create ticket", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" /> New Ticket
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Job Ticket</DialogTitle>
                    <DialogDescription>Enter customer and device details to create a new repair ticket.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="customerName">Customer Name</Label>
                            <Input
                                id="customerName" required
                                value={formData.customerName}
                                onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="customerPhone">Phone Number</Label>
                            <Input
                                id="customerPhone" required
                                value={formData.customerPhone}
                                onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="deviceModel">Device Model</Label>
                            <Input
                                id="deviceModel" required placeholder="e.g. iPhone 13 Pro"
                                value={formData.deviceModel}
                                onChange={e => setFormData({ ...formData, deviceModel: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="deviceSerial">Serial / IMEI</Label>
                            <Input
                                id="deviceSerial"
                                value={formData.deviceSerial}
                                onChange={e => setFormData({ ...formData, deviceSerial: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="issue">Reported Issue</Label>
                        <Textarea
                            id="issue" required placeholder="Describe the problem..."
                            value={formData.issueDescription}
                            onChange={e => setFormData({ ...formData, issueDescription: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="estimatedCost">Estimated Cost (Optional) - LKR</Label>
                        <Input
                            id="estimatedCost"
                            type="number"
                            placeholder="e.g. 5000"
                            value={formData.estimatedCost || ''}
                            onChange={e => setFormData({ ...formData, estimatedCost: e.target.value ? Number(e.target.value) : undefined })}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Ticket
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import { getTicketDetails, deleteTicket } from "@/server-actions/admin/tickets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import TicketPartsManager from "./TicketPartsManager";
import { TicketStageTracker } from "./TicketStageTracker";
import { StageActionPanel } from "./StageActionPanel";
import { TicketActivityLog } from "./TicketActivityLog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Printer, MessageCircle, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";

export default function TicketDetailSheet({ ticketId, open, onOpenChange }: { ticketId: string | null, open: boolean, onOpenChange: (open: boolean) => void }) {
    const [details, setDetails] = useState<any>(null);
    const [deleting, setDeleting] = useState(false);
    const { toast } = useToast();

    const loadDetails = async () => {
        if (!ticketId) return;
        const data = await getTicketDetails(ticketId);
        setDetails(data);
    };

    const handleDelete = async () => {
        if (!ticketId) return;
        setDeleting(true);
        try {
            const res = await deleteTicket(ticketId);
            if (res.success) {
                toast({ title: "Ticket Deleted", description: "The ticket has been permanently removed." });
                onOpenChange(false);
                // We'll need to refresh the list, but since this is a sheet, 
                // the parent usually handles the refresh. 
                // Most pages refresh on sheet close or have their own logic.
                if (typeof window !== 'undefined') window.location.reload();
            } else {
                toast({ title: "Error", description: res.error || "Failed to delete ticket", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
        } finally {
            setDeleting(false);
        }
    };

    useEffect(() => {
        if (open && ticketId) {
            loadDetails();
        } else {
            setDetails(null);
        }
    }, [open, ticketId]);

    if (!details && open) {
        return (
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Loading Ticket...</SheetTitle>
                        <SheetDescription>Please wait while we fetch the ticket details.</SheetDescription>
                    </SheetHeader>
                    <div className="flex items-center justify-center h-full">
                        <span className="text-muted-foreground">Loading...</span>
                    </div>
                </SheetContent>
            </Sheet>
        )
    }

    if (!details) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="!max-w-none w-[95vw] sm:!max-w-[1200px] overflow-y-auto" side="right">
                <SheetHeader className="mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <SheetTitle className="text-2xl">{details.ticket_number}</SheetTitle>
                            <Badge>{details.status}</Badge>
                        </div>




                        <div className="flex items-center gap-2">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 gap-2" disabled={deleting}>
                                        {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                        Delete
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the ticket, its parts list, and history log.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                                            Delete Permanently
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Printer className="h-4 w-4" /> Print
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => window.open(`/paths/Ticket/print/${ticketId}?type=job-card&print=true`, '_blank', 'width=800,height=600')}>
                                        Device Receipt (Job Card)
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => window.open(`/paths/Ticket/print/${ticketId}?type=estimate&print=true`, '_blank', 'width=800,height=600')}>
                                        Repair Estimate
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => window.open(`/paths/Ticket/print/${ticketId}?type=invoice&print=true`, '_blank', 'width=800,height=600')}>
                                        Final Invoice
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                    <SheetDescription>
                        Created on {new Date(details.created_at).toLocaleDateString()}
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <label className="text-slate-500 font-medium">Customer</label>
                            <div className="text-slate-900 font-bold">{details.customer_name}</div>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="text-slate-500">{details.customer_phone}</div>
                                {details.customer_phone && (
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-6 w-6 text-green-600 border-green-200 hover:bg-green-50"
                                        title="Chat on WhatsApp"
                                        onClick={() => {
                                            const phone = details.customer_phone.replace(/\D/g, '');
                                            const msg = `Hi ${details.customer_name}, regarding your device (Job: ${details.ticket_number})...`;
                                            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
                                        }}
                                    >
                                        <MessageCircle className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="text-slate-500 font-medium">Device</label>
                            <div className="text-slate-900">{details.device_model}</div>
                            <div className="text-slate-500">{details.device_serial || 'No Serial'}</div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-md text-sm">
                        <label className="text-slate-500 font-medium block mb-1">Issue Description</label>
                        <p>{details.issue_description}</p>
                    </div>

                    <Separator />

                    {/* Stage Tracking */}
                    <div className="space-y-4">
                        <TicketStageTracker currentStage={details.status} />
                        <StageActionPanel
                            ticket={details}
                            onUpdate={loadDetails}
                        />
                    </div>

                    <Separator />

                    {/* Activity Log - Visible in all stages */}
                    <TicketActivityLog ticket={details} />

                    <Separator />

                    {/* Parts & Inventory */}
                    <TicketPartsManager
                        ticketId={details.id}
                        items={details.items}
                        onItemChange={loadDetails}
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
}

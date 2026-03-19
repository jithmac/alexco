"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, getTickets } from "@/server-actions/admin/tickets";
import { Plus, RefreshCcw } from "lucide-react";
import TicketDetailSheet from "@/components/admin/tickets/TicketDetailSheet";
import { CreateTicketDialog } from "@/components/admin/tickets/CreateTicketDialog";

export default function TicketsPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {
        setLoading(true);
        const data = await getTickets();
        setTickets(data);
        setLoading(false);
    };

    const handleOpenTicket = (id: string) => {
        setSelectedTicketId(id);
        setIsSheetOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Job Tickets</h1>
                <CreateTicketDialog onTicketCreated={loadTickets} />
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Active Jobs</CardTitle>
                    <Button variant="ghost" size="icon" onClick={loadTickets} disabled={loading}>
                        <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </CardHeader>
                <CardContent>
                    {tickets.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">No active tickets</div>
                    ) : (
                        <div className="space-y-2">
                            {tickets.map(t => (
                                <div
                                    key={t.id}
                                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border cursor-pointer hover:bg-slate-100 transition-colors"
                                    onClick={() => handleOpenTicket(t.id)}
                                >
                                    <div>
                                        <div className="font-bold text-slate-900 flex items-center gap-3">
                                            {t.ticketNumber}
                                            <Badge variant={t.status === 'READY' ? 'default' : 'secondary'}>
                                                {t.status}
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-slate-500 mt-1">
                                            {t.customer} • {t.device}
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        {t.createdAt}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <TicketDetailSheet
                ticketId={selectedTicketId}
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
            />
        </div>
    );
}

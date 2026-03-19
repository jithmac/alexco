"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, Clipboard, FileText, Info, Wrench, RefreshCcw, History } from "lucide-react";

interface TicketActivityLogProps {
    ticket: any;
}

export function TicketActivityLog({ ticket }: TicketActivityLogProps) {
    const history = ticket.history || [];

    // Map DB action_type to Icons/Colors
    const getActionStyle = (type: string) => {
        switch (type) {
            case 'CREATED': return { icon: AlertCircle, color: "text-blue-500", label: "Ticket Created" };
            case 'STATUS_CHANGE': return { icon: RefreshCcw, color: "text-purple-500", label: "Status Update" };
            case 'NOTE_ADDED': return { icon: FileText, color: "text-amber-500", label: "Note Added" };
            case 'ITEM_ADDED': return { icon: Wrench, color: "text-orange-500", label: "Part Added" };
            case 'REOPENED': return { icon: History, color: "text-red-500", label: "Ticket Reopened" };
            default: return { icon: Info, color: "text-slate-500", label: "Activity" };
        }
    };

    return (
        <div className="border rounded-md bg-white">
            <div className="p-3 border-b bg-slate-50 font-medium text-sm flex justify-between items-center">
                <span>Activity Log</span>
                <span className="text-xs text-slate-400">{history.length} records</span>
            </div>
            <ScrollArea className="h-[250px] p-4">
                <div className="space-y-6">
                    {history.map((log: any) => {
                        const style = getActionStyle(log.action_type);
                        const date = new Date(log.created_at);

                        return (
                            <div key={log.id} className="flex gap-3">
                                <div className={cn("mt-0.5", style.color)}>
                                    <style.icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-slate-900">{log.action_type}</p>
                                        <div className="text-xs text-slate-400 text-right">
                                            <div>{date.toLocaleDateString()}</div>
                                            <div>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{log.description}</p>
                                </div>
                            </div>
                        );
                    })}

                    {history.length === 0 && (
                        <div className="text-center py-8 text-slate-500 text-sm">
                            <History className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            <p>No history recorded yet.</p>
                            <p className="text-xs mt-1">Actions performed from now on will appear here.</p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}

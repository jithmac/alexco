"use client";

import { useState, useEffect } from "react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, Eye, Trash2, Mail, MailOpen, Archive, Reply } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getContactMessages, updateMessageStatus, deleteMessage } from "@/server-actions/admin/messages";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function ContactMessagesPage() {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const { toast } = useToast();

    async function loadData() {
        setLoading(true);
        const data = await getContactMessages(statusFilter);
        setMessages(data);
        setLoading(false);
    }

    useEffect(() => {
        loadData();
    }, [statusFilter]);

    const handleStatusChange = async (messageId: string, newStatus: string) => {
        const result = await updateMessageStatus(messageId, newStatus);
        if (result.success) {
            toast({ title: "Status Updated" });
            loadData();
            if (selectedMessage && selectedMessage.id === messageId) {
                setSelectedMessage({ ...selectedMessage, status: newStatus });
            }
        } else {
            toast({ title: "Failed to update status", variant: "destructive" });
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        const result = await deleteMessage(deleteId);
        if (result.success) {
            toast({ title: "Message Deleted" });
            loadData();
            setDeleteId(null);
        } else {
            toast({ title: "Failed to delete message", variant: "destructive" });
        }
    };

    const openMessage = async (msg: any) => {
        setSelectedMessage(msg);
        if (msg.status === 'new') {
            await updateMessageStatus(msg.id, 'read');
            loadData();
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'new':
                return <Badge className="bg-blue-100 text-blue-800 border-blue-200 gap-1"><Mail className="h-3 w-3" /> New</Badge>;
            case 'read':
                return <Badge className="bg-slate-100 text-slate-800 border-slate-200 gap-1"><MailOpen className="h-3 w-3" /> Read</Badge>;
            case 'replied':
                return <Badge className="bg-green-100 text-green-800 border-green-200 gap-1"><Reply className="h-3 w-3" /> Replied</Badge>;
            case 'archived':
                return <Badge className="bg-amber-100 text-amber-800 border-amber-200 gap-1"><Archive className="h-3 w-3" /> Archived</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-4 p-4">
            <h1 className="text-2xl font-bold tracking-tight">Contact Messages</h1>

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex gap-2 items-center">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Messages</SelectItem>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="read">Read</SelectItem>
                            <SelectItem value="replied">Replied</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button variant="outline" onClick={loadData}>Refresh</Button>
            </div>

            <div className="border rounded-md bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-slate-400">Loading messages...</TableCell>
                            </TableRow>
                        ) : messages.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-slate-400">No messages found.</TableCell>
                            </TableRow>
                        ) : (
                            messages.map((msg) => (
                                <TableRow key={msg.id} className={msg.status === 'new' ? 'bg-blue-50/50' : ''}>
                                    <TableCell className="text-sm text-slate-500">
                                        {new Date(msg.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{msg.first_name} {msg.last_name || ''}</div>
                                    </TableCell>
                                    <TableCell className="text-sm">{msg.email}</TableCell>
                                    <TableCell className="text-sm truncate max-w-[200px]">{msg.subject || '(No subject)'}</TableCell>
                                    <TableCell>{getStatusBadge(msg.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex gap-1 justify-end">
                                            <Button variant="ghost" size="sm" onClick={() => openMessage(msg)}>
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => setDeleteId(msg.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Message Details Dialog */}
            <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{selectedMessage?.subject || 'Message Details'}</DialogTitle>
                    </DialogHeader>
                    {selectedMessage && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-slate-500">From:</span>
                                    <p className="font-medium">{selectedMessage.first_name} {selectedMessage.last_name || ''}</p>
                                </div>
                                <div>
                                    <span className="text-slate-500">Email:</span>
                                    <p className="font-medium">
                                        <a href={`mailto:${selectedMessage.email}`} className="text-blue-600 hover:underline">{selectedMessage.email}</a>
                                    </p>
                                </div>
                                <div>
                                    <span className="text-slate-500">Date:</span>
                                    <p>{new Date(selectedMessage.created_at).toLocaleString()}</p>
                                </div>
                                <div>
                                    <span className="text-slate-500">Status:</span>
                                    <div className="mt-1">{getStatusBadge(selectedMessage.status)}</div>
                                </div>
                            </div>
                            <div className="border-t pt-4">
                                <h4 className="text-sm text-slate-500 mb-2">Message:</h4>
                                <div className="bg-slate-50 p-4 rounded-lg whitespace-pre-wrap text-sm">
                                    {selectedMessage.message}
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="gap-2">
                        <Select
                            value={selectedMessage?.status}
                            onValueChange={(val) => selectedMessage && handleStatusChange(selectedMessage.id, val)}
                        >
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="read">Read</SelectItem>
                                <SelectItem value="replied">Replied</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button asChild>
                            <a href={`mailto:${selectedMessage?.email}?subject=Re: ${selectedMessage?.subject || 'Your Inquiry'}`}>
                                Reply via Email
                            </a>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Message?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The message will be permanently deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

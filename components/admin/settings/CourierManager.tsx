"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { getCouriers, addCourier, updateCourier, deleteCourier } from "@/server-actions/admin/couriers";
import { Pencil, Trash2, Plus, Truck } from "lucide-react";

export default function CourierManager() {
    const { toast } = useToast();
    const [couriers, setCouriers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCourier, setEditingCourier] = useState<any | null>(null);
    const [formData, setFormData] = useState({ name: "", tracking_url_template: "" });

    const loadCouriers = async () => {
        setLoading(true);
        const data = await getCouriers();
        setCouriers(data);
        setLoading(false);
    };

    useEffect(() => {
        loadCouriers();
    }, []);

    const handleOpenDialog = (courier?: any) => {
        if (courier) {
            setEditingCourier(courier);
            setFormData({ name: courier.name, tracking_url_template: courier.tracking_url_template || "" });
        } else {
            setEditingCourier(null);
            setFormData({ name: "", tracking_url_template: "" });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.name) return toast({ title: "Name is required", variant: "destructive" });

        let result;
        if (editingCourier) {
            result = await updateCourier(editingCourier.id, formData.name, formData.tracking_url_template);
        } else {
            result = await addCourier(formData.name, formData.tracking_url_template);
        }

        if (result.success) {
            toast({ title: editingCourier ? "Courier Updated" : "Courier Added" });
            setIsDialogOpen(false);
            loadCouriers();
        } else {
            toast({ title: "Operation failed", variant: "destructive" });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        const result = await deleteCourier(id);
        if (result.success) {
            toast({ title: "Courier Deleted" });
            loadCouriers();
        } else {
            toast({ title: "Failed to delete", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-4 border p-4 rounded-md bg-white">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-slate-500" />
                    <h2 className="text-lg font-semibold">Courier Services</h2>
                </div>
                <Button onClick={() => handleOpenDialog()} size="sm">
                    <Plus className="h-4 w-4 mr-2" /> Add Courier
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Tracking URL Template</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center py-4">Loading...</TableCell>
                        </TableRow>
                    ) : couriers.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center py-4 text-slate-500">No couriers found.</TableCell>
                        </TableRow>
                    ) : (
                        couriers.map((courier) => (
                            <TableRow key={courier.id}>
                                <TableCell className="font-medium">{courier.name}</TableCell>
                                <TableCell className="text-sm text-slate-500 font-mono truncate max-w-[300px]">
                                    {courier.tracking_url_template || '-'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(courier)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(courier.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCourier ? "Edit Courier" : "Add Courier"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Courier Name</label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. DHL, Uber, PickMe"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tracking URL Template (Optional)</label>
                            <Input
                                value={formData.tracking_url_template}
                                onChange={(e) => setFormData({ ...formData, tracking_url_template: e.target.value })}
                                placeholder="https://tracker.com?id={tracking_number}"
                            />
                            <p className="text-xs text-slate-500">Use <code>{'{tracking_number}'}</code> as a placeholder.</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

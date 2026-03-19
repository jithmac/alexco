"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { query } from "@/lib/db"; // Can't use query in client component.
// We need server actions. I'll define local state + server action integration.

// Since I cannot import server actions that don't exist yet, I'll create them too.
// Assuming server-actions/admin/delivery.ts was created or I'll create it now.
import { getDeliveryRates, updateDeliveryRates } from "@/server-actions/admin/delivery";

// Using a slightly different approach: Bulk editor layout
export default function DeliveryRateManager() {
    const [rates, setRates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        load();
    }, []);

    async function load() {
        setLoading(true);
        try {
            const data = await getDeliveryRates();
            setRates(data);
        } catch (e) {
            console.error(e);
            toast({ title: "Error", description: "Failed to load rates", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }

    const addRow = () => {
        setRates([...rates, { id: `temp-${Date.now()}`, min_weight_g: 0, max_weight_g: 1000, rate: 500 }]);
    };

    const removeRow = (index: number) => {
        const newRates = [...rates];
        newRates.splice(index, 1);
        setRates(newRates);
    };

    const updateRow = (index: number, field: string, value: any) => {
        const newRates = [...rates];
        newRates[index] = { ...newRates[index], [field]: Number(value) };
        setRates(newRates);
    };

    async function handleSave() {
        setSaving(true);
        try {
            await updateDeliveryRates(rates);
            toast({ title: "Saved", description: "Delivery rates updated successfully." });
            load(); // Reload to get real IDs
        } catch (e) {
            toast({ title: "Error", description: "Failed to save changes", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div>Loading...</div>;

    return (
        <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Weight-Based Rates</h2>
                <Button onClick={handleSave} disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Min Weight (g)</TableHead>
                        <TableHead>Max Weight (g)</TableHead>
                        <TableHead>Cost (LKR)</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rates.map((rate, index) => (
                        <TableRow key={rate.id}>
                            <TableCell>
                                <Input
                                    type="number"
                                    value={rate.min_weight_g}
                                    onChange={(e) => updateRow(index, 'min_weight_g', e.target.value)}
                                />
                            </TableCell>
                            <TableCell>
                                <Input
                                    type="number"
                                    value={rate.max_weight_g}
                                    onChange={(e) => updateRow(index, 'max_weight_g', e.target.value)}
                                />
                            </TableCell>
                            <TableCell>
                                <Input
                                    type="number"
                                    value={rate.rate}
                                    onChange={(e) => updateRow(index, 'rate', e.target.value)}
                                />
                            </TableCell>
                            <TableCell>
                                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => removeRow(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    {rates.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-slate-500 py-8">
                                No rates configured. Default default 500 LKR will apply.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <Button variant="outline" className="mt-4" onClick={addRow}>
                <Plus className="h-4 w-4 mr-2" /> Add Range
            </Button>
        </div>
    );
}

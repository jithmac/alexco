import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Package, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface EmployeeAssetsTabProps {
    assets: any[];
    handleAssignAsset: (e: React.FormEvent) => void;
}

export function EmployeeAssetsTab({ assets, handleAssignAsset }: EmployeeAssetsTabProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" /> Assigned Assets</CardTitle>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Assign Asset</Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Assign Asset</SheetTitle>
                        </SheetHeader>
                        <form onSubmit={handleAssignAsset} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Asset Name</label>
                                <input name="asset_name" required className="w-full px-3 py-2 border rounded-md" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Type</label>
                                <select name="asset_type" required className="w-full px-3 py-2 border rounded-md">
                                    <option value="laptop">Laptop</option>
                                    <option value="phone">Phone</option>
                                    <option value="vehicle">Vehicle</option>
                                    <option value="tool">Tool</option>
                                    <option value="uniform">Uniform</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Serial/Code</label>
                                <input name="asset_code" className="w-full px-3 py-2 border rounded-md" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Assigned Date</label>
                                <input type="date" name="assigned_date" required className="w-full px-3 py-2 border rounded-md" defaultValue={new Date().toISOString().split('T')[0]} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Condition</label>
                                <select name="condition_on_issue" required className="w-full px-3 py-2 border rounded-md">
                                    <option value="new">New</option>
                                    <option value="good">Good</option>
                                    <option value="fair">Fair</option>
                                    <option value="poor">Poor</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Notes</label>
                                <textarea name="notes" className="w-full px-3 py-2 border rounded-md" rows={3}></textarea>
                            </div>
                            <SheetFooter>
                                <SheetClose asChild>
                                    <Button type="button" variant="outline">Cancel</Button>
                                </SheetClose>
                                <Button type="submit">Assign Asset</Button>
                            </SheetFooter>
                        </form>
                    </SheetContent>
                </Sheet>
            </CardHeader>
            <CardContent>
                {assets.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">No assets assigned to this employee</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-2 text-left">Asset</th>
                                <th className="px-4 py-2 text-left">Type</th>
                                <th className="px-4 py-2 text-left">Code</th>
                                <th className="px-4 py-2 text-left">Assigned</th>
                                <th className="px-4 py-2 text-left">Condition</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assets.map(a => (
                                <tr key={a.id} className="border-b">
                                    <td className="px-4 py-2 font-medium">{a.asset_name}</td>
                                    <td className="px-4 py-2 capitalize">{a.asset_type}</td>
                                    <td className="px-4 py-2">{a.asset_code || '-'}</td>
                                    <td className="px-4 py-2">{formatDate(a.assigned_date)}</td>
                                    <td className="px-4 py-2 capitalize">{a.condition_on_issue}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </CardContent>
        </Card>
    );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AlertTriangle, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface EmployeeDisciplinaryTabProps {
    disciplinary: any[];
    handleAddDisciplinary: (e: React.FormEvent) => void;
}

export function EmployeeDisciplinaryTab({ disciplinary, handleAddDisciplinary }: EmployeeDisciplinaryTabProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Disciplinary Records</CardTitle>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button size="sm" variant="destructive"><Plus className="h-4 w-4 mr-2" /> Add Record</Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Add Disciplinary Record</SheetTitle>
                        </SheetHeader>
                        <form onSubmit={handleAddDisciplinary} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Type</label>
                                <select name="record_type" required className="w-full px-3 py-2 border rounded-md">
                                    <option value="verbal_warning">Verbal Warning</option>
                                    <option value="written_warning">Written Warning</option>
                                    <option value="final_warning">Final Warning</option>
                                    <option value="suspension">Suspension</option>
                                    <option value="termination">Termination</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Incident Date</label>
                                <input type="date" name="incident_date" required className="w-full px-3 py-2 border rounded-md" defaultValue={new Date().toISOString().split('T')[0]} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <textarea name="description" required className="w-full px-3 py-2 border rounded-md" rows={3}></textarea>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Action Taken</label>
                                <input name="action_taken" className="w-full px-3 py-2 border rounded-md" />
                            </div>
                            <Button type="submit" variant="destructive" className="w-full">Save Record</Button>
                        </form>
                    </SheetContent>
                </Sheet>
            </CardHeader>
            <CardContent>
                {disciplinary.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">No disciplinary records</p>
                ) : (
                    <div className="space-y-4">
                        {disciplinary.map(d => (
                            <div key={d.id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className={`px-2 py-1 rounded text-xs ${d.record_type.includes('warning') ? 'bg-amber-100 text-amber-700' :
                                            d.record_type === 'termination' ? 'bg-red-100 text-red-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                            {d.record_type.replace('_', ' ').toUpperCase()}
                                        </span>
                                        <p className="mt-2 text-slate-700">{d.description}</p>
                                    </div>
                                    <span className="text-sm text-slate-400">
                                        {formatDate(d.incident_date)}
                                    </span>
                                </div>
                                {d.action_taken && (
                                    <p className="mt-2 text-sm text-slate-500"><strong>Action:</strong> {d.action_taken}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

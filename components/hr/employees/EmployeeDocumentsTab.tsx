import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { FileText, Upload, Download } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface EmployeeDocumentsTabProps {
    documents: any[];
    handleUpload: (e: React.FormEvent) => void;
}

export function EmployeeDocumentsTab({ documents, handleUpload }: EmployeeDocumentsTabProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Documents</CardTitle>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button size="sm"><Upload className="h-4 w-4 mr-2" /> Upload Document</Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Upload Document</SheetTitle>
                        </SheetHeader>
                        <form onSubmit={handleUpload} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Document Type</label>
                                <select name="document_type" required className="w-full px-3 py-2 border rounded-md">
                                    <option value="nic_copy">NIC Copy</option>
                                    <option value="contract">Contract</option>
                                    <option value="offer_letter">Offer Letter</option>
                                    <option value="certificate">Certificate</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">File</label>
                                <input type="file" name="file" required className="w-full px-3 py-2 border rounded-md" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Notes</label>
                                <textarea name="notes" className="w-full px-3 py-2 border rounded-md" rows={3}></textarea>
                            </div>
                            <Button type="submit" className="w-full">Upload</Button>
                        </form>
                    </SheetContent>
                </Sheet>
            </CardHeader>
            <CardContent>
                {documents.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">No documents uploaded</p>
                ) : (
                    <div className="space-y-2">
                        {documents.map((doc: any) => (
                            <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-8 w-8 text-blue-500" />
                                    <div>
                                        <p className="font-medium text-slate-900">{doc.document_name}</p>
                                        <p className="text-xs text-slate-500 capitalize">{doc.document_type.replace('_', ' ')} • {formatDate(doc.uploaded_at)}</p>
                                    </div>
                                </div>
                                <a href={doc.file_path} target="_blank" rel="noreferrer" download>
                                    <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

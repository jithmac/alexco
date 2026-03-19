"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";
import { importProducts, ProductImportData } from "@/server-actions/admin/import-products";
import { Upload } from "lucide-react";

interface ImportProductDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export default function ImportProductDialog({ open, onOpenChange, onSuccess }: ImportProductDialogProps) {
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [summary, setSummary] = useState<{ total: number, created: number, errors: string[] } | null>(null);
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setSummary(null);
        }
    };

    const handleDownloadTemplate = () => {
        const headers = ["name", "sku", "category", "price", "price_cost", "price_sale", "initialStock", "description", "long_description", "weight_g", "variations", "variation_prices", "variation_sale_prices", "variant_stocks", "specifications", "features", "whats_included"];
        const csv = Papa.unparse([headers]);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "product_import_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImport = async () => {
        if (!file) return;

        setLoading(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const data = results.data as ProductImportData[];
                console.log("Parsed CSV Data:", data);

                if (data.length === 0) {
                    toast({
                        title: "Empty CSV",
                        description: "No data found in the CSV file.",
                        variant: "destructive"
                    });
                    setLoading(false);
                    return;
                }

                try {
                    const result = await importProducts(data);

                    if ('error' in result) {
                        toast({
                            title: "Import Failed",
                            description: result.error,
                            variant: "destructive"
                        });
                        return;
                    }

                    setSummary(result);
                    if (result.errors.length === 0) {
                        toast({
                            title: "Import Successful",
                            description: `Successfully imported ${result.created} products.`
                        });
                        onSuccess();
                        // Close dialog after a delay if no errors
                        setTimeout(() => onOpenChange(false), 2000);
                    } else {
                        toast({
                            title: "Import Completed with Errors",
                            description: `Imported ${result.created} products. ${result.errors.length} failed.`,
                            variant: "destructive"
                        });
                    }
                } catch (error) {
                    console.error("Import error:", error);
                    toast({
                        title: "Import Failed",
                        description: "An unexpected error occurred during import.",
                        variant: "destructive"
                    });
                } finally {
                    setLoading(false);
                }
            },
            error: (error) => {
                console.error("CSV Parse Error:", error);
                toast({
                    title: "CSV Parse Error",
                    description: error.message,
                    variant: "destructive"
                });
                setLoading(false);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Import Products from CSV</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file to bulk add products. Download the template to see the required format.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg border">
                        <div className="text-sm text-slate-600">
                            <strong>Step 1:</strong> Get the template
                        </div>
                        <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                            Download Template
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm text-slate-600 mb-1">
                            <strong>Step 2:</strong> Upload your CSV
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-slate-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                            />
                        </div>
                    </div>

                    {summary && summary.errors.length > 0 && (
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200 max-h-[200px] overflow-y-auto">
                            <h4 className="font-semibold text-red-800 text-sm mb-2">Import Errors ({summary.errors.length})</h4>
                            <ul className="list-disc list-inside text-xs text-red-700 space-y-1">
                                {summary.errors.map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {summary && summary.errors.length === 0 && summary.created > 0 && (
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <p className="text-sm text-green-800">
                                Successfully imported <strong>{summary.created}</strong> products!
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleImport} disabled={!file || loading} className="gap-2">
                        {loading ? "Importing..." : (
                            <>
                                <Upload className="h-4 w-4" /> Import Now
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

"use client";

import { useState, useEffect } from "react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Search, Plus, SlidersHorizontal, Trash2, Pencil, Upload } from "lucide-react";
import { getInventoryList, deleteProduct, toggleProductStatus } from "@/server-actions/admin/inventory";
import AddProductDialog from "./AddProductDialog";
import ImportProductDialog from "./ImportProductDialog";
import EditProductDialog from "./EditProductDialog";
import StockAdjustmentDialog from "./StockAdjustmentDialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function InventoryList() {
    const [products, setProducts] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showImportDialog, setShowImportDialog] = useState(false);
    const [adjustProduct, setAdjustProduct] = useState<any | null>(null);
    const [editProduct, setEditProduct] = useState<any | null>(null);
    const [deleteProductInfo, setDeleteProductInfo] = useState<any | null>(null);
    const { toast } = useToast();

    async function loadData() {
        setLoading(true);
        const data = await getInventoryList(search);
        setProducts(data);
        setLoading(false);
    }

    useEffect(() => {
        const timeout = setTimeout(loadData, 300);
        return () => clearTimeout(timeout);
    }, [search]);

    const handleSuccess = () => {
        loadData();
        setShowAddDialog(false);
        setShowImportDialog(false);
        setAdjustProduct(null);
        setEditProduct(null);
    };

    const handleDelete = async () => {
        if (!deleteProductInfo) return;

        const result = await deleteProduct(deleteProductInfo.id);

        if (result.success) {
            toast({
                title: "Product deleted",
                description: `${deleteProductInfo.name} has been removed.`,
            });
            loadData();
        } else {
            toast({
                title: "Delete failed",
                description: result.error,
                variant: "destructive",
            });
        }
        setDeleteProductInfo(null);
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        // Optimistic update
        setProducts(products.map(p => p.id === id ? { ...p, is_active: !currentStatus } : p));

        const result = await toggleProductStatus(id, !currentStatus);

        if (!result.success) {
            // Revert on failure
            setProducts(products.map(p => p.id === id ? { ...p, is_active: currentStatus } : p));
            toast({
                title: "Update failed",
                description: result.error,
                variant: "destructive"
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search products..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button variant="outline" onClick={() => setShowImportDialog(true)}>
                    <Upload className="h-4 w-4 mr-2" /> Import CSV
                </Button>
                <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Product
                </Button>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product Name</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Retail</TableHead>
                            <TableHead className="text-right">Cost</TableHead>
                            <TableHead className="text-right">Sale</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                            <TableHead className="text-right">Stock</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-slate-400">
                                    Loading inventory...
                                </TableCell>
                            </TableRow>
                        ) : products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-slate-400">
                                    No products found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell className="font-medium">{p.name}</TableCell>
                                    <TableCell>{p.sku}</TableCell>
                                    <TableCell>{p.category_path}</TableCell>
                                    <TableCell className="text-right">
                                        {Number(p.price_retail).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right text-slate-500 font-mono text-xs">
                                        {p.price_cost > 0 ? Number(p.price_cost).toLocaleString() : '-'}
                                    </TableCell>
                                    <TableCell className="text-right text-green-600 font-medium">
                                        {p.price_sale > 0 ? Number(p.price_sale).toLocaleString() : '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Switch
                                            checked={p.is_active}
                                            onCheckedChange={() => handleToggleStatus(p.id, p.is_active)}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium 
                                            ${p.current_stock > 10 ? 'bg-green-100 text-green-800' :
                                                p.current_stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'}`}>
                                            {p.current_stock}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setEditProduct(p)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => setDeleteProductInfo(p)}
                                            >
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

            <AddProductDialog
                open={showAddDialog}
                onOpenChange={setShowAddDialog}
                onSuccess={handleSuccess}
            />

            <ImportProductDialog
                open={showImportDialog}
                onOpenChange={setShowImportDialog}
                onSuccess={handleSuccess}
            />

            {adjustProduct && (
                <StockAdjustmentDialog
                    product={adjustProduct}
                    open={!!adjustProduct}
                    onOpenChange={(open) => !open && setAdjustProduct(null)}
                    onSuccess={handleSuccess}
                />
            )}

            {editProduct && (
                <EditProductDialog
                    product={editProduct}
                    open={!!editProduct}
                    onOpenChange={(open) => !open && setEditProduct(null)}
                    onSuccess={handleSuccess}
                />
            )}

            <AlertDialog open={!!deleteProductInfo} onOpenChange={(open) => !open && setDeleteProductInfo(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete <strong>{deleteProductInfo?.name}</strong> and all its stock history.
                            <br /><br />
                            If this product has been sold before, it cannot be deleted to preserve sales records.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

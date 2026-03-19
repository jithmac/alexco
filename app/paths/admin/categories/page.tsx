"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Folder, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCategories, createCategory, updateCategory, deleteCategory, Category } from "@/server-actions/admin/categories";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "@/components/admin/ImageUpload";

export default function CategoriesPage() {
    const { toast } = useToast();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        parent_id: "root",
        image: "",
        icon: "",
        is_active: true,
        order_index: 0
    });

    useEffect(() => {
        loadCategories();
    }, []);

    async function loadCategories() {
        setLoading(true);
        const data = await getCategories(true); // Include inactive
        setCategories(data);
        setLoading(false);
    }

    const flattenedCategories: Category[] = [];
    const flatten = (cats: Category[], depth = 0) => {
        cats.forEach(c => {
            flattenedCategories.push({ ...c, depth } as any);
            if (c.children && c.children.length > 0) {
                flatten(c.children, depth + 1);
            }
        });
    };
    flatten(categories);

    const filteredCategories = flattenedCategories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            slug: category.slug,
            description: category.description,
            parent_id: category.parent_id || "root",
            image: category.image || "",
            icon: category.icon || "",
            is_active: category.is_active,
            order_index: category.order_index
        });
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        setEditingCategory(null);
        setFormData({
            name: "",
            slug: "",
            description: "",
            parent_id: "root",
            image: "",
            icon: "",
            is_active: true,
            order_index: 0
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        const parentId = formData.parent_id === "root" ? undefined : formData.parent_id;

        if (editingCategory) {
            const res = await updateCategory(editingCategory.id, formData.name, parentId, formData.image);
            if (res.success) {
                toast({ title: "Category Updated" });
                loadCategories();
                setIsDialogOpen(false);
            } else {
                toast({ title: "Error", description: res.error, variant: "destructive" });
            }
        } else {
            const res = await createCategory(formData.name, parentId, formData.image);
            if (res.success) {
                toast({ title: "Category Created" });
                loadCategories();
                setIsDialogOpen(false);
            } else {
                toast({ title: "Error", description: res.error, variant: "destructive" });
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This cannot be undone.")) return;
        const res = await deleteCategory(id);
        if (res.success) {
            toast({ title: "Category Deleted" });
            loadCategories();
        } else {
            toast({ title: "Error", description: (res as any).error, variant: "destructive" });
        }
    };

    // Auto-generate slug
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setFormData(prev => ({
            ...prev,
            name,
            slug: !editingCategory ? name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') : prev.slug
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
                    <p className="text-slate-500">Manage product categories and hierarchy.</p>
                </div>
                <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> Add Category
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-slate-200">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search categories..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Categories Table */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Products</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-slate-500">Loading...</TableCell>
                            </TableRow>
                        ) : filteredCategories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-slate-500">No categories found.</TableCell>
                            </TableRow>
                        ) : (
                            filteredCategories.map((category: any) => (
                                <TableRow key={category.id}>
                                    <TableCell>
                                        {category.image ? (
                                            <img src={category.image} alt={category.name} className="h-10 w-10 object-cover rounded" />
                                        ) : (
                                            <div className="h-10 w-10 bg-slate-100 rounded flex items-center justify-center text-slate-300">
                                                <Folder className="h-5 w-5" />
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2" style={{ paddingLeft: `${category.depth * 24}px` }}>
                                            {category.depth > 0 && <div className="w-4 border-b border-slate-300 mr-1 h-0"></div>}
                                            <span className="font-medium">{category.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-500 font-mono text-xs">{category.slug}</TableCell>
                                    <TableCell>{category.product_count}</TableCell>
                                    <TableCell>
                                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${category.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {category.is_active ? 'Active' : 'Hidden'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                                                <Edit className="h-4 w-4 text-slate-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(category.id)}>
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

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? "Edit Category" : "Create Category"}</DialogTitle>
                        <DialogDescription>
                            {editingCategory ? "Update category details." : "Add a new category to the store."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Category Image</Label>
                            <ImageUpload
                                value={formData.image ? [formData.image] : []}
                                onChange={(urls: string[]) => setFormData({ ...formData, image: urls[0] || "" })}
                                onRemove={() => setFormData({ ...formData, image: "" })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input value={formData.name} onChange={handleNameChange} placeholder="e.g. Solar Panels" />
                            </div>
                            <div className="space-y-2">
                                <Label>Slug</Label>
                                <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="solar-panels" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Parent Category</Label>
                            <Select
                                value={formData.parent_id}
                                onValueChange={(val) => setFormData({ ...formData, parent_id: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select parent (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="root">None (Top Level)</SelectItem>
                                    {flattenedCategories
                                        .filter(c => c.id !== editingCategory?.id) // Prevent self-parenting
                                        .map((c: any) => (
                                            <SelectItem key={c.id} value={c.id}>
                                                <span style={{ paddingLeft: `${c.depth * 10}px` }}>{c.name}</span>
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                        </div>

                        <div className="flex items-center justify-between border p-3 rounded-lg">
                            <div className="space-y-0.5">
                                <Label className="text-base">Active Status</Label>
                                <p className="text-sm text-slate-500">Visible in store navigation</p>
                            </div>
                            <Switch checked={formData.is_active} onCheckedChange={(chk: boolean) => setFormData({ ...formData, is_active: chk })} />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
                            {editingCategory ? "Save Changes" : "Create Category"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

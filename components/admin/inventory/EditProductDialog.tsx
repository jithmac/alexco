"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, ArrowRight, ArrowLeft, Save } from "lucide-react";
import { updateProduct } from "@/server-actions/admin/inventory";
import ImageUpload from "@/components/admin/ImageUpload";
import VariationStockManager from "./VariationStockManager";
import { cn } from "@/lib/utils";

interface EditProductDialogProps {
    product: any | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

interface VariationOption {
    name: string;
}

interface VariationGroup {
    name: string;
    options: VariationOption[];
}

export default function EditProductDialog({ product, open, onOpenChange, onSuccess }: EditProductDialogProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<{ id: string, name: string, slug: string, parent_id: string | null }[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);

    // Form State
    const [basicInfo, setBasicInfo] = useState({
        name: "",
        sku: "",
        category: "",
        price: "",
        price_sale: "",
        price_cost: "",
        description: "",
        long_description: "",
        weight_g: "0",
        videoUrl: "",
        isActive: true
    });

    const [gallery, setGallery] = useState<string[]>([]);
    const [specs, setSpecs] = useState<{ key: string, value: string }[]>([]);
    const [boxItems, setBoxItems] = useState<string[]>([]);
    const [features, setFeatures] = useState<string[]>([]);

    const [variationGroups, setVariationGroups] = useState<VariationGroup[]>([]);
    const [variantPrices, setVariantPrices] = useState<Record<string, string>>({});
    const [variantSalePrices, setVariantSalePrices] = useState<Record<string, string>>({});

    useEffect(() => {
        if (open) {
            import("@/server-actions/admin/categories").then(({ getCategories }) => {
                getCategories(true).then((cats) => {
                    const flat: any[] = [];
                    const traverse = (items: any[]) => {
                        items.forEach(i => {
                            flat.push(i);
                            if (i.children) traverse(i.children);
                        });
                    };
                    traverse(cats);
                    setCategories(flat);
                });
            });
            setStep(1);
            setError(null);
        }
    }, [open]);

    // Pre-fill state when product is loaded
    useEffect(() => {
        if (product) {
            setBasicInfo({
                name: product.name || "",
                sku: product.sku || "",
                category: "", // will be set via ID logic below
                price: String(product.price_retail || ""),
                price_sale: String(product.price_sale || ""),
                price_cost: String(product.price_cost || ""),
                description: product.description || "",
                long_description: product.long_description || "",
                weight_g: String(product.weight_g || 0),
                videoUrl: product.video_url || "",
                isActive: product.is_active !== undefined ? Boolean(product.is_active) : true
            });

            // Map category slug to ID
            if (categories.length > 0) {
                const found = categories.find(c => c.slug === product.category_path);
                if (found) setSelectedCategoryId(found.id);
            }

            // Gallery
            try {
                const g = typeof product.gallery === 'string' ? JSON.parse(product.gallery) : product.gallery || [];
                setGallery(Array.isArray(g) ? g : [product.image].filter(Boolean));
            } catch { setGallery([]); }

            // Specs, Features, Box Items
            try {
                const s = typeof product.specifications === 'string' ? JSON.parse(product.specifications) : product.specifications || {};
                setSpecs(Object.entries(s).map(([key, value]) => ({ key, value: String(value) })));
            } catch { setSpecs([]); }
            try {
                const b = typeof product.whats_included === 'string' ? JSON.parse(product.whats_included) : product.whats_included || [];
                setBoxItems(Array.isArray(b) ? b : []);
            } catch { setBoxItems([]); }
            try {
                const f = typeof product.features === 'string' ? JSON.parse(product.features) : product.features || [];
                setFeatures(Array.isArray(f) ? f : []);
            } catch { setFeatures([]); }

            try {
                const vars = typeof product.variations === 'string' ? JSON.parse(product.variations) : product.variations || {};
                const vPrices = typeof product.variation_prices === 'string' ? JSON.parse(product.variation_prices) : product.variation_prices || {};
                const vSalePrices = typeof product.variation_sale_prices === 'string' ? JSON.parse(product.variation_sale_prices) : product.variation_sale_prices || {};

                const groups: VariationGroup[] = Object.entries(vars).map(([groupName, options]: [string, any]) => {
                    const opts: VariationOption[] = (Array.isArray(options) ? options : [options]).map(optName => {
                        return { name: String(optName) };
                    });
                    return { name: groupName, options: opts };
                });
                setVariationGroups(groups);

                // Set variantPrices
                const vPricesStrRecord: Record<string, string> = {};
                for (const [k, v] of Object.entries(vPrices)) {
                    vPricesStrRecord[k] = String(v);
                }
                setVariantPrices(vPricesStrRecord);

                // Set variantSalePrices
                const vSalePricesStrRecord: Record<string, string> = {};
                for (const [k, v] of Object.entries(vSalePrices)) {
                    vSalePricesStrRecord[k] = String(v);
                }
                setVariantSalePrices(vSalePricesStrRecord);
            } catch { setVariationGroups([]); setVariantPrices({}); setVariantSalePrices({}); }
        }
    }, [product, categories]);

    const addGroup = () => {
        setVariationGroups([...variationGroups, { name: "", options: [{ name: "" }] }]);
    };

    const removeGroup = (index: number) => {
        setVariationGroups(variationGroups.filter((_, i) => i !== index));
    };

    const updateGroupName = (index: number, name: string) => {
        const next = [...variationGroups];
        next[index].name = name;
        setVariationGroups(next);
    };

    const addOption = (groupIndex: number) => {
        const next = [...variationGroups];
        next[groupIndex].options.push({ name: "" });
        setVariationGroups(next);
    };

    const removeOption = (groupIndex: number, optionIndex: number) => {
        const next = [...variationGroups];
        next[groupIndex].options = next[groupIndex].options.filter((_, i) => i !== optionIndex);
        setVariationGroups(next);
    };

    const updateOption = (groupIndex: number, optionIndex: number, field: keyof VariationOption, val: string) => {
        const next = [...variationGroups];
        next[groupIndex].options[optionIndex][field] = val;
        setVariationGroups(next);
    };

    async function handleSubmit() {
        if (!product) return;
        setLoading(true);
        setError(null);

        // Build variations_raw string: "Color=Red,Blue; Size=S,M"
        const variationsRaw = variationGroups
            .filter(g => g.name && g.options.some(o => o.name))
            .map(g => `${g.name}=${g.options.filter(o => o.name).map(o => o.name).join(',')}`)
            .join('; ');

        // Parse variations to generate expected combinations
        const vars: Record<string, string[]> = {};
        if (variationsRaw) {
            variationsRaw.split(';').forEach(part => {
                const [key, valStr] = part.split('=').map(s => s.trim());
                if (key && valStr) {
                    vars[key] = Array.from(new Set(valStr.split(',').map(s => s.trim()).filter(Boolean)));
                }
            });
        }
        
        const entries = Object.entries(vars).sort((a, b) => a[0].localeCompare(b[0]));
        let expectedCombos: string[] = [];
        if (entries.length > 0) {
            const generate = (index: number, current: string[]) => {
                if (index === entries.length) return [current.join('; ')];
                const [key, values] = entries[index];
                const vals = Array.isArray(values) ? values : [values];
                const res: string[] = [];
                for (const val of vals) {
                    res.push(...generate(index + 1, [...current, `${key}:${val}`]));
                }
                return res;
            };
            expectedCombos = generate(0, []);
        }

        const resolveValue = (obj: Record<string, any>, rawCombo: string) => {
            if (!obj) return undefined;
            if (obj[rawCombo] !== undefined) return obj[rawCombo];
            const normalizedCombo = rawCombo.replace(/\s/g, '');
            const matchedKey = Object.keys(obj).find(k => k.replace(/\s/g, '') === normalizedCombo);
            return matchedKey ? obj[matchedKey] : undefined;
        };

        // Build variation_prices and variation_sale_prices based on variants
        const variationPricesObj: Record<string, number> = {};
        for (const combo of expectedCombos) {
            const priceStr = resolveValue(variantPrices, combo);
            const p = parseFloat(priceStr || "");
            if (isNaN(p) || p <= 0) {
                setError(`Please enter a valid price for variation: ${combo}`);
                setLoading(false);
                return;
            }
            variationPricesObj[combo] = p;
        }

        const variationSalePricesObj: Record<string, number> = {};
        for (const combo of expectedCombos) {
            const priceStr = resolveValue(variantSalePrices, combo);
            const sp = parseFloat(priceStr || "");
            if (!isNaN(sp) && sp > 0) variationSalePricesObj[combo] = sp;
        }

        const specsObj = specs.reduce((acc, curr) => {
            if (curr.key && curr.value) acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        const data = {
            ...basicInfo,
            category: selectedCategoryId,
            variations_raw: variationsRaw,
            variation_prices: variationPricesObj,
            variation_sale_prices: variationSalePricesObj,
            specifications: JSON.stringify(specsObj),
            whats_included: JSON.stringify(boxItems.filter(i => i.trim())),
            features: JSON.stringify(features.filter(f => f.trim())),
            gallery: gallery,
            is_active: basicInfo.isActive
        };

        try {
            const result = await updateProduct(product.id, data);
            if (result.error) {
                setError(result.error);
            } else {
                onSuccess();
            }
        } catch (error) {
            console.error(error);
            setError("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    }

    if (!product) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn(
                "transition-all duration-300",
                step === 1 ? "sm:max-w-[800px]" : "sm:max-w-[600px]",
                "max-h-[90vh] overflow-y-auto"
            )}>
                <DialogHeader>
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex gap-2">
                            <div className={cn("h-2 w-8 rounded-full", step >= 1 ? "bg-blue-600" : "bg-slate-200")} />
                            <div className={cn("h-2 w-8 rounded-full", step >= 2 ? "bg-blue-600" : "bg-slate-200")} />
                            <div className={cn("h-2 w-8 rounded-full", step >= 3 ? "bg-blue-600" : "bg-slate-200")} />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Step {step} of 3</span>
                    </div>
                    <DialogTitle>Edit Product: {product.name}</DialogTitle>
                    <DialogDescription>
                        {step === 1 && "Update basic info, images, and category."}
                        {step === 2 && "Manage product variation groups and types."}
                        {step === 3 && "Manage specific prices and stock for combinations."}
                    </DialogDescription>
                </DialogHeader>

                {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded mb-4">{error}</div>}

                {step === 1 && (
                    <div className="space-y-6 py-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                            <label className="block text-sm font-medium text-slate-700">Product Images</label>
                            <ImageUpload value={gallery} onChange={setGallery} onRemove={(url) => setGallery(gallery.filter(g => g !== url))} />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Product Name *</label>
                                    <Input value={basicInfo.name} onChange={e => setBasicInfo({ ...basicInfo, name: e.target.value })} />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">SKU *</label>
                                    <Input value={basicInfo.sku} onChange={e => setBasicInfo({ ...basicInfo, sku: e.target.value })} />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Category *</label>
                                    <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                                        <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                                        <SelectContent>
                                            {categories.map(cat => (
                                                <SelectItem key={cat.id} value={cat.id}>{cat.parent_id ? `— ${cat.name}` : cat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2 text-sm font-medium">
                                        <label>Base Price *</label>
                                        <Input type="number" value={basicInfo.price} onChange={e => setBasicInfo({ ...basicInfo, price: e.target.value })} />
                                    </div>
                                    <div className="grid gap-2 text-sm font-medium">
                                        <label>Sale Price</label>
                                        <Input type="number" value={basicInfo.price_sale} onChange={e => setBasicInfo({ ...basicInfo, price_sale: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Short Description</label>
                                    <textarea
                                        className="h-24 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                                        value={basicInfo.description}
                                        onChange={e => setBasicInfo({ ...basicInfo, description: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2 text-sm font-medium">
                                    <label>Weight (g)</label>
                                    <Input type="number" value={basicInfo.weight_g} onChange={e => setBasicInfo({ ...basicInfo, weight_g: e.target.value })} />
                                </div>
                                <div className="flex items-center gap-2 pt-2">
                                    <Switch checked={basicInfo.isActive} onCheckedChange={v => setBasicInfo({ ...basicInfo, isActive: v })} />
                                    <span className="text-sm font-medium">Product is Active</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 py-4">
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-800">Variation Groups & Specific Prices</h3>
                            {variationGroups.map((group, gIdx) => (
                                <div key={gIdx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 relative group">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                                        onClick={() => removeGroup(gIdx)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>

                                    <div className="grid gap-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Variation Type</label>
                                        <Input
                                            placeholder="e.g. Color, Size"
                                            className="bg-white"
                                            value={group.name}
                                            onChange={e => updateGroupName(gIdx, e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Options</label>
                                        {group.options.map((opt, oIdx) => (
                                            <div key={oIdx} className="flex gap-2 items-center">
                                                <Input
                                                    placeholder="Option"
                                                    className="flex-1 bg-white h-9 text-sm"
                                                    value={opt.name}
                                                    onChange={e => updateOption(gIdx, oIdx, 'name', e.target.value)}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-slate-300 hover:text-red-500"
                                                    onClick={() => removeOption(gIdx, oIdx)}
                                                    disabled={group.options.length === 1}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="w-full h-8 border-dashed border-slate-300 text-slate-500 hover:text-blue-600 bg-white"
                                            onClick={() => addOption(gIdx)}
                                        >
                                            <Plus className="h-3 w-3 mr-2" /> Add Option
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full py-6 border-dashed border-slate-300 bg-white hover:bg-slate-50"
                                onClick={addGroup}
                            >
                                <Plus className="h-4 w-4 mr-2" /> Add Variation Group
                            </Button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 py-4">
                        <VariationStockManager
                            product={product}
                            variationsRaw={variationGroups
                                .filter(g => g.name && g.options.some(o => o.name))
                                .map(g => `${g.name}=${g.options.filter(o => o.name).map(o => o.name).join(',')}`)
                                .join('; ')}
                            prices={variantPrices}
                            salePrices={variantSalePrices}
                            onPriceChange={(combo, price) => setVariantPrices(prev => ({ ...prev, [combo]: price }))}
                            onSalePriceChange={(combo, price) => setVariantSalePrices(prev => ({ ...prev, [combo]: price }))}
                            basePrice={basicInfo.price}
                        />
                    </div>
                )}

                <DialogFooter className="pt-6 border-t mt-4">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <div className="flex-1" />
                    {step > 1 && (
                        <Button variant="secondary" onClick={() => setStep(step - 1)} className="gap-2">
                            <ArrowLeft className="h-4 w-4" /> Back
                        </Button>
                    )}
                    {step < 3 ? (
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-6 font-bold shadow-blue-200"
                            onClick={() => setStep(step + 1)}
                        >
                            {step === 1 ? "Next: Variations" : "Next: Prices & Stock"} <ArrowRight className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            className="bg-green-600 hover:bg-green-700 text-white gap-2 px-8 font-bold"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? "Saving..." : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

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
import { createProduct } from "@/server-actions/admin/inventory";
import ImageUpload from "@/components/admin/ImageUpload";
import { cn } from "@/lib/utils";

interface AddProductDialogProps {
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

export default function AddProductDialog({ open, onOpenChange, onSuccess }: AddProductDialogProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<{ id: string, name: string, slug: string, parent_id: string | null }[]>([]);

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
        initialStock: "0",
        weight_g: "0",
        videoUrl: "",
        isActive: true
    });

    const [gallery, setGallery] = useState<string[]>([]);
    const [specs, setSpecs] = useState<{ key: string, value: string }[]>([]);
    const [boxItems, setBoxItems] = useState<string[]>([]);
    const [features, setFeatures] = useState<string[]>([]);

    // Variations State
    const [variationGroups, setVariationGroups] = useState<VariationGroup[]>([]);
    const [variantPrices, setVariantPrices] = useState<Record<string, string>>({});
    const [variantSalePrices, setVariantSalePrices] = useState<Record<string, string>>({});
    const [variantStocks, setVariantStocks] = useState<Record<string, string>>({});

    // Generated combinations
    const [combinations, setCombinations] = useState<string[]>([]);

    useEffect(() => {
        // Generate combinations when moving to step 3
        if (step === 3) {
            const validGroups = variationGroups.filter(g => g.name.trim() && g.options.some(o => o.name.trim()));
            if (validGroups.length === 0) {
                setCombinations([]);
                return;
            }

            const generate = (index: number, current: string[]) => {
                if (index === validGroups.length) return [current.join('; ')];
                const group = validGroups[index];
                const validOptions = group.options.filter(o => o.name.trim());
                if (validOptions.length === 0) return generate(index + 1, current); // Should not happen due to filter above, but safe

                const res: string[] = [];
                for (const opt of validOptions) {
                    res.push(...generate(index + 1, [...current, `${group.name.trim()}:${opt.name.trim()}`]));
                }
                return res;
            };

            const combos = generate(0, []);
            setCombinations(combos);
        }
    }, [step, variationGroups]);

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
            // Reset wizard on open
            setStep(1);
            setBasicInfo({
                name: "", sku: "", category: "", price: "", price_sale: "", price_cost: "",
                description: "", long_description: "", initialStock: "0", weight_g: "0",
                videoUrl: "", isActive: true
            });
            setGallery([]);
            setSpecs([]);
            setBoxItems([]);
            setFeatures([]);
            setVariationGroups([]);
            setVariantPrices({});
            setVariantSalePrices({});
            setVariantStocks({});
            setError(null);
        }
    }, [open]);

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
        setLoading(true);
        setError(null);

        // Build variations_raw string: "Color=Red,Blue; Size=S,M"
        const variationsRaw = variationGroups
            .filter(g => g.name && g.options.some(o => o.name))
            .map(g => `${g.name}=${g.options.filter(o => o.name).map(o => o.name).join(',')}`)
            .join('; ');

        // Build variation_prices, variation_sale_prices, and variant_stocks based on combinations
        const variationPricesObj: Record<string, number> = {};
        const variationSalePricesObj: Record<string, number> = {};
        const variantStocksObj: Record<string, number> = {};

        for (const combo of combinations) {
            const p = parseFloat(variantPrices[combo] || "");
            if (isNaN(p) || p <= 0) {
                setError(`Please enter a valid price for variation: ${combo}`);
                setLoading(false);
                return;
            }
            variationPricesObj[combo] = p;

            const sp = parseFloat(variantSalePrices[combo] || "");
            if (!isNaN(sp) && sp > 0) variationSalePricesObj[combo] = sp;

            const s = parseInt(variantStocks[combo] || "");
            if (isNaN(s) || s < 0) {
                setError(`Please enter a valid initial stock for variation: ${combo}`);
                setLoading(false);
                return;
            }
            variantStocksObj[combo] = s;
        }

        const specsObj = specs.reduce((acc, curr) => {
            if (curr.key && curr.value) acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        const data = {
            ...basicInfo,
            variations_raw: variationsRaw,
            variation_prices: variationPricesObj,
            variation_sale_prices: variationSalePricesObj,
            variant_stocks: variantStocksObj,
            specifications: JSON.stringify(specsObj),
            whats_included: JSON.stringify(boxItems.filter(i => i.trim())),
            features: JSON.stringify(features.filter(f => f.trim())),
            gallery: gallery,
            is_active: basicInfo.isActive
        };

        try {
            const result = await createProduct(data);
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
                    <DialogTitle>
                        {step === 1 && "Basic Product Details"}
                        {step === 2 && "Variation Types"}
                        {step === 3 && "Prices & Stock Options"}
                    </DialogTitle>
                    <DialogDescription>
                        {step === 1 && "Provide the core information, images, and category for this product."}
                        {step === 2 && "Add variation groups like Size or Color, and their options."}
                        {step === 3 && "Set optional specific prices and initial stock for each combination."}
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
                                    <Input value={basicInfo.name} onChange={e => setBasicInfo({ ...basicInfo, name: e.target.value })} placeholder="e.g. 5kW Hybrid Inverter" />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">SKU *</label>
                                    <Input value={basicInfo.sku} onChange={e => setBasicInfo({ ...basicInfo, sku: e.target.value })} placeholder="INV-5K-01" />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Category *</label>
                                    <Select value={basicInfo.category} onValueChange={v => setBasicInfo({ ...basicInfo, category: v })}>
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
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2 text-sm font-medium">
                                        <label>Initial Stock</label>
                                        <Input type="number" value={basicInfo.initialStock} onChange={e => setBasicInfo({ ...basicInfo, initialStock: e.target.value })} />
                                    </div>
                                    <div className="grid gap-2 text-sm font-medium">
                                        <label>Weight (g)</label>
                                        <Input type="number" value={basicInfo.weight_g} onChange={e => setBasicInfo({ ...basicInfo, weight_g: e.target.value })} />
                                    </div>
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
                                            placeholder="e.g. Color, Size, Capacity"
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
                                                    placeholder="Option (e.g. Red)"
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
                                            className="w-full h-8 border-dashed border-slate-300 text-slate-500 hover:text-blue-600 hover:border-blue-300 bg-white"
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
                                <Plus className="h-4 w-4 mr-2" /> Add Variation Group (Size, Color, etc.)
                            </Button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 py-4">
                        {combinations.length === 0 ? (
                            <div className="p-8 text-center bg-slate-50 border border-slate-200 border-dashed rounded-xl">
                                <p className="text-slate-500 text-sm">No variations added. You can skip this step.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 text-xs text-slate-500 font-bold uppercase border-b border-slate-200">
                                            <tr>
                                                <th className="px-4 py-3">Variant Combination</th>
                                                <th className="px-4 py-3 w-52">Price (LKR)</th>
                                                <th className="px-4 py-3 w-52">Sale Price (LKR)</th>
                                                <th className="px-4 py-3 w-32">Initial Stock</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {combinations.map((combo, idx) => (
                                                <tr key={combo} className={idx !== combinations.length - 1 ? "border-b border-slate-100" : ""}>
                                                    <td className="px-4 py-3 font-medium text-slate-800">{combo}</td>
                                                    <td className="px-4 py-2">
                                                        <Input
                                                            type="number"
                                                            placeholder={basicInfo.price || "Base Price"}
                                                            className="h-9 bg-white"
                                                            value={variantPrices[combo] || ""}
                                                            onChange={e => setVariantPrices(prev => ({ ...prev, [combo]: e.target.value }))}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <Input
                                                            type="number"
                                                            placeholder={basicInfo.price_sale || "Sale Price"}
                                                            className="h-9 bg-white"
                                                            value={variantSalePrices[combo] || ""}
                                                            onChange={e => setVariantSalePrices(prev => ({ ...prev, [combo]: e.target.value }))}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <Input
                                                            type="number"
                                                            placeholder="0"
                                                            className="h-9 bg-white"
                                                            value={variantStocks[combo] || ""}
                                                            onChange={e => setVariantStocks(prev => ({ ...prev, [combo]: e.target.value }))}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 flex items-start gap-3">
                                    <div className="bg-amber-500 text-white rounded-full p-1 mt-0.5">
                                        <Plus className="h-3 w-3" />
                                    </div>
                                    <p className="text-xs text-amber-900 leading-relaxed">
                                        <strong>Note:</strong> Price and Initial Stock are mandatory for all variations.
                                    </p>
                                </div>
                            </div>
                        )}
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
                            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 h-11 px-6 font-bold shadow-lg shadow-blue-200"
                            onClick={() => {
                                if (!basicInfo.name || !basicInfo.sku || !basicInfo.category || !basicInfo.price) {
                                    setError("Name, SKU, Category, and Price are required.");
                                    return;
                                }
                                setStep(step + 1);
                            }}
                        >
                            {step === 1 ? "Next: Variations" : "Next: Prices & Stock"} <ArrowRight className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            className="bg-green-600 hover:bg-green-700 text-white gap-2 h-11 px-8 font-bold shadow-lg shadow-green-200"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? "Creating..." : <><Save className="h-4 w-4 mr-2" /> Create Product</>}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

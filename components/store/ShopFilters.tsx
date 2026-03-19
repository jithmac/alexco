"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronUp, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShopFiltersProps {
    categories: { name: string; slug: string }[];
    priceRange: { min: number; max: number };
    selectedCategory?: string;
    selectedPriceRange?: [number, number];
    sortBy?: string;
    onFilterChange: (filters: {
        category?: string;
        minPrice?: number;
        maxPrice?: number;
        sortBy?: string;
    }) => void;
    onClearFilters: () => void;
}

export default function ShopFilters({
    categories,
    priceRange,
    selectedCategory,
    selectedPriceRange,
    sortBy,
    onFilterChange,
    onClearFilters
}: ShopFiltersProps) {
    const [expandedSections, setExpandedSections] = useState({
        category: true,
        price: true,
        sort: false
    });

    const [localPriceRange, setLocalPriceRange] = useState<[number, number]>(
        selectedPriceRange || [priceRange.min, priceRange.max]
    );

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleCategoryChange = (slug: string) => {
        onFilterChange({ category: selectedCategory === slug ? undefined : slug });
    };

    const handlePriceApply = () => {
        onFilterChange({ minPrice: localPriceRange[0], maxPrice: localPriceRange[1] });
    };

    const handleSortChange = (sort: string) => {
        onFilterChange({ sortBy: sort });
    };

    const hasActiveFilters = selectedCategory || selectedPriceRange;

    return (
        <div className="bg-white border rounded-xl p-4 sticky top-20 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <Filter className="h-4 w-4" /> Filters
                </h3>
                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-red-500 h-8">
                        <X className="h-3 w-3 mr-1" /> Clear
                    </Button>
                )}
            </div>

            <Separator />

            {/* Categories */}
            <div>
                <button
                    onClick={() => toggleSection('category')}
                    className="w-full flex items-center justify-between py-2 font-semibold text-sm"
                >
                    Categories
                    {expandedSections.category ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {expandedSections.category && (
                    <div className="space-y-2 mt-2 max-h-[200px] overflow-y-auto">
                        {categories.map((cat) => (
                            <div key={cat.slug} className="flex items-center space-x-2">
                                <Checkbox
                                    id={cat.slug}
                                    checked={selectedCategory === cat.slug}
                                    onCheckedChange={() => handleCategoryChange(cat.slug)}
                                />
                                <Label
                                    htmlFor={cat.slug}
                                    className={cn(
                                        "text-sm cursor-pointer",
                                        selectedCategory === cat.slug && "font-semibold text-blue-600"
                                    )}
                                >
                                    {cat.name}
                                </Label>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Separator />

            {/* Price Range */}
            <div>
                <button
                    onClick={() => toggleSection('price')}
                    className="w-full flex items-center justify-between py-2 font-semibold text-sm"
                >
                    Price Range
                    {expandedSections.price ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {expandedSections.price && (
                    <div className="mt-4 space-y-4">
                        <Slider
                            value={localPriceRange}
                            onValueChange={(val: number[]) => setLocalPriceRange(val as [number, number])}
                            min={priceRange.min}
                            max={priceRange.max}
                            step={100}
                            className="w-full"
                        />
                        <div className="flex items-center justify-between text-sm text-slate-600">
                            <span>LKR {localPriceRange[0].toLocaleString()}</span>
                            <span>LKR {localPriceRange[1].toLocaleString()}</span>
                        </div>
                        <Button size="sm" className="w-full" onClick={handlePriceApply}>
                            Apply Price Filter
                        </Button>
                    </div>
                )}
            </div>

            <Separator />

            {/* Sort */}
            <div>
                <button
                    onClick={() => toggleSection('sort')}
                    className="w-full flex items-center justify-between py-2 font-semibold text-sm"
                >
                    Sort By
                    {expandedSections.sort ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {expandedSections.sort && (
                    <div className="space-y-2 mt-2">
                        {[
                            { value: 'name', label: 'Name A-Z' },
                            { value: 'price_asc', label: 'Price: Low to High' },
                            { value: 'price_desc', label: 'Price: High to Low' },
                            { value: 'newest', label: 'Newest First' }
                        ].map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => handleSortChange(opt.value)}
                                className={cn(
                                    "w-full text-left text-sm px-3 py-2 rounded-md transition-colors",
                                    sortBy === opt.value
                                        ? "bg-blue-50 text-blue-700 font-medium"
                                        : "hover:bg-slate-50"
                                )}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

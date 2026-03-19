"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function SearchBar({ className }: { className?: string }) {
    const [query, setQuery] = useState("");
    const router = useRouter();

    const handleSearch = () => {
        if (!query.trim()) return;
        router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className={`relative ${className}`}>
            <Input
                type="search"
                placeholder="Search for products, brands, or SKU..."
                className="w-full pl-4 pr-12 h-11 rounded-full border-slate-200 bg-slate-50 focus:bg-white transition-colors"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            <Button
                size="icon"
                onClick={handleSearch}
                className="absolute right-1 top-1 h-9 w-9 rounded-full bg-blue-600 hover:bg-blue-700"
            >
                <Search className="h-4 w-4" />
            </Button>
        </div>
    );
}

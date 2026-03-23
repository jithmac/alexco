"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Smartphone, Laptop, Tv, Speaker, Home, Watch, Gamepad2, Wifi, Cpu, Sun, Zap, Battery, Lightbulb, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStoreCategories, StoreCategory } from "@/server-actions/store/categories";

// Map generic icons to category names (simple heuristic)
const iconMap: Record<string, any> = {
    "solar": Sun,
    "electrical": Zap,
    "batteries": Battery,
    "lighting": Lightbulb,
    "smart": Smartphone,
    "computers": Laptop,
};

export default function MegaMenu() {
    const [categories, setCategories] = useState<StoreCategory[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    // Dynamic Hover State
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [hoverLeft, setHoverLeft] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        getStoreCategories().then(setCategories);
    }, []);

    const getIcon = (slug: string) => {
        const key = Object.keys(iconMap).find(k => slug.includes(k));
        return key ? iconMap[key] : Home;
    };

    const checkScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 4);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    };

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        checkScroll();
        el.addEventListener("scroll", checkScroll, { passive: true });
        const ro = new ResizeObserver(checkScroll);
        ro.observe(el);
        return () => {
            el.removeEventListener("scroll", checkScroll);
            ro.disconnect();
        };
    }, [categories]);

    const scroll = (dir: "left" | "right") => {
        scrollRef.current?.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
    };

    const handleEnter = (catId: string, e: React.MouseEvent) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setActiveCategory(catId);
        
        if (containerRef.current && e.currentTarget) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const itemRect = e.currentTarget.getBoundingClientRect();
            let leftPos = itemRect.left - containerRect.left;
            
            // Prevent overflowing the right side for the 800px max dropdown box
            const dropdownWidth = window.innerWidth >= 1024 ? 800 : 600;
            const maxLeft = containerRect.width - dropdownWidth;
            if (leftPos > maxLeft && maxLeft > 0) {
               leftPos = maxLeft;
            }
            // Add a small safety margin 
            if (leftPos < 0) leftPos = 0;
            
            setHoverLeft(leftPos);
        }
    };

    const handleLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setActiveCategory(null);
        }, 150);
    };

    return (
        <div className="bg-white border-b border-slate-200 hidden md:block" onMouseLeave={handleLeave}>
            <div className="container mx-auto px-4 relative" ref={containerRef}>

                {/* Left fade + scroll button */}
                {canScrollLeft && (
                    <>
                        <div className="pointer-events-none absolute left-4 top-0 h-full w-16 bg-gradient-to-r from-white to-transparent z-10" />
                        <button
                            onClick={() => scroll("left")}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-7 w-7 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-colors"
                            aria-label="Scroll categories left"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                    </>
                )}

                {/* Scrollable nav strip */}
                <div
                    ref={scrollRef as any}
                    className="relative w-full overflow-x-auto scrollbar-hide flex-nowrap flex items-center h-12"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
                >
                    <div className="flex-nowrap w-max justify-start items-center flex">
                        <Link
                            href="/shop"
                            onMouseEnter={() => {
                                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                                setActiveCategory(null);
                            }}
                            className="group inline-flex h-12 w-max items-center justify-center rounded-none px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-50 focus:bg-slate-50 focus:outline-none text-slate-600 whitespace-nowrap"
                        >
                            All Products
                        </Link>
                        {categories.map((category) => {
                            const isActive = activeCategory === category.id;
                            return (
                                <button
                                    key={category.id}
                                    onMouseEnter={(e) => handleEnter(category.id, e)}
                                    onClick={() => window.location.href = `/shop?category=${category.slug}`}
                                    className={cn(
                                        "group inline-flex h-12 w-max items-center justify-center rounded-none px-4 py-2 text-sm font-medium transition-colors text-slate-600 whitespace-nowrap",
                                        isActive ? "bg-slate-50 text-slate-900" : "hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                                    )}
                                >
                                    {category.name}
                                    <ChevronDown
                                        className={cn(
                                            "relative top-[1px] ml-1 h-3 w-3 transition duration-200",
                                            isActive && "rotate-180"
                                        )}
                                        aria-hidden="true"
                                    />
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Dropdown rendered outside the scrolled div */}
                {activeCategory && (
                    <div 
                        className="absolute top-full z-[100] pt-0"
                        style={{ left: hoverLeft }}
                        onMouseEnter={() => {
                            if (timeoutRef.current) clearTimeout(timeoutRef.current);
                        }}
                    >
                        {categories.map(category => {
                            if (category.id !== activeCategory) return null;
                            const Icon = getIcon(category.slug);
                            return (
                                <div key={category.id} className="grid w-[600px] gap-3 p-4 md:w-[600px] lg:w-[800px] bg-white rounded-b-md rounded-tr-md border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                                    <div className="row-span-3">
                                        <Link
                                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-slate-100 to-slate-200 p-6 no-underline outline-none focus:shadow-md"
                                            href={`/shop?category=${category.slug}`}
                                            onClick={() => setActiveCategory(null)}
                                        >
                                            {category.image ? (
                                                <div className="relative h-12 w-12 rounded-md overflow-hidden mb-3 border border-slate-100">
                                                    <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white mb-2">
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                            )}
                                            <div className="mb-2 mt-2 text-lg font-medium text-slate-900">{category.name}</div>
                                            <p className="text-sm leading-tight text-slate-600">{category.description || `Explore our wide range of ${category.name.toLowerCase()} products.`}</p>
                                        </Link>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {category.children && category.children.map((sub) => (
                                            <Link
                                                key={sub.id}
                                                href={`/shop?category=${sub.slug}`}
                                                onClick={() => setActiveCategory(null)}
                                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100"
                                            >
                                                <div className="text-sm font-medium leading-none text-slate-900">{sub.name}</div>
                                            </Link>
                                        ))}
                                        <Link
                                            href={`/shop?category=${category.slug}`}
                                            onClick={() => setActiveCategory(null)}
                                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-blue-50 focus:bg-blue-50 mt-2 col-span-2"
                                        >
                                            <div className="text-sm font-medium leading-none text-blue-600">View All {category.name} →</div>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Right fade + scroll button */}
                {canScrollRight && (
                    <>
                        <div className="pointer-events-none absolute right-4 top-0 h-full w-16 bg-gradient-to-l from-white to-transparent z-10" />
                        <button
                            onClick={() => scroll("right")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-7 w-7 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-colors"
                            aria-label="Scroll categories right"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

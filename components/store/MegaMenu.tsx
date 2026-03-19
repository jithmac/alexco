"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Smartphone, Laptop, Tv, Speaker, Home, Watch, Gamepad2, Wifi, Cpu, Sun, Zap, Battery, Lightbulb } from "lucide-react";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
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

    return (
        <div className="bg-white border-b border-slate-200 hidden md:block">
            <div className="container mx-auto px-4 relative">

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
                <NavigationMenu className="max-w-none justify-start w-full">
                    <NavigationMenuList
                        ref={scrollRef as any}
                        className="flex-nowrap overflow-x-auto scrollbar-hide w-full justify-start"
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                    >
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild>
                                <Link
                                    href="/shop"
                                    className="group inline-flex h-12 w-max items-center justify-center rounded-none px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-50 focus:bg-slate-50 focus:outline-none text-slate-600 whitespace-nowrap"
                                >
                                    All Products
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                        {categories.map((category) => {
                            const Icon = getIcon(category.slug);
                            return (
                                <NavigationMenuItem key={category.id}>
                                    <NavigationMenuTrigger className="bg-transparent hover:bg-slate-50 text-slate-600 font-medium h-12 rounded-none px-4 whitespace-nowrap">
                                        {category.name}
                                    </NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <div className="grid w-[600px] gap-3 p-4 md:w-[600px] md:grid-cols-2 lg:w-[800px] bg-white">
                                            <div className="row-span-3">
                                                <Link
                                                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-slate-100 to-slate-200 p-6 no-underline outline-none focus:shadow-md"
                                                    href={`/shop?category=${category.slug}`}
                                                >
                                                    {category.image ? (
                                                        <div className="relative h-12 w-12 rounded-md overflow-hidden mb-3 border border-slate-100">
                                                            <img
                                                                src={category.image}
                                                                alt={category.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white mb-2">
                                                            <Icon className="h-4 w-4" />
                                                        </div>
                                                    )}
                                                    <div className="mb-2 mt-2 text-lg font-medium text-slate-900">
                                                        {category.name}
                                                    </div>
                                                    <p className="text-sm leading-tight text-slate-600">
                                                        {category.description || `Explore our wide range of ${category.name.toLowerCase()} products.`}
                                                    </p>
                                                </Link>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {category.children && category.children.map((sub) => (
                                                    <Link
                                                        key={sub.id}
                                                        href={`/shop?category=${sub.slug}`}
                                                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100"
                                                    >
                                                        <div className="text-sm font-medium leading-none text-slate-900">{sub.name}</div>
                                                    </Link>
                                                ))}
                                                <Link
                                                    href={`/shop?category=${category.slug}`}
                                                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-blue-50 focus:bg-blue-50 mt-2 col-span-2"
                                                >
                                                    <div className="text-sm font-medium leading-none text-blue-600">View All {category.name} →</div>
                                                </Link>
                                            </div>
                                        </div>
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                            );
                        })}
                    </NavigationMenuList>
                </NavigationMenu>

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

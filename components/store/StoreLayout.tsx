"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, Search, User, Heart, X, Home, ShoppingBag, Wrench, MapPin, Phone, ChevronDown, ChevronRight, Layers } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";

import CartSheet from "./CartSheet";
import TopBar from "./TopBar";
import MegaMenu from "./MegaMenu";
import SearchBar from "./SearchBar";
import { getStoreCategories, StoreCategory } from "@/server-actions/store/categories";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [categories, setCategories] = useState<StoreCategory[]>([]);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    useEffect(() => {
        getStoreCategories().then(setCategories);
    }, []);

    const mobileNavLinks = [
        { href: "/", label: "Home", icon: Home },
        { href: "/shop", label: "All Products", icon: ShoppingBag },
        { href: "/track-order", label: "Track Order", icon: Search },
        { href: "/about", label: "About Us", icon: Wrench },
        { href: "/contact", label: "Contact", icon: Phone },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
            {/* 1. Top Utility Bar */}
            <TopBar />

            {/* 2. Main Header (Sticky) */}
            <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm">
                <div className="container mx-auto px-4 h-14 md:h-20 flex items-center justify-between gap-4 md:gap-8">

                    {/* Mobile Menu & Logo */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                        {/* Mobile Menu Sheet */}
                        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[280px] p-0">
                                <SheetHeader className="p-4 border-b">
                                    <SheetTitle className="flex items-center gap-2">
                                        <Image src="/logo.png" alt="Alexco" width={32} height={32} className="h-8 w-auto" />
                                        <span>Alexco Electronics</span>
                                    </SheetTitle>
                                </SheetHeader>
                                <nav className="flex flex-col p-4">
                                    {mobileNavLinks.map((link) => (
                                        <SheetClose asChild key={link.href}>
                                            <Link
                                                href={link.href}
                                                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-slate-100 transition-colors text-slate-700"
                                            >
                                                <link.icon className="h-5 w-5 text-blue-600" />
                                                <span className="font-medium">{link.label}</span>
                                            </Link>
                                        </SheetClose>
                                    ))}
                                </nav>

                                {/* Categories Section */}
                                {categories.length > 0 && (
                                    <div className="border-t px-4 py-3">
                                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">Categories</h3>
                                        <div className="space-y-1">
                                            {categories.map((cat) => (
                                                <div key={cat.id}>
                                                    <div className="flex items-center">
                                                        <SheetClose asChild>
                                                            <Link
                                                                href={`/shop?category=${cat.slug}`}
                                                                className="flex-1 flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-700"
                                                            >
                                                                <Layers className="h-4 w-4 text-slate-400" />
                                                                <span className="font-medium text-sm">{cat.name}</span>
                                                            </Link>
                                                        </SheetClose>
                                                        {cat.children && cat.children.length > 0 && (
                                                            <button
                                                                onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                                                                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"
                                                            >
                                                                {expandedCategory === cat.id ? (
                                                                    <ChevronDown className="h-4 w-4" />
                                                                ) : (
                                                                    <ChevronRight className="h-4 w-4" />
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                    {expandedCategory === cat.id && cat.children && (
                                                        <div className="ml-6 pl-4 border-l border-slate-200 space-y-0.5 mt-1 mb-2">
                                                            {cat.children.map((sub) => (
                                                                <SheetClose asChild key={sub.id}>
                                                                    <Link
                                                                        href={`/shop?category=${sub.slug}`}
                                                                        className="block px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                                                                    >
                                                                        {sub.name}
                                                                    </Link>
                                                                </SheetClose>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="border-t p-4 mt-auto">
                                    <p className="text-xs text-slate-500 text-center">© 2026 Alexco Technologies</p>
                                </div>
                            </SheetContent>
                        </Sheet>

                        <Link href="/" className="flex items-center gap-2">
                            <Image src="/logo.png" alt="Alexco Electronics" width={40} height={40} className="h-10 w-auto object-contain" />
                            <span className="font-bold text-2xl tracking-tight text-slate-900 hidden sm:block">
                                Alexco <span className="text-blue-600">Electronics</span>
                            </span>
                        </Link>
                    </div>

                    {/* Search Bar (Centered & Wide) */}
                    <div className="hidden md:flex flex-1 max-w-2xl relative px-8">
                        <SearchBar className="w-full" />
                    </div>

                    {/* Actions (Right) */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/*
                        <Button variant="ghost" size="icon" className="hidden md:flex flex-col gap-0.5 h-auto py-1 px-2 hover:bg-transparent hover:text-blue-600">
                            <User className="h-5 w-5" />
                            <span className="text-[10px] font-medium">Account</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="hidden md:flex flex-col gap-0.5 h-auto py-1 px-2 hover:bg-transparent hover:text-blue-600">
                            <Heart className="h-5 w-5" />
                            <span className="text-[10px] font-medium">Wishlist</span>
                        </Button>
*/}
                        <div className="flex flex-col items-center justify-center px-2">
                            <CartSheet />
                            <span className="text-[10px] font-medium hidden md:block">Cart</span>
                        </div>
                    </div>
                </div>

                {/* 3. Mega Menu (Desktop Only) */}
                <MegaMenu />
            </header>

            {/* Mobile Search Bar */}
            <div className="md:hidden bg-white border-b border-slate-100 px-4 py-2">
                <SearchBar className="w-full" />
            </div>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-4 md:py-8">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-300">
                {/* Newsletter Section */}


                {/* Main Footer Content */}
                <div className="container mx-auto px-4 py-8 md:py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 md:gap-8">
                    <div className="col-span-1 sm:col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <Image src="/logo.png" alt="Alexco Electronics" width={40} height={40} className="h-10 w-auto object-contain" />
                            <span className="font-bold text-2xl text-white">Alexco <span className="text-blue-500">Electronics</span></span>
                        </Link>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Your trusted partner for solar energy solutions and electrical components in Sri Lanka.
                        </p>
                        {/* Social Links */}
                        <div className="flex gap-3 mt-4">
                            {['📘', '📸', '🐦', '📺'].map((icon, i) => (
                                <button key={i} className="h-9 w-9 rounded-full bg-slate-800 hover:bg-blue-600 transition-colors flex items-center justify-center text-sm">
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-4">Shop</h4>
                        <ul className="space-y-2.5 text-sm">
                            <li><Link href="/shop" className="hover:text-white transition-colors">All Products</Link></li>
                            <li><Link href="/shop?category=Solar" className="hover:text-white transition-colors">Solar Systems</Link></li>
                            <li><Link href="/shop?category=Electrical" className="hover:text-white transition-colors">Electrical</Link></li>
                            <li><Link href="/shop?sortBy=newest" className="hover:text-white transition-colors">New Arrivals</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-4">Support</h4>
                        <ul className="space-y-2.5 text-sm">
                            <li><Link href="/track-order" className="hover:text-white transition-colors">Track Order</Link></li>
                            <li><Link href="/policies/warranty" className="hover:text-white transition-colors">Warranty Policy</Link></li>
                            <li><Link href="/policies/returns" className="hover:text-white transition-colors">Returns & Refunds</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-4">Company</h4>
                        <ul className="space-y-2.5 text-sm">
                            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="/policies/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            <li><Link href="/policies/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/paths/admin" className="hover:text-white transition-colors">Admin Portal</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-4">Contact</h4>
                        <div className="text-sm text-slate-400 space-y-3">
                            <p className="flex items-start gap-2">
                                <span>📍</span>
                                <span>123 Main Street, Colombo 03, Sri Lanka</span>
                            </p>
                            <p className="flex items-center gap-2">
                                <span>📞</span>
                                <span>+94 11 234 5678</span>
                            </p>
                            <p className="flex items-center gap-2">
                                <span>✉️</span>
                                <span>sales@alexco.lk</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-slate-800">
                    <div className="container mx-auto px-4 py-4 md:py-6 flex flex-col md:flex-row items-center justify-between gap-3">
                        <p className="text-xs md:text-sm text-slate-500">© 2026 Alexco Technologies. All rights reserved.</p>
                        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 text-xs md:text-sm text-slate-500">
                            <span className="flex items-center gap-1">🔒 Secure Payments</span>
                            <span className="flex items-center gap-1">🚚 Islandwide Delivery</span>
                            <span className="flex items-center gap-1">✅ Quality Guaranteed</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

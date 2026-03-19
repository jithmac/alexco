"use client";

import React, { useState, useEffect } from "react";
import ProductGrid from "./ProductGrid";
import CheckoutDialog from "./CheckoutDialog";
import OrderHistorySheet from "./OrderHistorySheet";
import CartSidebar from "./CartSidebar";
import POSReceipt from "./POSReceipt";
import PrintPortal from "./PrintPortal";
import { Trash2, Plus, Minus, ShoppingCart, Printer, History, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSalesOrder } from "@/server-actions/pos/orders";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface CartItem {
    cartItemId: string; // Unique ID for this cart entry
    id: string; // Product ID
    sku: string;
    name: string;
    price: number;
    quantity: number;
    variations?: Record<string, string>;
}

export default function POSInterface() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [lastOrderNumber, setLastOrderNumber] = useState<string | null>(null);
    const [printOrder, setPrintOrder] = useState<any>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isCartSheetOpen, setIsCartSheetOpen] = useState(false); // Mobile cart sheet state
    const { toast } = useToast();

    const addToCart = (product: any, quantity: number = 1, variations: Record<string, string> = {}, resolvedPrice?: number) => {
        const priceToUse = resolvedPrice ?? product.price;
        setCart(prev => {
            const existing = prev.find(item =>
                item.id === product.id &&
                JSON.stringify(item.variations || {}) === JSON.stringify(variations)
            );

            if (existing) {
                return prev.map(item =>
                    item.cartItemId === existing.cartItemId
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                return [...prev, {
                    cartItemId: crypto.randomUUID(),
                    id: product.id,
                    sku: product.sku,
                    name: product.name,
                    price: priceToUse,
                    quantity: quantity,
                    variations: variations
                }];
            }
        });
        toast({
            title: "Added to cart",
            description: `${product.name} added.`,
            duration: 1500,
        });
    };

    const updateQuantity = (cartItemId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.cartItemId === cartItemId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const removeFromCart = (cartItemId: string) => {
        setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
    };

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const taxRate = 0; // Assuming inclusive for now, or 0 if separate
    const total = subtotal;

    const handlePrint = (order: any) => {
        setPrintOrder(order);
        // Wait for render then print
        setTimeout(() => {
            window.print();
        }, 500);
    };

    const handleCheckoutComplete = async (method: string, tenderAmount?: number) => {
        try {
            const { v4: uuidv4 } = await import("uuid");
            const { getDatabase, syncOrdersOutbox } = await import("@/lib/pos/SyncService");

            const orderId = uuidv4();
            const timestamp = Date.now();

            const orderDoc = {
                id: orderId,
                items: cart.map(i => ({
                    productId: i.id,
                    quantity: i.quantity,
                    price: i.price,
                    variations: i.variations
                })),
                total: total,
                timestamp: timestamp,
                synced: false
            };

            // 1. Save to Local DB
            const db = await getDatabase();
            await db.orders.insert(orderDoc);

            // 2. Clear UI immediately (Optimistic)
            toast({
                title: "Sale Completed",
                description: `Order saved locally. Printing...`,
            });

            // Trigger Print with full details
            const printDoc = {
                ...orderDoc,
                order_number: "PENDING-" + orderId.slice(0, 8),
                items: cart.map(i => ({ ...i, line_total: i.price * i.quantity })),
                created_at: timestamp,
                payment_method: method,
                total_amount: total
            };
            handlePrint(printDoc);

            setCart([]);
            setLastOrderNumber("PENDING-" + orderId.slice(0, 8)); // Valid order number comes after sync, but we need something temporarily
            setIsCheckoutOpen(false);
            setIsCartSheetOpen(false);

            // 3. Trigger Background Sync
            syncOrdersOutbox().then(() => {
                toast({
                    title: "Synced",
                    description: "Order pushed to server successfully.",
                });
            }).catch(err => {
                console.error("Sync failed, will retry later:", err);
                toast({
                    title: "Offline Mode",
                    description: "Order saved locally. Will sync when online.",
                    variant: "default" // Not an error, just offline status
                });
            });

        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to save order locally.",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden relative print:h-auto print:overflow-visible print:bg-white">
            <style jsx global>{`
                /* Print styles are now handled globally in globals.css targeting #print-root */
            `}</style>
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full print:hidden">
                <header className="bg-white border-b px-4 py-3 md:px-6 md:py-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <h1 className="text-lg md:text-xl font-bold text-slate-800">POS Terminal</h1>
                        {lastOrderNumber && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-2 bg-slate-100 border-slate-200 text-slate-600 hover:text-blue-600 hidden md:flex"
                                onClick={() => printOrder ? handlePrint(printOrder) : window.open(`/paths/POS/print/${lastOrderNumber}`, '_blank')}
                            >
                                <Printer className="h-4 w-4" /> Last Receipt
                            </Button>
                        )}
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-2"
                            onClick={() => setIsHistoryOpen(true)}
                        >
                            <History className="h-4 w-4" /> <span className="hidden sm:inline">History</span>
                        </Button>

                        {/* Mobile Cart Toggle */}
                        <div className="lg:hidden">
                            <Sheet open={isCartSheetOpen} onOpenChange={setIsCartSheetOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="icon" className="h-8 w-8 relative">
                                        <ShoppingCart className="h-4 w-4" />
                                        {cart.length > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                                {cart.length}
                                            </span>
                                        )}
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-full sm:w-[400px] p-0 border-l">
                                    <CartSidebar
                                        cart={cart}
                                        onRemove={removeFromCart}
                                        onUpdateQuantity={updateQuantity}
                                        onCheckout={() => setIsCheckoutOpen(true)}
                                        subtotal={subtotal}
                                        total={total}
                                        className="h-full border-none shadow-none"
                                    />
                                </SheetContent>
                            </Sheet>
                        </div>

                        <div className="text-sm text-slate-500 hidden sm:block">
                            {new Date().toLocaleDateString()}
                        </div>
                    </div>
                </header>

                {/* Product Grid Area */}
                <div className="flex-1 overflow-hidden relative">
                    <ProductGrid onAddToCart={addToCart} />

                    {/* Floating Mobile Checkout Bar (Visible only on mobile when cart has items) */}
                    <div className="lg:hidden absolute bottom-4 left-4 right-4 z-20">
                        {cart.length > 0 && (
                            <Button
                                size="lg"
                                className="w-full shadow-xl bg-slate-900 border-t border-slate-800 text-white flex justify-between px-6 py-6 rounded-xl hover:bg-slate-800 transition-all animate-in slide-in-from-bottom-4"
                                onClick={() => setIsCartSheetOpen(true)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-slate-800 px-2 py-1 rounded text-xs font-bold text-slate-300">
                                        {cart.length} ITEMS
                                    </div>
                                    <span className="font-medium">View Cart</span>
                                </div>
                                <div className="font-bold text-lg">
                                    LKR {total.toLocaleString()}
                                </div>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Desktop Cart Sidebar (Hidden on mobile) */}
            <div className="hidden lg:block w-[400px] h-full z-10 print:hidden">
                <CartSidebar
                    cart={cart}
                    onRemove={removeFromCart}
                    onUpdateQuantity={updateQuantity}
                    onCheckout={() => setIsCheckoutOpen(true)}
                    subtotal={subtotal}
                    total={total}
                />
            </div>

            <CheckoutDialog
                open={isCheckoutOpen}
                onOpenChange={setIsCheckoutOpen}
                total={total}
                onComplete={handleCheckoutComplete}
            />
            <OrderHistorySheet
                open={isHistoryOpen}
                onOpenChange={setIsHistoryOpen}
            />

            {/* Hidden Print Area via Portal */}
            {printOrder && (
                <PrintPortal>
                    <POSReceipt order={printOrder} />
                </PrintPortal>
            )}
        </div>
    );
}

"use client";

import React from "react";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CartItem {
    cartItemId: string;
    id: string;
    sku: string;
    name: string;
    price: number;
    quantity: number;
    variations?: Record<string, string>;
}

interface CartSidebarProps {
    cart: CartItem[];
    onRemove: (cartItemId: string) => void;
    onUpdateQuantity: (cartItemId: string, delta: number) => void;
    onCheckout: () => void;
    subtotal: number;
    total: number;
    className?: string; // Allow custom styling/classes
}

export default function CartSidebar({
    cart,
    onRemove,
    onUpdateQuantity,
    onCheckout,
    subtotal,
    total,
    className = ""
}: CartSidebarProps) {
    return (
        <div className={`flex flex-col h-full bg-white border-l border-slate-200 shadow-xl ${className}`}>
            <div className="p-4 bg-slate-50 border-b flex items-center gap-2 text-slate-700 font-semibold">
                <ShoppingCart className="h-5 w-5" />
                Current Order ({cart.length})
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                    <div className="text-center text-slate-400 mt-20">
                        <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>Cart is empty</p>
                    </div>
                ) : cart.map((item) => (
                    <div key={item.cartItemId} className="flex gap-3 p-3 bg-white rounded-lg border border-slate-100 shadow-sm transition-all hover:border-blue-100">
                        <div className="flex-1">
                            <div className="font-medium text-slate-900 line-clamp-1">{item.name}</div>
                            <div className="text-xs text-slate-500 font-mono mb-1">{item.sku}</div>
                            
                            {/* Variations Display */}
                            {item.variations && Object.keys(item.variations).length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {Object.entries(item.variations).map(([k, v]) => (
                                        <span key={k} className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-md border border-blue-100 font-medium">
                                            {k}: {v}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="text-sm font-bold text-blue-600">LKR {item.price.toLocaleString()}</div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500" onClick={() => onRemove(item.cartItemId)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <div className="flex items-center gap-2 bg-slate-100 rounded-md p-0.5">
                                <button
                                    className="h-7 w-7 flex items-center justify-center hover:bg-white rounded-md transition-colors"
                                    onClick={() => onUpdateQuantity(item.cartItemId, -1)}
                                >
                                    <Minus className="h-3 w-3" />
                                </button>
                                <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                                <button
                                    className="h-7 w-7 flex items-center justify-center hover:bg-white rounded-md transition-colors"
                                    onClick={() => onUpdateQuantity(item.cartItemId, 1)}
                                >
                                    <Plus className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Totals Section */}
            <div className="p-6 bg-slate-50 border-t space-y-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>LKR {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Tax</span>
                        <span>Included</span>
                    </div>
                </div>
                <div className="flex justify-between items-end border-t border-slate-200 pt-4">
                    <span className="text-lg font-bold text-slate-900">Total</span>
                    <span className="text-2xl font-bold text-blue-600">LKR {total.toLocaleString()}</span>
                </div>

                <Button
                    size="lg"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                    disabled={cart.length === 0}
                    onClick={onCheckout}
                >
                    Checkout
                </Button>
            </div>
        </div>
    );
}

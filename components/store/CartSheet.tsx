"use client";

import { ShoppingCart, Trash2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

import Link from "next/link";
import { useCart } from "@/hooks/use-cart";

export default function CartSheet() {
    const { items, total, removeItem, updateQuantity, clearCart } = useCart();

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {items.length > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center">
                            {items.length}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col h-[100dvh] w-full sm:max-w-md p-0">
                <SheetHeader className="flex flex-row items-center justify-between px-6 pt-6 pb-2 flex-shrink-0">
                    <SheetTitle>Shopping Cart ({items.length})</SheetTitle>
                    {items.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={clearCart} className="text-red-500 hover:text-red-700 h-8 text-xs">
                            Clear
                        </Button>
                    )}
                </SheetHeader>

                <div className="flex-1 overflow-y-auto min-h-0 px-6 py-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <ShoppingCart className="h-12 w-12 mb-2 opacity-50" />
                            <p>Your cart is empty</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {items.map((item, idx) => (
                                <div key={item.id + '-' + idx} className="flex gap-4">
                                    <div className="h-16 w-16 bg-slate-100 rounded-md relative overflow-hidden flex-shrink-0">
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                                unoptimized={item.image.startsWith('/uploads')}
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">No Image</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>
                                        {item.variations && (
                                            <div className="text-[10px] text-slate-500 mt-0.5 space-x-1">
                                                {Object.entries(item.variations).map(([k, v]) => (
                                                    <span key={k} className="bg-slate-100 px-1 rounded">{k}: {v}</span>
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between mt-2">
                                            <p className="text-sm font-bold">LKR {(item.price * item.quantity).toLocaleString()}</p>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="h-7 w-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors"
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="h-7 w-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="h-7 w-7 rounded-md flex items-center justify-center text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors ml-1"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex-shrink-0 border-t bg-white px-6 py-4 space-y-3">
                    <div className="flex items-center justify-between font-bold text-lg">
                        <span>Subtotal</span>
                        <span>LKR {total.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-slate-500 text-center">Shipping & taxes calculated at checkout</p>
                    <SheetFooter>
                        <SheetClose asChild>
                            <Link href="/shop/checkout" className="w-full">
                                <Button className="w-full h-12 text-lg" disabled={items.length === 0}>
                                    Checkout
                                </Button>
                            </Link>
                        </SheetClose>
                    </SheetFooter>
                </div>
            </SheetContent>
        </Sheet>
    );
}

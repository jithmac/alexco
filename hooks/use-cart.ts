"use client";

import { useState, useEffect } from "react";

export interface CartItem {
    id: string; // Composite ID: productId + variations string
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    variations?: Record<string, string>;
}

// Event to sync across components
const CART_UPDATED_EVENT = "cart-updated";

export const useCart = () => {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    const loadCart = () => {
        try {
            const stored = localStorage.getItem("cart");
            if (stored) {
                setItems(JSON.parse(stored));
            } else {
                setItems([]);
            }
        } catch (e) {
            console.error("Failed to parse cart", e);
            setItems([]);
        }
        setIsInitialized(true);
    };

    useEffect(() => {
        loadCart();

        const handleStorage = (e: StorageEvent) => {
            if (e.key === "cart") loadCart();
        };

        const handleCustomEvent = () => loadCart();

        window.addEventListener("storage", handleStorage);
        window.addEventListener(CART_UPDATED_EVENT, handleCustomEvent);

        return () => {
            window.removeEventListener("storage", handleStorage);
            window.removeEventListener(CART_UPDATED_EVENT, handleCustomEvent);
        };
    }, []);

    const saveCart = (newItems: CartItem[]) => {
        setItems(newItems);
        localStorage.setItem("cart", JSON.stringify(newItems));
        window.dispatchEvent(new Event(CART_UPDATED_EVENT));
    };

    const addItem = (item: CartItem) => {
        // If caller didn't provide a composite ID, generate one if variations exist
        let finalItem = { ...item };

        // If id is just product ID (UUID likely), and we have variations, append them
        if (item.variations && Object.keys(item.variations).length > 0) {
            // Sort keys for consistency
            const varString = Object.entries(item.variations)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([k, v]) => `${k}=${v}`)
                .join('|');

            // If item.id is the product ID (usual case from ProductActions), create composite
            // We assume if it looks like a UUID, it's a product ID.
            if (!item.id.includes('|')) {
                finalItem.id = `${item.id}|${varString}`;
                finalItem.productId = item.id;
            }
        } else {
            // No variations, ensure productId is set if missing
            if (!finalItem.productId) finalItem.productId = finalItem.id;
        }

        const existing = items.find(i => i.id === finalItem.id);
        let newItems;
        if (existing) {
            newItems = items.map(i => i.id === finalItem.id ? { ...i, quantity: i.quantity + finalItem.quantity } : i);
        } else {
            newItems = [...items, finalItem];
        }
        saveCart(newItems);
    };

    const removeItem = (id: string) => {
        saveCart(items.filter(i => i.id !== id));
    };

    const updateQuantity = (id: string, qty: number) => {
        if (qty <= 0) {
            removeItem(id);
            return;
        }
        saveCart(items.map(i => i.id === id ? { ...i, quantity: qty } : i));
    };

    const clearCart = () => {
        setItems([]);
        localStorage.removeItem("cart");
        window.dispatchEvent(new Event(CART_UPDATED_EVENT));
    };

    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return {
        items,
        total,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isInitialized
    };
};
